import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

export interface Device {
  id?: string; // ID duy nhất của thiết bị (tự động tạo bởi Firestore)
  name: string; // Tên thiết bị
  code: string; // Mã thiết bị
  category: string; // Danh mục thiết bị
  brand: string; // Thương hiệu
  model: string; // Model thiết bị
  serialNumber: string; // Số serial
  purchaseDate: string; // Ngày mua
  warrantyExpiry: string; // Ngày hết hạn bảo hành
  status: "active" | "maintenance" | "broken" | "retired"; // Trạng thái thiết bị
  location: string; // Vị trí đặt thiết bị
  department: string; // Phòng ban sử dụng
  assignedTo?: string; // Người được giao thiết bị
  description?: string; // Mô tả thiết bị
  specifications?: string; // Thông số kỹ thuật
  purchasePrice?: number | null; // Giá mua
  supplier?: string; // Nhà cung cấp
  maintenanceSchedule?: string; // Lịch bảo trì
  lastMaintenance?: string; // Lần bảo trì cuối
  nextMaintenance?: string; // Lần bảo trì tiếp theo
  notes?: string; // Ghi chú
  createdAt: Date; // Ngày tạo thiết bị
  updatedAt: Date; // Ngày cập nhật cuối
  createdBy: string; // UID người tạo thiết bị
  createdByName?: string; // Tên người tạo thiết bị
  updatedBy?: string; // UID người cập nhật cuối
  updatedByName?: string; // Tên người cập nhật cuối
}

// Interface định nghĩa cấu trúc dữ liệu form để thêm/sửa thiết bị
export interface DeviceFormData {
  name: string; // Tên thiết bị
  code: string; // Mã thiết bị
  category: string; // Danh mục thiết bị
  brand: string; // Thương hiệu
  model: string; // Model
  serialNumber: string; // Số serial
  purchaseDate: string; // Ngày mua
  warrantyExpiry: string; // Ngày hết hạn bảo hành
  status: "active" | "maintenance" | "broken" | "retired"; // Trạng thái thiết bị
  location: string; // Vị trí đặt thiết bị
  department: string; // Phòng ban sử dụng
  assignedTo?: string; // Người được giao thiết bị
  description?: string; // Mô tả thiết bị
  specifications?: string; // Thông số kỹ thuật
  purchasePrice?: number | null; // Giá mua
  supplier?: string; // Nhà cung cấp
  maintenanceSchedule?: string; // Lịch bảo trì
  lastMaintenance?: string; // Lần bảo trì cuối
  nextMaintenance?: string; // Lần bảo trì tiếp theo
  notes?: string; // Ghi chú
}

// Add new device
export const addDevice = async (
  deviceData: DeviceFormData, // Dữ liệu thiết bị từ form
  userId: string, // UID của người dùng đang tạo thiết bị
  userName?: string // Tên hiển thị của người dùng (không bắt buộc)
): Promise<string> => {
  try {
    const cleanedData = Object.fromEntries(
      Object.entries(deviceData).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    ) as Partial<DeviceFormData>;

    const device = {
      ...cleanedData,
      createdAt: new Date(), // Ngày tạo thiết bị
      updatedAt: new Date(), // Ngày cập nhật (ban đầu = ngày tạo)
      createdBy: userId, // UID người tạo
      createdByName: userName || "Người dùng", // Tên người tạo (mặc định là "Người dùng")
    };

    // Thêm thiết bị vào collection "devices" và trả về ID
    const docRef = await addDoc(collection(db, "devices"), device);
    return docRef.id;
  } catch (error) {
    console.error("Error adding device: ", error);
    throw new Error("Không thể thêm thiết bị. Vui lòng thử lại.");
  }
};

// Get all devices
export const getDevices = async (): Promise<Device[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "devices"));
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to Date
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Device);
    });

    return devices;
  } catch (error) {
    console.error("Error getting devices: ", error);
    throw new Error("Không thể lấy danh sách thiết bị. Vui lòng thử lại.");
  }
};

// Get device by ID
export const getDeviceById = async (id: string): Promise<Device | null> => {
  try {
    const docRef = doc(db, "devices", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore Timestamp to Date
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Device;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting device: ", error);
    throw new Error("Không thể lấy thông tin thiết bị. Vui lòng thử lại.");
  }
};

// Update device
export const updateDevice = async (
  id: string,
  deviceData: Partial<DeviceFormData>,
  userId?: string,
  userName?: string
): Promise<void> => {
  try {
    const deviceRef = doc(db, "devices", id);
    await updateDoc(deviceRef, {
      ...deviceData, // Dữ liệu thiết bị được cập nhật
      updatedAt: new Date(), // Cập nhật thời gian sửa đổi
      updatedBy: userId || "Không xác định", // UID người cập nhật
      updatedByName: userName || "Không xác định", // Tên người cập nhật
    });
  } catch (error) {
    console.error("Error updating device: ", error);
    throw new Error("Không thể cập nhật thiết bị. Vui lòng thử lại.");
  }
};

// Delete device
export const deleteDevice = async (id: string): Promise<void> => {
  try {
    const deviceRef = doc(db, "devices", id);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error("Error deleting device: ", error);
    throw new Error("Không thể xóa thiết bị. Vui lòng thử lại.");
  }
};

// Get devices by status
export const getDevicesByStatus = async (
  status: Device["status"]
): Promise<Device[]> => {
  try {
    const q = query(
      collection(db, "devices"),
      where("status", "==", status)
      // Removed orderBy to avoid index requirement
    );

    const querySnapshot = await getDocs(q);
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data(),
      } as Device);
    });

    return devices;
  } catch (error) {
    console.error("Error getting devices by status: ", error);
    throw new Error(
      "Không thể lấy danh sách thiết bị theo trạng thái. Vui lòng thử lại."
    );
  }
};

// Get devices by category
export const getDevicesByCategory = async (
  category: string
): Promise<Device[]> => {
  try {
    const q = query(
      collection(db, "devices"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data(),
      } as Device);
    });

    return devices;
  } catch (error) {
    console.error("Error getting devices by category: ", error);
    throw new Error(
      "Không thể lấy danh sách thiết bị theo danh mục. Vui lòng thử lại."
    );
  }
};

// Search devices
export const searchDevices = async (searchTerm: string): Promise<Device[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "devices"));
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
          // Convert Firestore Timestamp to Date
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Device);
      }
    });

    return devices;
  } catch (error) {
    console.error("Error searching devices: ", error);
    throw new Error("Không thể tìm kiếm thiết bị. Vui lòng thử lại.");
  }
};

// Get devices with pagination
export const getDevicesWithPagination = async (
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  devices: Device[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    let q = query(
      collection(db, "devices"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data(),
      } as Device);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      devices,
      lastDoc: lastVisible || null,
    };
  } catch (error) {
    console.error("Error getting devices with pagination: ", error);
    throw new Error("Không thể lấy danh sách thiết bị. Vui lòng thử lại.");
  }
};
