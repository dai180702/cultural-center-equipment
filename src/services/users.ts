import { auth, db, getSecondaryAuth } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
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

export interface User {
  id?: string;
  uid?: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  status: "active" | "inactive" | "suspended";
  role: "director" | "deputy_director" | "manager" | "staff" | "technician";
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  status: "active" | "inactive" | "suspended";
  role: "director" | "deputy_director" | "manager" | "staff" | "technician";
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills?: string[];
  notes?: string;
  uid?: string;
}

export interface UserFilters {
  department?: string;
  status?: string;
  role?: string;
  search?: string;
}

export interface PaginationOptions {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

// Lấy danh sách tất cả nhân viên
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// Lấy danh sách nhân viên với phân trang
export const getUsersPaginated = async (
  options: PaginationOptions
): Promise<{
  users: User[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const usersRef = collection(db, "users");
    let q = query(
      usersRef,
      orderBy("createdAt", "desc"),
      limit(options.pageSize)
    );

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { users, lastDoc: lastVisible };
  } catch (error) {
    console.error("Error getting paginated users:", error);
    throw error;
  }
};

// Lấy nhân viên theo ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

// Lấy nhân viên theo mã nhân viên
export const getUserByEmployeeId = async (
  employeeId: string
): Promise<User | null> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user by employee ID:", error);
    throw error;
  }
};

// Lấy nhân viên theo email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as any) } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

// Lọc nhân viên theo điều kiện
export const getUsersByFilters = async (
  filters: UserFilters
): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    let q = query(usersRef, orderBy("createdAt", "desc"));

    if (filters.department) {
      q = query(q, where("department", "==", filters.department));
    }

    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }

    if (filters.role) {
      q = query(q, where("role", "==", filters.role));
    }

    const querySnapshot = await getDocs(q);
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    // Lọc theo từ khóa tìm kiếm
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm) ||
          user.employeeId.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.department.toLowerCase().includes(searchTerm) ||
          user.position.toLowerCase().includes(searchTerm)
      );
    }

    return users;
  } catch (error) {
    console.error("Error filtering users:", error);
    throw error;
  }
};

// Thêm nhân viên mới
export const addUser = async (userData: UserFormData): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const userRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });

    return userRef.id;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Tạo tài khoản đăng nhập Firebase Auth cho nhân viên
export const createAuthUser = async (
  email: string,
  password: string
): Promise<string> => {
  try {
    // Sử dụng secondary auth để không làm mất session hiện tại
    const secondaryAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    const uid = cred.user.uid;
    // Sign out secondary auth để tránh giữ session phụ
    await signOut(secondaryAuth);
    return uid;
  } catch (error) {
    console.error("Error creating auth user:", error);
    throw error;
  }
};

// Cập nhật thông tin nhân viên
export const updateUser = async (
  id: string,
  userData: Partial<UserFormData>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Xóa nhân viên
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Lấy danh sách phòng ban
export const getDepartments = async (): Promise<string[]> => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const departments = new Set<string>();
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.department) {
        departments.add(data.department);
      }
    });

    return Array.from(departments).sort();
  } catch (error) {
    console.error("Error getting departments:", error);
    throw error;
  }
};

// Lấy thống kê nhân viên
export const getUserStatistics = async () => {
  try {
    const users = await getUsers();

    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const inactiveUsers = users.filter(
      (user) => user.status === "inactive"
    ).length;
    const suspendedUsers = users.filter(
      (user) => user.status === "suspended"
    ).length;

    const roleStats = {
      director: users.filter((user) => user.role === "director").length,
      deputy_director: users.filter((user) => user.role === "deputy_director")
        .length,
      manager: users.filter((user) => user.role === "manager").length,
      staff: users.filter((user) => user.role === "staff").length,
      technician: users.filter((user) => user.role === "technician").length,
    };

    const departmentStats = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      roleStats,
      departmentStats,
    };
  } catch (error) {
    console.error("Error getting user statistics:", error);
    throw error;
  }
};
