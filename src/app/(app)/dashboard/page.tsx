"use client";
// trang chủ
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  IconButton,
  useTheme,
  Drawer,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getDevices, getDevicesByStatus } from "@/services/devices";
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
  Person as PersonIcon,
  GridView as GridViewIcon,
  Engineering as EngineeringIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  Laptop as LaptopIcon,
  Add as AddIcon,
  List as ListIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as RemoveIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [HomeMenuOpen, setHomeMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [statistics, setStatistics] = useState([
    {
      icon: <LaptopIcon sx={{ fontSize: 32, color: "primary.main" }} />,
      count: "0",
      label: "Tổng thiết bị",
      color: "primary.main",
    },
    {
      icon: <GridViewIcon sx={{ fontSize: 32, color: "success.main" }} />,
      count: "0",
      label: "Đang hoạt động",
      color: "success.main",
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: 32, color: "warning.main" }} />,
      count: "0",
      label: "Cần bảo trì",
      color: "warning.main",
    },
    {
      icon: <WarningIcon sx={{ fontSize: 32, color: "error.main" }} />,
      count: "0",
      label: "Đã hỏng",
      color: "error.main",
    },
    {
      icon: <DeleteIcon sx={{ fontSize: 32, color: "secondary.main" }} />,
      count: "0",
      label: "Thanh lý",
      color: "secondary.main",
    },
    {
      icon: <AddIcon sx={{ fontSize: 32, color: "info.main" }} />,
      count: "0",
      label: "Thiết bị mới trong tháng",
      color: "info.main",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: "info.main" }} />,
      count: "0",
      label: "Tổng nhân viên",
      color: "info.main",
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 32, color: "info.main" }} />,
      count: "0",
      label: "Phòng ban",
      color: "info.main",
    },
  ]);

  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser]);

  // Tải thống kê thiết bị
  useEffect(() => {
    console.log("🚀 useEffect triggered - currentUser:", currentUser?.uid);
    if (currentUser) {
      console.log("👤 User authenticated, calling loadDeviceStatistics...");
      loadDeviceStatistics();
    } else {
      console.log("❌ No user authenticated");
    }
  }, [currentUser]);

  const loadDeviceStatistics = async () => {
    try {
      setStatsLoading(true);
      console.log("🔄 Bắt đầu tải thống kê thiết bị...");
      console.log("👤 Người dùng hiện tại:", currentUser?.uid);

      let allDevices: any[] = [];
      let activeDevices: any[] = [];
      let maintenanceDevices: any[] = [];
      let brokenDevices: any[] = [];
      let retiredDevices: any[] = [];

      // Tải toàn bộ thiết bị trước
      try {
        allDevices = await getDevices();
        console.log("📱 Đã tải tất cả thiết bị:", allDevices);
      } catch (error) {
        console.error("❌ Lỗi khi tải tất cả thiết bị:", error);
        allDevices = [];
      }

      // Tải thiết bị đang hoạt động
      try {
        activeDevices = await getDevicesByStatus("active");
        console.log("✅ Đã tải thiết bị đang hoạt động:", activeDevices);
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị đang hoạt động:", error);
        activeDevices = [];
      }

      // Tải thiết bị cần bảo trì
      try {
        maintenanceDevices = await getDevicesByStatus("maintenance");
        console.log("🔧 Đã tải thiết bị cần bảo trì:", maintenanceDevices);
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị cần bảo trì:", error);
        maintenanceDevices = [];
      }

      // Tải thiết bị đã hỏng
      try {
        brokenDevices = await getDevicesByStatus("broken");
        console.log("❗ Đã tải thiết bị đã hỏng:", brokenDevices);
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị đã hỏng:", error);
        brokenDevices = [];
      }

      // Tải thiết bị thanh lý
      try {
        retiredDevices = await getDevicesByStatus("retired");
        console.log("📦 Đã tải thiết bị thanh lý:", retiredDevices);
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị thanh lý:", error);
        retiredDevices = [];
      }

      // Tính số phòng ban duy nhất từ tất cả thiết bị
      const uniqueDepartments = new Set(
        allDevices
          .map((d: any) => (d?.department || "").trim())
          .filter((name: string) => Boolean(name))
      );

      // Tính số thiết bị mới được thêm trong tháng này
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const newDevicesThisMonth = allDevices.filter((device) => {
        if (!device.createdAt) return false;
        const createdDate = new Date(device.createdAt);
        return createdDate >= firstDayOfMonth;
      });

      console.log("📊 Đã tải thống kê thiết bị:", {
        tong: allDevices.length,
        dangHoatDong: activeDevices.length,
        canBaoTri: maintenanceDevices.length,
        daHong: brokenDevices.length,
        thanhLy: retiredDevices.length,
        moiTrongThang: newDevicesThisMonth.length,
        phongBan: uniqueDepartments.size,
      });

      setStatistics((prev) => [
        {
          ...prev[0],
          count: allDevices.length.toString(),
        },
        {
          ...prev[1],
          count: activeDevices.length.toString(),
        },
        {
          ...prev[2],
          count: maintenanceDevices.length.toString(),
        },
        {
          ...prev[3],
          count: brokenDevices.length.toString(),
        },
        {
          ...prev[4],
          count: retiredDevices.length.toString(),
        },
        {
          ...prev[5],
          count: newDevicesThisMonth.length.toString(),
        },
        {
          ...prev[6],
          count: "25", // Số lượng nhân viên cố định (có thể thay đổi sau)
        },
        {
          ...prev[7],
          count: uniqueDepartments.size.toString(),
        },
      ]);

      console.log("✅ Cập nhật thống kê thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi tải thống kê thiết bị:", error);
      // Giữ nguyên thống kê cũ khi có lỗi
    } finally {
      setStatsLoading(false);
      console.log("🏁 Hoàn tất tải thống kê");
    }
  };

  // Cập nhật sidebar khi thay đổi kích thước màn hình
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // Ẩn sidebar trên mobile - chỉ hiện khi click menu
    } else {
      setSidebarOpen(true); // Hiện sidebar trên desktop
    }
  }, [isMobile]);

  // Thêm listener cho resize window để đảm bảo responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileSize = width < 1200; // Khớp với breakpoint lg

      if (isMobileSize !== isMobile) {
        if (isMobileSize) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  // Tự động mở menu tương ứng theo đường dẫn hiện tại
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/devices")) {
      setDevicesMenuOpen(true);
    }
    if (pathname.startsWith("/inventory")) {
      setInventoryMenuOpen(true);
    }
    if (pathname.startsWith("/maintenance")) {
      setMaintenanceMenuOpen(true);
    }
    if (pathname.startsWith("/reports")) {
      setReportsMenuOpen(true);
    }
    if (pathname.startsWith("/users")) {
      setUsersMenuOpen(true);
    }
    if (pathname.startsWith("/notifications")) {
      setNotificationsMenuOpen(true);
    }
    if (pathname.startsWith("/settings")) {
      setSettingsMenuOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!currentUser) return null;

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
            {currentUser.email}
          </Typography>
        </Box>
      </Box>

      {/* Menu điều hướng - Có thể cuộn */}
      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            startIcon={<HomeIcon />}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              bgcolor: "rgba(255,255,255,0.2)",
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Quản lý thiết bị
          </Button>

          {/* Submenu Quản lý thiết bị */}
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
                startIcon={<AddIcon />}
                onClick={() => router.push("/devices/new")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Thêm thiết bị mới
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Kho thiết bị
          </Button>

          {/* Submenu Kho thiết bị */}
          {inventoryMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Lịch bảo trì
          </Button>

          {/* Submenu Lịch bảo trì */}
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Báo cáo
          </Button>

          {/* Submenu Báo cáo */}
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Quản lý nhân viên
          </Button>

          {/* Submenu Quản lý nhân viên */}
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
              <Button
                fullWidth
                size="small"
                startIcon={<AssessmentIcon />}
                onClick={() => router.push("/users/activity")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Hoạt động
              </Button>
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
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Thông báo
          </Button>

          {/* Submenu Thông báo */}
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
              <Button
                fullWidth
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => router.push("/notifications/settings")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Cài đặt
              </Button>
            </Box>
          )}
          <Button
            fullWidth
            startIcon={<SettingsIcon />}
            endIcon={settingsMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Cài đặt
          </Button>

          {/* Submenu Cài đặt */}
          {settingsMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => router.push("/settings/general")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Chung
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<PeopleIcon />}
                onClick={() => router.push("/settings/users")}
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
              <Button
                fullWidth
                size="small"
                startIcon={<DevicesIcon />}
                onClick={() => router.push("/settings/devices")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Thiết bị
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<NotificationsIcon />}
                onClick={() => router.push("/settings/notifications")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Thông báo
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<BarChartIcon />}
                onClick={() => router.push("/settings/backup")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Sao lưu
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", my: 2 }} />

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
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer - Ẩn hoàn toàn trên mobile, chỉ hiện khi click menu */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              bgcolor: "primary.main",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Desktop Sidebar - Luôn hiển thị trên desktop */}
      {!isMobile && <SidebarContent />}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            height: 50,
            bgcolor: "primary.dark",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {/* Mobile Menu Button - Hiển thị nút menu 3 gạch trên mobile */}
          {isMobile && (
            <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Right side links */}
          <Box sx={{ display: "flex", gap: 3, ml: "auto" }}>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            >
              Giới thiệu
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            >
              Liên hệ
            </Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="xl">
            {/* Main Title */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                Hệ thống Quản lý Thiết bị
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Quản lý hiệu quả thiết bị tại Trung tâm Văn hóa Thể thao &
                Truyền thanh xã Bắc Tân Uyên
              </Typography>
            </Box>

            {/* Overview Statistics */}
            <Box sx={{ mb: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Thống kê tổng quan
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadDeviceStatistics}
                  disabled={statsLoading}
                  size="small"
                >
                  {statsLoading ? "Đang tải..." : "Làm mới"}
                </Button>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 2,
                  maxWidth: "1200px",
                  margin: "0 auto",
                }}
              >
                {statsLoading ? (
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      p: 2,
                      minHeight: "180px",
                      bgcolor: "rgba(255,255,255,0.5)",
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        Đang tải...
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Vui lòng đợi trong giây lát.
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  statistics.map((stat, index) => (
                    <Card
                      key={index}
                      sx={{
                        height: "100%",
                        textAlign: "center",
                        p: 2,
                        minHeight: "180px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 3,
                        },
                        // Thêm hiệu ứng đặc biệt cho ô
                        ...(stat.label === "Thiết bị mới trong tháng" && {
                          bgcolor: "#e3f2fd",
                          color: "info.main",
                          borderColor: "info.main",
                          "& .MuiTypography-root": {
                            color: "info.main",
                          },
                        }),
                        ...(stat.label === "Tổng thiết bị" && {
                          bgcolor: "#e3f2fd",
                          color: "info.main",
                          borderColor: "info.main",
                          "& .MuiTypography-root": {
                            color: "info.main",
                          },
                        }),
                        ...(stat.label === "Đang hoạt động" && {
                          bgcolor: "#e8f5e8",
                          color: "success.main",
                          borderColor: "success.main",
                          "& .MuiTypography-root": {
                            color: "success.main",
                          },
                        }),
                        ...(stat.label === "Cần bảo trì" && {
                          bgcolor: "#fff3e0",
                          color: "warning.main",
                          borderColor: "warning.main",
                          "& .MuiTypography-root": {
                            color: "warning.main",
                          },
                        }),
                        ...(stat.label === "Đã hỏng" && {
                          bgcolor: "#ffebee",
                          color: "error.main",
                          borderColor: "error.main",
                          "& .MuiTypography-root": {
                            color: "error.main",
                          },
                        }),
                        ...(stat.label === "Thanh lý" && {
                          bgcolor: "#ffcdd2",
                          color: "error.main",
                          borderColor: "error.main",
                          "& .MuiTypography-root": {
                            color: "error.main",
                          },
                        }),
                        ...(stat.label === "Tổng nhân viên" && {
                          bgcolor: "#e3f2fd",
                          color: "info.main",
                          borderColor: "info.main",
                          "& .MuiTypography-root": {
                            color: "info.main",
                          },
                        }),
                        ...(stat.label === "Phòng ban" && {
                          bgcolor: "#e3f2fd",
                          color: "info.main",
                          borderColor: "info.main",
                          "& .MuiTypography-root": {
                            color: "info.main",
                          },
                        }),
                      }}
                    >
                      <CardContent>
                        <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color={stat.color}
                          gutterBottom
                        >
                          {stat.count}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {stat.label}
                        </Typography>

                        {/* Thêm thông tin bổ sung cho các ô thống kê khác */}
                        {stat.label === "Tổng thiết bị" && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1 }}
                          >
                            Tổng cộng trong hệ thống
                          </Typography>
                        )}

                        {stat.label === "Đang hoạt động" && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ display: "block", mt: 1, fontWeight: "bold" }}
                          >
                            ✅ Hoạt động bình thường
                          </Typography>
                        )}

                        {stat.label === "Cần bảo trì" && (
                          <Typography
                            variant="caption"
                            color="warning.main"
                            sx={{ display: "block", mt: 1, fontWeight: "bold" }}
                          >
                            ⚠️ Cần xử lý sớm
                          </Typography>
                        )}

                        {stat.label === "Đã hỏng" && (
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{ display: "block", mt: 1, fontWeight: "bold" }}
                          >
                            ❌ Cần sửa chữa ngay
                          </Typography>
                        )}

                        {/* Thêm thông tin bổ sung cho ô thiết bị mới */}
                        {stat.label === "Thiết bị mới trong tháng" && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 1,
                                fontStyle: "italic",
                              }}
                            >
                              Từ đầu tháng{" "}
                              {new Date().toLocaleDateString("vi-VN", {
                                month: "long",
                                year: "numeric",
                              })}
                            </Typography>
                            {parseInt(stat.count) > 0 && (
                              <Typography
                                variant="caption"
                                color="success.main"
                                sx={{
                                  display: "block",
                                  mt: 0.5,
                                  fontWeight: "bold",
                                }}
                              >
                                ✨ Tăng trưởng tích cực
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 4,
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
            <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", my: 3 }} />
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
