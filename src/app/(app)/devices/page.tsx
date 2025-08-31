"use client";
// Danh sách thiết bị
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Pagination,
  Tooltip,
  Fab,
  Divider,
  Drawer,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getDevices,
  deleteDevice,
  Device,
  searchDevices,
} from "@/services/devices";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
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
  List as ListIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as RemoveIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";

const deviceStatuses = [
  { value: "all", label: "Tất cả", color: "default" },
  { value: "active", label: "Đang hoạt động", color: "success" },
  { value: "maintenance", label: "Cần bảo trì", color: "warning" },
  { value: "broken", label: "Đã hỏng", color: "error" },
  { value: "retired", label: "Thanh lý", color: "default" },
];

const deviceCategories = [
  "Tất cả",
  "Máy tính",
  "Máy in",
  "Thiết bị mạng",
  "Thiết bị âm thanh",
  "Thiết bị video",
  "Thiết bị thể thao",
  "Thiết bị văn phòng",
  "Khác",
];

export default function DevicesPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
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
  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]); // Store original list
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDevices();
  }, [currentUser, router]);

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const loadDevices = async () => {
    try {
      setLoading(true);
      const allDevices = await getDevices();
      console.log("Loaded devices from Firestore:", allDevices);
      setAllDevices(allDevices); // Store original list
      setDevices(allDevices); // Initialize filtered list
    } catch (err) {
      console.error("Error loading devices:", err);
      setError("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setDevices(allDevices); // Reset to original list
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchDevices(searchTerm);
      setDevices(searchResults);
    } catch (err) {
      setError("Không thể tìm kiếm thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filteredDevices = allDevices; // Start with original list
    console.log("Filtering devices:", {
      statusFilter,
      categoryFilter,
      totalDevices: allDevices.length,
    });

    // Filter by status
    if (statusFilter !== "all") {
      filteredDevices = filteredDevices.filter(
        (device) => device.status === statusFilter
      );
      console.log("After status filter:", filteredDevices.length);
    }

    // Filter by category
    if (categoryFilter !== "Tất cả") {
      filteredDevices = filteredDevices.filter(
        (device) => device.category === categoryFilter
      );
      console.log("After category filter:", filteredDevices.length);
    }

    console.log("Final filtered devices:", filteredDevices);
    setDevices(filteredDevices);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("Tất cả");
    setSearchTerm("");
    setDevices(allDevices); // Reset to original list
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete?.id) return;

    try {
      setDeleting(true);
      await deleteDevice(deviceToDelete.id);
      setSuccess("Thiết bị đã được xóa thành công");
      const updatedDevices = devices.filter((d) => d.id !== deviceToDelete.id);
      const updatedAllDevices = allDevices.filter(
        (d) => d.id !== deviceToDelete.id
      );
      setDevices(updatedDevices);
      setAllDevices(updatedAllDevices);
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    } catch (err) {
      setError("Không thể xóa thiết bị");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeviceToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "broken":
        return "error";
      case "retired":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "maintenance":
        return "Cần bảo trì";
      case "broken":
        return "Đã hỏng";
      case "retired":
        return "Thanh lý";
      default:
        return status;
    }
  };

  // Pagination
  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = devices.slice(indexOfFirstDevice, indexOfLastDevice);
  const totalPages = Math.ceil(devices.length / devicesPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
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
      {/* Header */}
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Thiết bị
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên
        </Typography>
      </Box>

      {/* User Profile */}
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

      {/* Navigation Menu - Scrollable */}
      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
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
              bgcolor: "rgba(255,255,255,0.2)",
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
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
                  bgcolor: "rgba(255,255,255,0.2)",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
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
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                Quản lý Thiết bị
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Danh sách tất cả thiết bị trong hệ thống
              </Typography>
            </Box>

            {/* Search and Filter Bar */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Tìm kiếm thiết bị"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSearch}>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Tìm theo tên, mã, thương hiệu..."
                  />

                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Trạng thái"
                    >
                      {deviceStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Chip
                            label={status.label}
                            color={status.color as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      label="Danh mục"
                    >
                      {deviceCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    startIcon={<FilterIcon />}
                    onClick={handleFilter}
                  >
                    Lọc
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleClearFilters}
                  >
                    Làm mới
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadDevices}
                  >
                    Tải lại từ Firestore
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Devices Table */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : devices.length === 0 ? (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Không tìm thấy thiết bị nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      categoryFilter !== "Tất cả"
                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                        : "Hãy thêm thiết bị đầu tiên vào hệ thống"}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "primary.main" }}>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Mã thiết bị
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Tên thiết bị
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Danh mục
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Trạng thái
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Vị trí
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Phòng ban
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Người cập nhật cuối
                            </TableCell>
                            <TableCell
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              Thao tác
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentDevices.map((device) => (
                            <TableRow key={device.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {device.code}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {device.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {device.brand} - {device.model}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={device.category}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusLabel(device.status)}
                                  color={getStatusColor(device.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {device.location}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {device.department}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {device.updatedByName ||
                                      device.updatedBy ||
                                      "Chưa cập nhật"}
                                  </Typography>
                                  {device.updatedAt && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        device.updatedAt
                                      ).toLocaleDateString("vi-VN")}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Tooltip title="Xem chi tiết">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        router.push(`/devices/${device.id}`)
                                      }
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Chỉnh sửa">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        router.push(
                                          `/devices/${device.id}/edit`
                                        )
                                      }
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteClick(device)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Box
                        sx={{ display: "flex", justifyContent: "center", p: 3 }}
                      >
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          showFirstButton
                          showLastButton
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Floating Action Button */}
            <Fab
              color="primary"
              aria-label="add"
              sx={{ position: "fixed", bottom: 24, right: 24 }}
              onClick={() => router.push("/devices/new")}
            >
              <AddIcon />
            </Fab>
          </Container>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa thiết bị "{deviceToDelete?.name}" (Mã:{" "}
            {deviceToDelete?.code})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
