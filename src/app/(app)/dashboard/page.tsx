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
import { getWarehouseDevices } from "@/services/warehouse";
import { getUsers } from "@/services/users";
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
  Business as BusinessIcon,
  MeetingRoom as MeetingRoomIcon,
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
      icon: <LaptopIcon sx={{ fontSize: 32, color: "#1976d2" }} />,
      count: "0",
      label: "Tổng thiết bị",
      color: "#1976d2",
    },
    {
      icon: <GridViewIcon sx={{ fontSize: 32, color: "#2e7d32" }} />,
      count: "0",
      label: "Đang hoạt động",
      color: "#2e7d32",
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 32, color: "#0288d1" }} />,
      count: "0",
      label: "Thiết bị trong kho",
      color: "#0288d1",
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 32, color: "#0288d1" }} />,
      count: "0",
      label: "Thiết bị trong phòng",
      color: "#0288d1",
    },
    {
      icon: <EngineeringIcon sx={{ fontSize: 32, color: "#ed6c02" }} />,
      count: "0",
      label: "Cần bảo trì",
      color: "#ed6c02",
    },
    {
      icon: <WarningIcon sx={{ fontSize: 32, color: "#d32f2f" }} />,
      count: "0",
      label: "Đã hỏng",
      color: "#d32f2f",
    },
    {
      icon: <AddIcon sx={{ fontSize: 32, color: "#00897b" }} />,
      count: "0",
      label: "Thiết bị mới trong tháng",
      color: "#00897b",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: "#1565c0" }} />,
      count: "0",
      label: "Tổng nhân viên",
      color: "#1565c0",
    },
  ]);

  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser]);

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
      let inUseDevices: any[] = [];
      let warehouseDevices: any[] = [];
      let activeDevices: any[] = [];
      let maintenanceDevices: any[] = [];
      let brokenDevices: any[] = [];
      let retiredDevices: any[] = [];
      let allUsers: any[] = [];

      try {
        inUseDevices = await getDevices();
        console.log(
          "📱 Đã tải thiết bị đang sử dụng:",
          inUseDevices?.length || 0
        );
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị đang sử dụng:", error);
        inUseDevices = [];
      }

      try {
        warehouseDevices = await getWarehouseDevices();
        console.log(
          "📦 Đã tải thiết bị trong kho:",
          warehouseDevices?.length || 0
        );
      } catch (error) {
        console.error("❌ Lỗi khi tải thiết bị trong kho:", error);
        warehouseDevices = [];
      }

      // Gộp cả hai nguồn để tính tổng
      allDevices = [...inUseDevices, ...warehouseDevices];
      console.log("📱 Tổng số thiết bị (đang dùng + kho):", allDevices.length);

      try {
        allUsers = await getUsers();
        console.log("👥 Đã tải tất cả nhân viên:", allUsers);
      } catch (error) {
        console.error("❌ Lỗi khi tải nhân viên:", error);
        allUsers = [];
      }

      // Lọc thiết bị theo trạng thái từ tất cả thiết bị (bao gồm cả kho)
      activeDevices = allDevices.filter((device) => device.status === "active");
      console.log("✅ Thiết bị đang hoạt động:", activeDevices.length);

      maintenanceDevices = allDevices.filter(
        (device) => device.status === "maintenance"
      );
      console.log("🔧 Thiết bị cần bảo trì:", maintenanceDevices.length);

      brokenDevices = allDevices.filter((device) => device.status === "broken");
      console.log("❗ Thiết bị đã hỏng:", brokenDevices.length);

      retiredDevices = allDevices.filter(
        (device) => device.status === "retired"
      );
      console.log("📦 Thiết bị thanh lý:", retiredDevices.length);

      // Thiết bị đang ở phòng ban = thiết bị đang sử dụng (không phải trong kho)
      const devicesInDepartments = inUseDevices.length;
      console.log("🏢 Thiết bị đang ở phòng ban:", devicesInDepartments);

      // Tổng thiết bị trong kho
      const totalWarehouseDevices = warehouseDevices.length;
      console.log("📦 Tổng thiết bị trong kho:", totalWarehouseDevices);

      const today = new Date();
      // Đặt giờ về 00:00:00 để so sánh chính xác ngày
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const newDevicesThisMonth = allDevices.filter((device) => {
        if (!device.createdAt) return false;

        // Xử lý createdAt có thể là Date, Timestamp, hoặc string
        let createdDate: Date;
        if (device.createdAt instanceof Date) {
          createdDate = device.createdAt;
        } else if (typeof device.createdAt === "string") {
          createdDate = new Date(device.createdAt);
        } else if (
          device.createdAt &&
          typeof device.createdAt === "object" &&
          "toDate" in device.createdAt
        ) {
          // Firestore Timestamp
          createdDate = (device.createdAt as any).toDate();
        } else {
          createdDate = new Date(device.createdAt);
        }

        // Reset giờ về 00:00:00 để so sánh chỉ theo ngày
        createdDate.setHours(0, 0, 0, 0);

        return createdDate >= firstDayOfMonth;
      });

      console.log("📊 Đã tải thống kê thiết bị:", {
        tong: allDevices.length,
        dangHoatDong: activeDevices.length,
        canBaoTri: maintenanceDevices.length,
        daHong: brokenDevices.length,
        thietBiPhongBan: devicesInDepartments,
        moiTrongThang: newDevicesThisMonth.length,
        tongThietBiKho: totalWarehouseDevices,
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
          count: totalWarehouseDevices.toString(),
        },
        {
          ...prev[3],
          count: devicesInDepartments.toString(),
        },
        {
          ...prev[4],
          count: maintenanceDevices.length.toString(),
        },
        {
          ...prev[5],
          count: brokenDevices.length.toString(),
        },
        {
          ...prev[6],
          count: newDevicesThisMonth.length.toString(),
        },
        {
          ...prev[7],
          count: allUsers.length.toString(),
        },
      ]);

      console.log("✅ Cập nhật thống kê thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi tải thống kê thiết bị:", error);
    } finally {
      setStatsLoading(false);
      console.log("🏁 Hoàn tất tải thống kê");
    }
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileSize = width < 1200;

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
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Thiết bị
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên
        </Typography>
      </Box>

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
                onClick={() => router.push("/warehouse/stock-entry")}
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
      {/* Main Content (sidebar dùng layout chung) */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            height: 50,
            bgcolor: "#90caf9",
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
          {/* Right side links */}
          <Box sx={{ display: "flex", gap: 3, ml: "auto" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#000000",
                cursor: "pointer",
                "&:hover": { opacity: 0.7 },
              }}
            >
              Giới thiệu
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#000000",
                cursor: "pointer",
                "&:hover": { opacity: 0.7 },
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
                          border: "1px solid #1976d2",
                          "& .MuiTypography-root": {
                            color: "#1976d2",
                          },
                        }),
                        ...(stat.label === "Đang hoạt động" && {
                          bgcolor: "#e8f5e9",
                          border: "1px solid #2e7d32",
                          "& .MuiTypography-root": {
                            color: "#2e7d32",
                          },
                        }),
                        ...(stat.label === "Thiết bị trong kho" && {
                          bgcolor: "#e1f5fe",
                          border: "1px solid #0288d1",
                          "& .MuiTypography-root": {
                            color: "#0288d1",
                          },
                        }),
                        ...(stat.label === "Thiết bị trong phòng" && {
                          bgcolor: "#e1f5fe",
                          border: "1px solid #0288d1",
                          "& .MuiTypography-root": {
                            color: "#0288d1",
                          },
                        }),
                        ...(stat.label === "Cần bảo trì" && {
                          bgcolor: "#fff3e0",
                          border: "1px solid #ed6c02",
                          "& .MuiTypography-root": {
                            color: "#ed6c02",
                          },
                        }),
                        ...(stat.label === "Đã hỏng" && {
                          bgcolor: "#ffebee",
                          border: "1px solid #d32f2f",
                          "& .MuiTypography-root": {
                            color: "#d32f2f",
                          },
                        }),
                        ...(stat.label === "Thiết bị mới trong tháng" && {
                          bgcolor: "#e0f2f1",
                          border: "1px solid #00897b",
                          "& .MuiTypography-root": {
                            color: "#00897b",
                          },
                        }),
                        ...(stat.label === "Tổng nhân viên" && {
                          bgcolor: "#e3f2fd",
                          border: "1px solid #1565c0",
                          "& .MuiTypography-root": {
                            color: "#1565c0",
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
      </Box>
    </Box>
  );
}
