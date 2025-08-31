import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  getUsersPaginated,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getUsersByFilters,
  getDepartments,
  getUserStatistics,
  User,
  UserFilters,
  PaginationOptions,
} from "@/services/users";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Lấy danh sách tất cả nhân viên
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải danh sách nhân viên"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách nhân viên với phân trang
  const fetchUsersPaginated = useCallback(
    async (options: PaginationOptions) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUsersPaginated(options);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Lỗi khi tải danh sách nhân viên"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Lấy nhân viên theo ID
  const fetchUserById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await getUserById(id);
      return user;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải thông tin nhân viên"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lọc nhân viên
  const filterUsers = useCallback(async (filters: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsersByFilters(filters);
      setUsers(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lọc nhân viên");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm nhân viên mới
  const createUser = useCallback(
    async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        setError(null);
        const userId = await addUser(userData);
        await fetchUsers(); // Refresh danh sách
        return userId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi thêm nhân viên");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  // Cập nhật nhân viên
  const editUser = useCallback(
    async (id: string, userData: Partial<User>) => {
      try {
        setLoading(true);
        setError(null);
        await updateUser(id, userData);
        await fetchUsers(); // Refresh danh sách
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Lỗi khi cập nhật nhân viên"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  // Xóa nhân viên
  const removeUser = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteUser(id);
        await fetchUsers(); // Refresh danh sách
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi xóa nhân viên");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers]
  );

  // Lấy danh sách phòng ban
  const fetchDepartments = useCallback(async () => {
    try {
      setError(null);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải danh sách phòng ban"
      );
    }
  }, []);

  // Lấy thống kê nhân viên
  const fetchUserStatistics = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải thống kê nhân viên"
      );
      throw err;
    }
  }, []);

  // Xóa lỗi
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  return {
    users,
    loading,
    error,
    departments,
    statistics,
    fetchUsers,
    fetchUsersPaginated,
    fetchUserById,
    filterUsers,
    createUser,
    editUser,
    removeUser,
    fetchDepartments,
    fetchUserStatistics,
    clearError,
  };
};
