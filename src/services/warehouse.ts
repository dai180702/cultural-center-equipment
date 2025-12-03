import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Device, DeviceFormData, isDeviceCodeExists } from "./devices";

// Add device to warehouse
export const addDeviceToWarehouse = async (
  deviceData: DeviceFormData,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
    // Check if device code already exists
    const codeExists = await isDeviceCodeExists(deviceData.code);
    if (codeExists) {
      throw new Error(`Mã thiết bị "${deviceData.code}" đã tồn tại. Vui lòng sử dụng mã khác.`);
    }

    const cleanedData = Object.fromEntries(
      Object.entries(deviceData).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    ) as Partial<DeviceFormData>;

    const device = {
      ...cleanedData,
      location: cleanedData.location || "Kho", // Default location is "Kho"
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      createdByName: userName || "Người dùng",
    };

    const docRef = await addDoc(collection(db, "warehouse"), device);
    return docRef.id;
  } catch (error) {
    console.error("Error adding device to warehouse: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể thêm thiết bị vào kho. Vui lòng thử lại.");
  }
};

// Get all devices from warehouse
export const getWarehouseDevices = async (): Promise<Device[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "warehouse"));
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        transferredToWarehouseAt:
          data.transferredToWarehouseAt?.toDate?.() ||
          data.transferredToWarehouseAt,
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
      } as Device);
    });

    return devices;
  } catch (error) {
    console.error("Error getting warehouse devices: ", error);
    throw new Error("Không thể lấy danh sách thiết bị trong kho. Vui lòng thử lại.");
  }
};

// Get warehouse device by ID
export const getWarehouseDeviceById = async (id: string): Promise<Device | null> => {
  try {
    const docRef = doc(db, "warehouse", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        transferredToWarehouseAt:
          data.transferredToWarehouseAt?.toDate?.() ||
          data.transferredToWarehouseAt,
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
      } as Device;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting warehouse device: ", error);
    throw new Error("Không thể lấy thông tin thiết bị trong kho. Vui lòng thử lại.");
  }
};

// Update warehouse device
export const updateWarehouseDevice = async (
  id: string,
  deviceData: Partial<DeviceFormData>,
  userId?: string,
  userName?: string
): Promise<void> => {
  try {
    // Check if device code already exists (if code is being updated)
    if (deviceData.code) {
      const codeExists = await isDeviceCodeExists(deviceData.code, id);
      if (codeExists) {
        throw new Error(`Mã thiết bị "${deviceData.code}" đã tồn tại. Vui lòng sử dụng mã khác.`);
      }
    }

    const deviceRef = doc(db, "warehouse", id);
    await updateDoc(deviceRef, {
      ...deviceData,
      updatedAt: new Date(),
      updatedBy: userId || "Không xác định",
      updatedByName: userName || "Không xác định",
    });
  } catch (error) {
    console.error("Error updating warehouse device: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể cập nhật thiết bị trong kho. Vui lòng thử lại.");
  }
};

// Delete warehouse device (soft delete - mark as deleted)
export const deleteWarehouseDevice = async (
  id: string,
  userId?: string,
  userName?: string,
  deleteReason?: string
): Promise<void> => {
  try {
    const deviceRef = doc(db, "warehouse", id);
    await updateDoc(deviceRef, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId || "Không xác định",
      deletedByName: userName || "Không xác định",
      deleteReason: deleteReason || "",
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error deleting warehouse device: ", error);
    throw new Error("Không thể xóa thiết bị khỏi kho. Vui lòng thử lại.");
  }
};

// Hard delete warehouse device (permanently remove from database)
export const hardDeleteWarehouseDevice = async (id: string): Promise<void> => {
  try {
    const deviceRef = doc(db, "warehouse", id);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error("Error hard deleting warehouse device: ", error);
    throw new Error("Không thể xóa thiết bị khỏi kho. Vui lòng thử lại.");
  }
};

// Move device from warehouse to devices (in use)
export const moveDeviceFromWarehouseToDevices = async (
  warehouseDeviceId: string,
  userId?: string,
  userName?: string,
  department?: string
): Promise<string> => {
  try {
    // Get device from warehouse
    const warehouseDevice = await getWarehouseDeviceById(warehouseDeviceId);
    if (!warehouseDevice) {
      throw new Error("Không tìm thấy thiết bị trong kho");
    }

    // Add to devices collection
    const { id, createdAt, updatedAt, createdBy, createdByName, updatedBy, updatedByName, ...deviceData } = warehouseDevice;
    const { addDevice } = await import("./devices");
    
    // Update location - remove "Kho" and use department as location if available
    let newLocation = deviceData.location || "";
    if (newLocation.toLowerCase().includes("kho")) {
      newLocation = newLocation.replace(/kho/gi, "").trim();
    }
    
    // If location is empty after removing "Kho", use department as location
    if (!newLocation && department) {
      newLocation = department;
    } else if (!newLocation && deviceData.department) {
      newLocation = deviceData.department;
    } else if (!newLocation) {
      newLocation = "Chưa xác định";
    }

    const updatedData: DeviceFormData = {
      ...deviceData,
      location: newLocation,
      department: department || deviceData.department || "",
    } as DeviceFormData;

    const newDeviceId = await addDevice(
      updatedData,
      userId || warehouseDevice.createdBy || "Không xác định",
      userName || warehouseDevice.createdByName || "Người dùng"
    );

    // Delete from warehouse (hard delete - completely remove)
    await hardDeleteWarehouseDevice(warehouseDeviceId);

    return newDeviceId;
  } catch (error) {
    console.error("Error moving device from warehouse to devices: ", error);
    throw new Error("Không thể chuyển thiết bị từ kho sang quản lý. Vui lòng thử lại.");
  }
};

// Move device from devices (in use) to warehouse (stock entry)
export const moveDeviceFromDevicesToWarehouse = async (
  deviceId: string,
  userId?: string,
  userName?: string
): Promise<string> => {
  try {
    // Get device from devices collection
    const { getDeviceById, deleteDevice } = await import("./devices");
    const device = await getDeviceById(deviceId);
    
    if (!device) {
      throw new Error("Không tìm thấy thiết bị trong quản lý thiết bị");
    }

    // Prepare device data for warehouse
    const { id, createdAt, updatedAt, createdBy, createdByName, updatedBy, updatedByName, ...deviceData } = device;
    
    // Update location to "Kho" and clear assignedTo
    const transferTime = new Date();
    const transferUserId = userId || device.createdBy || "Không xác định";
    const transferUserName =
      userName || device.createdByName || "Người dùng";

    const warehouseData: DeviceFormData = {
      ...deviceData,
      location: "Kho",
      assignedTo: undefined, 
      transferredToWarehouseAt: transferTime.toISOString(),
      transferredToWarehouseBy: transferUserId,
      transferredToWarehouseByName: transferUserName,
    } as DeviceFormData;

    // Add to warehouse collection
    const newWarehouseId = await addDeviceToWarehouse(
      warehouseData,
      transferUserId,
      transferUserName
    );

    // Delete from devices collection
    await deleteDevice(deviceId);

    return newWarehouseId;
  } catch (error) {
    console.error("Error moving device from devices to warehouse: ", error);
    throw new Error("Không thể chuyển thiết bị từ quản lý về kho. Vui lòng thử lại.");
  }
};

// Search warehouse devices
export const searchWarehouseDevices = async (searchTerm: string): Promise<Device[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "warehouse"));
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const searchFields = [
        data.name,
        data.code,
        data.brand,
        data.model,
        data.serialNumber,
        data.location,
        data.department,
      ]
        .join(" ")
        .toLowerCase();

      if (searchFields.includes(searchTerm.toLowerCase())) {
        devices.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          transferredToWarehouseAt:
            data.transferredToWarehouseAt?.toDate?.() ||
            data.transferredToWarehouseAt,
          deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
        } as Device);
      }
    });

    return devices;
  } catch (error) {
    console.error("Error searching warehouse devices: ", error);
    throw new Error("Không thể tìm kiếm thiết bị trong kho. Vui lòng thử lại.");
  }
};

