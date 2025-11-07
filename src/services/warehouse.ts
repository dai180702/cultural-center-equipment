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
import { Device, DeviceFormData } from "./devices";

// Add device to warehouse
export const addDeviceToWarehouse = async (
  deviceData: DeviceFormData,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
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
    const deviceRef = doc(db, "warehouse", id);
    await updateDoc(deviceRef, {
      ...deviceData,
      updatedAt: new Date(),
      updatedBy: userId || "Không xác định",
      updatedByName: userName || "Không xác định",
    });
  } catch (error) {
    console.error("Error updating warehouse device: ", error);
    throw new Error("Không thể cập nhật thiết bị trong kho. Vui lòng thử lại.");
  }
};

// Delete warehouse device
export const deleteWarehouseDevice = async (id: string): Promise<void> => {
  try {
    const deviceRef = doc(db, "warehouse", id);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error("Error deleting warehouse device: ", error);
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
    
    // Update location to mark as in use (remove "Kho")
    let newLocation = deviceData.location || "";
    if (newLocation.toLowerCase().includes("kho")) {
      newLocation = newLocation.replace(/kho/gi, "").trim() || "Đang sử dụng";
    } else {
      newLocation = "Đang sử dụng";
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

    // Delete from warehouse
    await deleteWarehouseDevice(warehouseDeviceId);

    return newDeviceId;
  } catch (error) {
    console.error("Error moving device from warehouse to devices: ", error);
    throw new Error("Không thể chuyển thiết bị từ kho sang quản lý. Vui lòng thử lại.");
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
        } as Device);
      }
    });

    return devices;
  } catch (error) {
    console.error("Error searching warehouse devices: ", error);
    throw new Error("Không thể tìm kiếm thiết bị trong kho. Vui lòng thử lại.");
  }
};

