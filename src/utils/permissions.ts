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
  canManageActionPassword: boolean;
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
      canManageActionPassword: false,
      canViewReports: false,
      canBorrowReturnDevices: false,
      canViewStatistics: false,
    };
  }

  if (role === "director" || role === "deputy_director") {
    return {
      canViewDashboard: true,
      canManageDevices: true,
      canManageWarehouse: true,
      canMaintainDevices: true,
      canManageUsers: true,
      canManageDepartments: true,
      canManageNotifications: true,
      canManagePermissions: true,
      canManageActionPassword: true,
      canViewReports: true,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

  if (role === "manager") {
    return {
      canViewDashboard: true,
      canManageDevices: true,
      canManageWarehouse: true,
      canMaintainDevices: true,
      canManageUsers: true,
      canManageDepartments: true,
      canManageNotifications: true,
      canManagePermissions: true,
      canManageActionPassword: false,
      canViewReports: true,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

  if (role === "staff") {
    return {
      canViewDashboard: true,
      canManageDevices: true,
      canManageWarehouse: false,
      canMaintainDevices: false,
      canManageUsers: false,
      canManageDepartments: false,
      canManageNotifications: false,
      canManagePermissions: false,
      canManageActionPassword: false,
      canViewReports: true,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

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
      canManageActionPassword: false,
      canViewReports: true,
      canBorrowReturnDevices: true,
      canViewStatistics: true,
    };
  }

  return {
    canViewDashboard: false,
    canManageDevices: false,
    canManageWarehouse: false,
    canMaintainDevices: false,
    canManageUsers: false,
    canManageDepartments: false,
    canManageNotifications: false,
    canManagePermissions: false,
    canManageActionPassword: false,
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
