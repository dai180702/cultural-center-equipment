"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Drawer, Typography, useTheme } from "@mui/material";
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
} from "@mui/icons-material";
import { getUserByEmail } from "@/services/users";

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
  const [usersMenuOpen, setUsersMenuOpen] = useState(true);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

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
    if (pathname.startsWith("/maintenance")) setMaintenanceMenuOpen(true);
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
        setCurrentUserRole(profile?.role || null);
      } catch {
        // ignore
      }
    })();
  }, [currentUser?.email]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  const isHomeActive = pathname === "/" || pathname?.startsWith("/dashboard");
  const isDevicesActive = pathname?.startsWith("/devices");
  const isInventoryActive =
    pathname?.startsWith("/inventory") || pathname?.startsWith("/warehouse");
  const isMaintenanceActive = pathname?.startsWith("/maintenance");
  const isReportsActive = pathname?.startsWith("/reports");
  const isUsersActive = pathname?.startsWith("/users");
  const isNotificationsActive = pathname?.startsWith("/notifications");

  const SidebarContent = () => (
    <Box
      sx={{
        width: 280,
        bgcolor: "primary.main",
        color: "white",
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Tiêu đề */}
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Thiết bị
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên
        </Typography>
      </Box>

      {/* Hồ sơ người dùng */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          mb: 4,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          P
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="medium">
            Minh Đại
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Người dùng
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
            {currentUser?.email}
          </Typography>
        </Box>
      </Box>

      {/* Menu điều hướng - Có thể cuộn */}
      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isHomeActive ? "rgba(255,255,255,0.2)" : undefined,
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Trang chủ
          </Button>

          <Button
            fullWidth
            startIcon={<DevicesIcon />}
            endIcon={devicesMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setDevicesMenuOpen(!devicesMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isDevicesActive ? "rgba(255,255,255,0.1)" : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Quản lý thiết bị
          </Button>
          {devicesMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/devices")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Danh sách thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BuildIcon />}
                onClick={() => router.push("/devices/maintenance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Bảo trì thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => router.push("/devices/status")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Trạng thái thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => router.push("/devices/reports")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Báo cáo thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<WarningIcon />}
                onClick={() => router.push("/devices/issues")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Sự cố thiết bị
              </Button>
            </Box>
          )}

          <Button
            fullWidth
            startIcon={<InventoryIcon />}
            endIcon={
              inventoryMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isInventoryActive ? "rgba(255,255,255,0.1)" : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Kho thiết bị
          </Button>
          {inventoryMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/warehouse")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Danh sách kho thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/inventory/stock")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Tồn kho
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/inventory/import")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Nhập kho
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<RemoveIcon />}
                onClick={() => router.push("/inventory/export")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Xuất kho
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<AssessmentIcon />}
                onClick={() => router.push("/inventory/audit")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Kiểm kê
              </Button>
            </Box>
          )}

          <Button
            fullWidth
            startIcon={<BuildIcon />}
            endIcon={
              maintenanceMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={() => setMaintenanceMenuOpen(!maintenanceMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isMaintenanceActive
                ? "rgba(255,255,255,0.1)"
                : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Lịch bảo trì
          </Button>
          {maintenanceMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<CalendarTodayIcon />}
                onClick={() => router.push("/maintenance/schedule")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Lịch trình
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BuildIcon />}
                onClick={() => router.push("/maintenance/tasks")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Công việc
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => router.push("/maintenance/completed")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Hoàn thành
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<WarningIcon />}
                onClick={() => router.push("/maintenance/overdue")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Quá hạn
              </Button>
            </Box>
          )}

          <Button
            fullWidth
            startIcon={<AssessmentIcon />}
            endIcon={reportsMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isReportsActive ? "rgba(255,255,255,0.1)" : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Báo cáo
          </Button>
          {reportsMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => router.push("/reports/performance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Hiệu suất
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<AssessmentIcon />}
                onClick={() => router.push("/reports/maintenance")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
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
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
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
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Người dùng
              </Button>
            </Box>
          )}

          <Button
            fullWidth
            startIcon={<PeopleIcon />}
            endIcon={usersMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setUsersMenuOpen(!usersMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isUsersActive ? "rgba(255,255,255,0.1)" : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Quản lý nhân viên
          </Button>
          {usersMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/users")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Danh sách
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/users/new")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Thêm mới
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => router.push("/users/roles")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Phân quyền
              </Button>
              {(currentUserRole === "director" ||
                currentUserRole === "deputy_director") && (
                <Button
                  fullWidth
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => router.push("/users/password")}
                  sx={{
                    justifyContent: "flex-start",
                    color: "white",
                    opacity: 0.9,
                    fontSize: "0.875rem",
                    py: 0.5,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Quản lý mật khẩu
                </Button>
              )}
            </Box>
          )}

          <Button
            fullWidth
            startIcon={<NotificationsIcon />}
            endIcon={
              notificationsMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: isNotificationsActive
                ? "rgba(255,255,255,0.1)"
                : undefined,
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Thông báo
          </Button>
          {notificationsMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<NotificationsIcon />}
                onClick={() => router.push("/notifications/all")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
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
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Cảnh báo
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Button
        fullWidth
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          justifyContent: "flex-start",
          color: "white",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        Đăng xuất
      </Button>
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
        <Box sx={{ width: 280, flexShrink: 0 }}>
          <SidebarContent />
        </Box>
      )}
      {/* Ẩn hiện menu mobile */}
      <Box sx={{ flex: 1, minWidth: 0, position: "relative" }}>
        {isMobile && !sidebarOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 8,
              left: 8,
              zIndex: (t) => t.zIndex.drawer + 1,
              bgcolor: "primary.main",
              borderRadius: 1,
            }}
          >
            <Button
              onClick={toggleSidebar}
              startIcon={<MenuIcon />}
              sx={{ color: "white", minWidth: 0, px: 1, py: 0.5 }}
            ></Button>
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}
