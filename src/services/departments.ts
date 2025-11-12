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
} from "firebase/firestore";

export interface Department {
  id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // UID người tạo
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
}

// Lấy danh sách tất cả phòng ban
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const departmentsRef = collection(db, "departments");
    const querySnapshot = await getDocs(
      query(departmentsRef, orderBy("name", "asc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Department[];
  } catch (error) {
    console.error("Error getting departments:", error);
    throw new Error("Không thể tải danh sách phòng ban. Vui lòng thử lại.");
  }
};

// Lấy thông tin phòng ban theo ID
export const getDepartmentById = async (
  id: string
): Promise<Department | null> => {
  try {
    const departmentRef = doc(db, "departments", id);
    const docSnapshot = await getDoc(departmentRef);
    if (!docSnapshot.exists()) {
      return null;
    }
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Department;
  } catch (error) {
    console.error("Error getting department:", error);
    throw new Error("Không thể tải thông tin phòng ban. Vui lòng thử lại.");
  }
};

// Thêm phòng ban mới
export const addDepartment = async (
  departmentData: DepartmentFormData,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
    // Kiểm tra tên phòng ban đã tồn tại chưa
    const existingDepartments = await getDepartments();
    const duplicate = existingDepartments.find(
      (d) => d.name.toLowerCase() === departmentData.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error("Tên phòng ban đã tồn tại.");
    }

    const department = {
      ...departmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      createdByName: userName || "Người dùng",
    };

    const docRef = await addDoc(collection(db, "departments"), department);
    return docRef.id;
  } catch (error: any) {
    console.error("Error adding department:", error);
    throw new Error(
      error.message || "Không thể thêm phòng ban. Vui lòng thử lại."
    );
  }
};

// Cập nhật phòng ban
export const updateDepartment = async (
  id: string,
  departmentData: Partial<DepartmentFormData>,
  userId?: string,
  userName?: string
): Promise<void> => {
  try {
    // Kiểm tra tên phòng ban đã tồn tại chưa (trừ chính nó)
    if (departmentData.name) {
      const existingDepartments = await getDepartments();
      const duplicate = existingDepartments.find(
        (d) =>
          d.id !== id &&
          d.name.toLowerCase() === departmentData.name!.toLowerCase()
      );
      if (duplicate) {
        throw new Error("Tên phòng ban đã tồn tại.");
      }
    }

    const departmentRef = doc(db, "departments", id);
    await updateDoc(departmentRef, {
      ...departmentData,
      updatedAt: new Date(),
      updatedBy: userId || "Không xác định",
      updatedByName: userName || "Không xác định",
    });
  } catch (error: any) {
    console.error("Error updating department:", error);
    throw new Error(
      error.message || "Không thể cập nhật phòng ban. Vui lòng thử lại."
    );
  }
};

// Xóa phòng ban
export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    // Lấy thông tin phòng ban trước
    const department = await getDepartmentById(id);
    if (!department) {
      throw new Error("Phòng ban không tồn tại.");
    }

    // Kiểm tra xem có nhân viên nào đang sử dụng phòng ban này không
    const { getUsers } = await import("./users");
    const users = await getUsers();
    const usersInDepartment = users.filter(
      (user) => user.department && user.department === department.name
    );

    if (usersInDepartment.length > 0) {
      throw new Error(
        `Không thể xóa phòng ban này vì có ${usersInDepartment.length} nhân viên đang thuộc phòng ban này.`
      );
    }

    const departmentRef = doc(db, "departments", id);
    await deleteDoc(departmentRef);
  } catch (error: any) {
    console.error("Error deleting department:", error);
    throw new Error(
      error.message || "Không thể xóa phòng ban. Vui lòng thử lại."
    );
  }
};
