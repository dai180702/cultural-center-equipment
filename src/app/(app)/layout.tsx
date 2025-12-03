"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Drawer,
  Typography,
  useTheme,
  Container,
  Divider,
  Avatar,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Home as HomeIcon,
  DevicesOther as DevicesIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  GridView as GridViewIcon,
  Engineering as EngineeringIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  Laptop as LaptopIcon,
  List as ListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { getUserByEmail, User } from "@/services/users";
import { getPermissions, UserRole } from "@/utils/permissions";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  );

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  // open correct submenu based on path
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/devices")) setDevicesMenuOpen(true);
    if (pathname.startsWith("/inventory") || pathname.startsWith("/warehouse"))
      setInventoryMenuOpen(true);
    if (
      pathname.startsWith("/maintenance") ||
      pathname.startsWith("/devices/maintenance")
    )
      setMaintenanceMenuOpen(true);
    if (pathname.startsWith("/reports")) setReportsMenuOpen(true);
    if (pathname.startsWith("/users")) setUsersMenuOpen(true);
    if (pathname.startsWith("/notifications")) setNotificationsMenuOpen(true);
    if (pathname.startsWith("/settings")) setSettingsMenuOpen(true);
  }, [pathname]);

  useEffect(() => {
    (async () => {
      try {
        if (!currentUser?.email) return;
        const profile = await getUserByEmail(currentUser.email);
        if (profile) {
          setCurrentUserProfile(profile);
          setCurrentUserRole((profile.role as UserRole) || null);
        }
      } catch {
        // ignore
      }
    })();
  }, [currentUser?.email]);

  const permissions = getPermissions(currentUserRole);

  const getRoleText = (role: string) => {
    switch (role) {
      case "director":
        return "Giám đốc";
      case "deputy_director":
        return "Phó giám đốc";
      case "manager":
        return "Trưởng phòng";
      case "staff":
        return "Nhân viên";
      case "technician":
        return "Kỹ thuật viên";
      default:
        return role;
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  const isHomeActive = pathname === "/" || pathname?.startsWith("/dashboard");
  const isMaintenanceActive =
    pathname?.startsWith("/maintenance") ||
    pathname?.startsWith("/devices/maintenance");
  const isDevicesActive =
    pathname?.startsWith("/devices") && !isMaintenanceActive;
  const isInventoryActive =
    pathname?.startsWith("/inventory") || pathname?.startsWith("/warehouse");
  const isReportsActive = pathname?.startsWith("/reports");
  const isUsersActive = pathname?.startsWith("/users");
  const isNotificationsActive = pathname?.startsWith("/notifications");

  const SidebarContent = () => (
    <Box
      sx={{
        width: 280,
        bgcolor: "#90caf9",
        color: "#000000",
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Thiết bị
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên
        </Typography>
      </Box>

      <Box
        onClick={() => router.push("/profile")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "rgba(0,0,0,0.08)",
          borderRadius: 2,
          mb: 4,
          flexShrink: 0,
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Avatar
          src={currentUserProfile?.avatar}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#1976d2",
            fontWeight: "bold",
          }}
        >
          {currentUserProfile?.fullName?.charAt(0)?.toUpperCase() || "P"}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            {currentUserProfile?.fullName || "Người dùng"}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {currentUserProfile?.department || ""}
          </Typography>
          {currentUserProfile?.role && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, display: "block" }}
            >
              {getRoleText(currentUserProfile.role)}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Box sx={{ mb: 2 }}>
          {permissions.canViewDashboard && (
            <Button
              fullWidth
              startIcon={<HomeIcon />}
              onClick={() => router.push("/dashboard")}
              sx={{
                justifyContent: "flex-start",
                color: "#000000",
                bgcolor: isHomeActive ? "rgba(0,0,0,0.12)" : undefined,
                mb: 1,
                "&:hover": { bgcolor: "rgba(0,0,0,0.15)" },
                "& .MuiButton-endIcon": { marginLeft: "auto" },
              }}
            >
              Trang chủ
            </Button>
          )}

          {permissions.canManageDevices && (
            <>
              <Button
                fullWidth
                startIcon={<DevicesIcon />}
                endIcon={
                  devicesMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setDevicesMenuOpen(!devicesMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isDevicesActive ? "rgba(0,0,0,0.08)" : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Quản lý thiết bị
              </Button>
            </>
          )}
          {devicesMenuOpen && permissions.canManageDevices && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/devices")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Danh sách thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => router.push("/devices/reports")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Báo cáo thiết bị
              </Button>
            </Box>
          )}

          {permissions.canManageWarehouse && (
            <>
              <Button
                fullWidth
                startIcon={<InventoryIcon />}
                endIcon={
                  inventoryMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isInventoryActive ? "rgba(0,0,0,0.08)" : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Kho thiết bị
              </Button>
            </>
          )}
          {inventoryMenuOpen && permissions.canManageWarehouse && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/warehouse")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Danh sách kho thiết bị
              </Button>

              <Button
                fullWidth
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/warehouse/stock-entry")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Nhập kho
              </Button>
            </Box>
          )}

          {permissions.canMaintainDevices && (
            <>
              <Button
                fullWidth
                startIcon={<BuildIcon />}
                endIcon={
                  maintenanceMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setMaintenanceMenuOpen(!maintenanceMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isMaintenanceActive ? "rgba(0,0,0,0.08)" : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Bảo trì thiết bị
              </Button>
            </>
          )}
          {maintenanceMenuOpen && permissions.canMaintainDevices && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/devices/maintenance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: pathname?.startsWith("/devices/maintenance")
                    ? "rgba(0,0,0,0.12)"
                    : undefined,
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.15)" },
                }}
              >
                Danh sách thiết bị cần bảo trì
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<CalendarTodayIcon />}
                onClick={() => router.push("/maintenance/schedule")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Lịch trình
              </Button>
            </Box>
          )}

          {permissions.canViewReports && (
            <>
              <Button
                fullWidth
                startIcon={<AssessmentIcon />}
                endIcon={
                  reportsMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isReportsActive ? "rgba(0,0,0,0.08)" : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Báo cáo
              </Button>
            </>
          )}
          {reportsMenuOpen && permissions.canViewReports && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<AssessmentIcon />}
                onClick={() => router.push("/reports/summary")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Báo cáo tổng
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => router.push("/reports/performance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Hiệu suất
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BuildIcon />}
                onClick={() => router.push("/reports/maintenance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Bảo trì
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<InventoryIcon />}
                onClick={() => router.push("/reports/inventory")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Tồn kho
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<PeopleIcon />}
                onClick={() => router.push("/reports/users")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Người dùng
              </Button>
            </Box>
          )}

          {permissions.canManageUsers && (
            <>
              <Button
                fullWidth
                startIcon={<PeopleIcon />}
                endIcon={
                  usersMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setUsersMenuOpen(!usersMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isUsersActive ? "rgba(0,0,0,0.08)" : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Quản lý nhân viên
              </Button>
            </>
          )}
          {usersMenuOpen && permissions.canManageUsers && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/users")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Danh sách
              </Button>
              {permissions.canManageActionPassword && (
                <Button
                  fullWidth
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => router.push("/users/password")}
                  sx={{
                    justifyContent: "flex-start",
                    color: "#000000",
                    opacity: 0.9,
                    fontSize: "0.875rem",
                    py: 0.5,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                  }}
                >
                  Quản lý mật khẩu
                </Button>
              )}
            </Box>
          )}

          {permissions.canManageNotifications && (
            <>
              <Button
                fullWidth
                startIcon={<NotificationsIcon />}
                endIcon={
                  notificationsMenuOpen ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                }
                onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  bgcolor: isNotificationsActive
                    ? "rgba(0,0,0,0.08)"
                    : undefined,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
                  "& .MuiButton-endIcon": { marginLeft: "auto" },
                }}
              >
                Thông báo
              </Button>
            </>
          )}
          {notificationsMenuOpen && permissions.canManageNotifications && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<NotificationsIcon />}
                onClick={() => router.push("/notifications/all")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Tất cả
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<WarningIcon />}
                onClick={() => router.push("/notifications/alerts")}
                sx={{
                  justifyContent: "flex-start",
                  color: "#000000",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                }}
              >
                Cảnh báo
              </Button>
            </Box>
          )}

          {permissions.canBorrowReturnDevices && (
            <Button
              fullWidth
              startIcon={<DevicesIcon />}
              onClick={() => router.push("/borrow-return")}
              sx={{
                justifyContent: "flex-start",
                color: "#000000",
                mb: 1,
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              Mượn - Trả thiết bị
            </Button>
          )}

          {permissions.canManageDepartments && (
            <Button
              fullWidth
              startIcon={<PeopleIcon />}
              onClick={() => router.push("/departments")}
              sx={{
                justifyContent: "flex-start",
                color: "#000000",
                mb: 1,
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              Quản lý phòng ban
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          startIcon={<PersonIcon />}
          onClick={() => router.push("/profile")}
          sx={{
            justifyContent: "flex-start",
            color: "#1565c0",
            bgcolor: pathname === "/profile" ? "rgba(0,0,0,0.12)" : undefined,
            mb: 1,
            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          Thông tin cá nhân
        </Button>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            color: "#1565c0",
            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );

  if (!currentUser) return null;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isMobile ? (
        <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
          <SidebarContent />
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            height: "100vh",
            bgcolor: "#90caf9",
            position: "sticky",
            top: 0,
            overflow: "hidden",
          }}
        >
          <SidebarContent />
        </Box>
      )}
      {/* Ẩn hiện menu mobile */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isMobile && !sidebarOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 8,
              left: 8,
              zIndex: (t) => t.zIndex.drawer + 1,
              bgcolor: "#90caf9",
              borderRadius: 1,
            }}
          >
            <Button
              onClick={toggleSidebar}
              startIcon={<MenuIcon />}
              sx={{ color: "#1565c0", minWidth: 0, px: 1, py: 0.5 }}
            ></Button>
          </Box>
        )}
        <Box sx={{ flex: 1 }}>{children}</Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: "#90caf9",
            color: "#000000",
            p: 4,
            mt: "auto",
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 4,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Trung tâm Văn hóa Thể thao
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  & Truyền thanh
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Xã Bắc Tân Uyên, TP Hồ Chí Minh
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Liên hệ
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Điện thoại: (0274) XXX-XXXX
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Email: bactanuyen@vanhoathethao.gov.vn
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Hỗ trợ kỹ thuật
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Hotline: 1900-1900
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Email: support@vanhoathethao-bactanuyen.gov.vn
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ borderColor: "rgba(0,0,0,0.2)", my: 3 }} />
            <Typography
              variant="body2"
              sx={{ textAlign: "center", opacity: 0.8 }}
            >
              ©2025 Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên.
              Tất cả quyền được bảo lưu.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
