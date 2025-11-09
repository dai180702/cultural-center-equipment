// Utility functions for role-based access control
// Based on Use Case Diagram

export type UserRole =
  | "director"
  | "deputy_director"
  | "manager"
  | "staff"
  | "technician";

interface PermissionConfig {
  canViewDashboard: boolean;
  canManageDevices: boolean;
  canManageWarehouse: boolean;
  canMaintainDevices: boolean;
  canManageUsers: boolean;
  canManageDepartments: boolean;
  canManageNotifications: boolean;
  canManagePermissions: boolean;
  canViewReports: boolean;
  canBorrowReturnDevices: boolean;
  canViewStatistics: boolean;
}

const getPermissionsByRole = (
  role: UserRole | null | undefined
): PermissionConfig => {
  if (!role) {
    return {
      canViewDashboard: false,
      canManageDevices: false,
      canManageWarehouse: false,
      canMaintainDevices: false,
      canManageUsers: false,
      canManageDepartments: false,
      canManageNotifications: false,
      canManagePermissions: false,
      canViewReports: false,
      canBorrowReturnDevices: false,
      canViewStatistics: false,
    };
  }

  // Lãnh đạo và Trưởng phòng: có tất cả quyền
  if (role === "director" || role === "deputy_director" || role === "manager") {
    return {
      canViewDashboard: true,
      canManageDevices: true,
      canManageWarehouse: true,
      canMaintainDevices: true,
      canManageUsers: true,
      canManageDepartments: true,
      canManageNotifications: true,
      canManagePermissions: true,
      canViewReports: true,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

  // Nhân viên (staff): có quản lý thiết bị, báo cáo thống kê và mượn-trả thiết bị, nhưng không có quản lý nhân viên
  if (role === "staff") {
    return {
      canViewDashboard: true,
      canManageDevices: true, // Nhân viên có thể xem quản lý thiết bị
      canManageWarehouse: false,
      canMaintainDevices: false,
      canManageUsers: false, // Chỉ không xem được quản lý nhân viên
      canManageDepartments: false,
      canManageNotifications: false,
      canManagePermissions: false,
      canViewReports: false,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

  // Kỹ thuật viên (technician): có báo cáo thống kê, bảo trì, kho, quản lý thiết bị
  if (role === "technician") {
    return {
      canViewDashboard: true,
      canManageDevices: true,
      canManageWarehouse: true,
      canMaintainDevices: true,
      canManageUsers: false,
      canManageDepartments: false,
      canManageNotifications: false,
      canManagePermissions: false,
      canViewReports: false,
      canBorrowReturnDevices: false,
      canViewStatistics: true,
    };
  }

  // Default: không có quyền
  return {
    canViewDashboard: false,
    canManageDevices: false,
    canManageWarehouse: false,
    canMaintainDevices: false,
    canManageUsers: false,
    canManageDepartments: false,
    canManageNotifications: false,
    canManagePermissions: false,
    canViewReports: false,
    canBorrowReturnDevices: false,
    canViewStatistics: false,
  };
};

export const hasPermission = (
  role: UserRole | null | undefined,
  permission: keyof PermissionConfig
): boolean => {
  const permissions = getPermissionsByRole(role);
  return permissions[permission];
};

export const getPermissions = (
  role: UserRole | null | undefined
): PermissionConfig => {
  return getPermissionsByRole(role);
};
