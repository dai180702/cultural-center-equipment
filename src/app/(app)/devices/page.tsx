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
import { getDevices, Device, searchDevices } from "@/services/devices";
import {
  getWarehouseDevices,
  moveDeviceFromWarehouseToDevices,
  moveDeviceFromDevicesToWarehouse,
} from "@/services/warehouse";
import { getActiveBorrowByDevice, BorrowRecord } from "@/services/borrows";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
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
  Clear as ClearIcon,
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
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deviceToTransfer, setDeviceToTransfer] = useState<Device | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);
  const [addFromWarehouseDialogOpen, setAddFromWarehouseDialogOpen] =
    useState(false);
  const [warehouseDevices, setWarehouseDevices] = useState<Device[]>([]);
  const [allWarehouseDevices, setAllWarehouseDevices] = useState<Device[]>([]);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [selectedWarehouseDevice, setSelectedWarehouseDevice] =
    useState<Device | null>(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [selectDepartmentDialogOpen, setSelectDepartmentDialogOpen] =
    useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeBorrow, setActiveBorrow] = useState<BorrowRecord | null>(null);

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
      // Load only from devices collection (not warehouse)
      const allDevicesData = await getDevices();
      console.log("Loaded devices from Firestore:", allDevicesData);
      setAllDevices(allDevicesData);
      setDevices(allDevicesData);
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

  const handleViewDetails = async (device: Device) => {
    setSelectedDevice(device);
    setDetailDrawerOpen(true);
    // Load thông tin mượn trả nếu có
    try {
      const borrowData = await getActiveBorrowByDevice(device.id!);
      setActiveBorrow(borrowData);
    } catch (err) {
      console.error("Error loading borrow info:", err);
      setActiveBorrow(null);
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    try {
      if (dateString instanceof Date) {
        return dateString.toLocaleDateString("vi-VN");
      }
      if (typeof dateString === "string") {
        return new Date(dateString).toLocaleDateString("vi-VN");
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  };

  const formatFirestoreDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString("vi-VN");
      }
      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleDateString("vi-VN");
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("vi-VN");
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  };

  // Load devices from warehouse collection
  const loadWarehouseDevices = async () => {
    try {
      setLoadingWarehouse(true);
      const warehouseDevicesData = await getWarehouseDevices();
      setAllWarehouseDevices(warehouseDevicesData);
      setWarehouseDevices(warehouseDevicesData);
      setWarehouseSearchTerm(""); // Reset search when loading
    } catch (err) {
      console.error("Error loading warehouse devices:", err);
      setError("Không thể tải danh sách thiết bị từ kho");
    } finally {
      setLoadingWarehouse(false);
    }
  };

  // Filter warehouse devices by search term
  const handleWarehouseSearch = () => {
    if (!warehouseSearchTerm.trim()) {
      setWarehouseDevices(allWarehouseDevices);
      return;
    }

    const filtered = allWarehouseDevices.filter((device) => {
      const searchFields = [
        device.name,
        device.code,
        device.brand,
        device.model,
        device.serialNumber,
        device.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchFields.includes(warehouseSearchTerm.toLowerCase());
    });

    setWarehouseDevices(filtered);
  };

  // Handle search input change
  useEffect(() => {
    if (warehouseSearchTerm.trim() === "") {
      setWarehouseDevices(allWarehouseDevices);
    } else {
      const filtered = allWarehouseDevices.filter((device) => {
        const searchFields = [
          device.name,
          device.code,
          device.brand,
          device.model,
          device.serialNumber,
          device.category,
        ]
          .join(" ")
          .toLowerCase();

        return searchFields.includes(warehouseSearchTerm.toLowerCase());
      });
      setWarehouseDevices(filtered);
    }
  }, [warehouseSearchTerm, allWarehouseDevices]);

  // Open dialog to add device from warehouse
  const handleAddFromWarehouse = () => {
    setAddFromWarehouseDialogOpen(true);
    loadWarehouseDevices();
  };

  // Handle selecting device from warehouse - open department selection dialog
  const handleSelectWarehouseDevice = (device: Device) => {
    setSelectedWarehouseDevice(device);
    setSelectedDepartment("");
    setSelectDepartmentDialogOpen(true);
  };

  // Confirm adding device with selected department
  const handleConfirmAddDeviceWithDepartment = async () => {
    if (!selectedWarehouseDevice?.id || !selectedDepartment) {
      setError("Vui lòng chọn phòng ban");
      return;
    }

    try {
      setLoadingWarehouse(true);
      // Move device from warehouse collection to devices collection with department
      await moveDeviceFromWarehouseToDevices(
        selectedWarehouseDevice.id,
        currentUser?.uid,
        currentUser?.email || "Người dùng",
        selectedDepartment
      );

      // Reload devices to include the new one
      await loadDevices();
      // Reload warehouse devices to remove the selected one
      await loadWarehouseDevices();
      setSelectDepartmentDialogOpen(false);
      setAddFromWarehouseDialogOpen(false);
      setSelectedWarehouseDevice(null);
      setSelectedDepartment("");
      setSuccess(
        `Đã thêm thiết bị "${selectedWarehouseDevice.name}" vào phòng ban "${selectedDepartment}" thành công`
      );
    } catch (err) {
      console.error("Error adding device from warehouse:", err);
      setError("Không thể thêm thiết bị từ kho");
    } finally {
      setLoadingWarehouse(false);
    }
  };

  const handleTransferToWarehouseClick = (device: Device) => {
    setDeviceToTransfer(device);
    setTransferDialogOpen(true);
  };

  const handleTransferConfirm = async () => {
    if (!deviceToTransfer?.id) return;

    try {
      setTransferring(true);
      await moveDeviceFromDevicesToWarehouse(
        deviceToTransfer.id,
        currentUser?.uid,
        currentUser?.displayName || currentUser?.email || "Người dùng"
      );
      setSuccess(`Thiết bị "${deviceToTransfer.name}" đã được chuyển vào kho`);
      const updatedDevices = devices.filter(
        (d) => d.id !== deviceToTransfer.id
      );
      const updatedAllDevices = allDevices.filter(
        (d) => d.id !== deviceToTransfer.id
      );
      setDevices(updatedDevices);
      setAllDevices(updatedAllDevices);
      setTransferDialogOpen(false);
      setDeviceToTransfer(null);
    } catch (err) {
      console.error("Error moving device to warehouse:", err);
      setError("Không thể chuyển thiết bị vào kho");
    } finally {
      setTransferring(false);
    }
  };

  const handleTransferCancel = () => {
    setTransferDialogOpen(false);
    setDeviceToTransfer(null);
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
                startIcon={<InventoryIcon />}
                onClick={handleAddFromWarehouse}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Thêm thiết bị từ kho
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
            Bảo trì thiết bị
          </Button>

          {/* Submenu Bảo trì thiết bị */}
          {maintenanceMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ListIcon />}
                onClick={() => router.push("/devices/maintenance")}
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
                Danh sách thiết bị bảo trì
              </Button>
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
                                      onClick={() => handleViewDetails(device)}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Chuyển vào kho">
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      onClick={() =>
                                        handleTransferToWarehouseClick(device)
                                      }
                                    >
                                      <InventoryIcon />
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
              aria-label="add from warehouse"
              sx={{ position: "fixed", bottom: 24, right: 24 }}
              onClick={handleAddFromWarehouse}
            >
              <InventoryIcon />
            </Fab>
          </Container>
        </Box>
      </Box>

      {/* Transfer to Warehouse Dialog */}
      <Dialog open={transferDialogOpen} onClose={handleTransferCancel}>
        <DialogTitle>Xác nhận chuyển vào kho</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn chuyển thiết bị &quot;
            {deviceToTransfer?.name}&quot; (Mã: {deviceToTransfer?.code}) vào
            kho?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Thiết bị sẽ không còn trong danh sách đang sử dụng và sẽ xuất hiện
            lại trong kho.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransferCancel} disabled={transferring}>
            Hủy
          </Button>
          <Button
            onClick={handleTransferConfirm}
            color="secondary"
            disabled={transferring}
            startIcon={transferring ? <CircularProgress size={20} /> : null}
          >
            {transferring ? "Đang chuyển..." : "Chuyển vào kho"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Device from Warehouse Dialog */}
      <Dialog
        open={addFromWarehouseDialogOpen}
        onClose={() => {
          setAddFromWarehouseDialogOpen(false);
          setSelectedWarehouseDevice(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chọn thiết bị từ kho</DialogTitle>
        <DialogContent>
          {/* Search Bar */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm thiết bị (tên, mã, thương hiệu, model...)"
              value={warehouseSearchTerm}
              onChange={(e) => setWarehouseSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: warehouseSearchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setWarehouseSearchTerm("")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loadingWarehouse ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : warehouseDevices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {warehouseSearchTerm
                  ? "Không tìm thấy thiết bị"
                  : "Không có thiết bị nào trong kho"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {warehouseSearchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Tất cả thiết bị trong kho đã được thêm vào danh sách quản lý"}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã TB</TableCell>
                    <TableCell>Tên thiết bị</TableCell>
                    <TableCell>Danh mục</TableCell>
                    <TableCell>Thương hiệu</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warehouseDevices.map((device) => (
                    <TableRow key={device.id} hover>
                      <TableCell>{device.code}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.category}</TableCell>
                      <TableCell>{device.brand}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleSelectWarehouseDevice(device)}
                          disabled={loadingWarehouse}
                        >
                          Chọn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddFromWarehouseDialogOpen(false);
              setSelectedWarehouseDevice(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Department Dialog */}
      <Dialog
        open={selectDepartmentDialogOpen}
        onClose={() => {
          setSelectDepartmentDialogOpen(false);
          setSelectedDepartment("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chọn phòng ban cho thiết bị</DialogTitle>
        <DialogContent>
          {selectedWarehouseDevice && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thiết bị: <strong>{selectedWarehouseDevice.name}</strong> (Mã:{" "}
                {selectedWarehouseDevice.code})
              </Typography>
              <FormControl fullWidth sx={{ mt: 3 }} required>
                <InputLabel>Phòng ban *</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Phòng ban *"
                >
                  <MenuItem value="Phòng Kỹ thuật">Phòng Kỹ thuật</MenuItem>
                  <MenuItem value="Phòng Văn hóa">Phòng Văn hóa</MenuItem>
                  <MenuItem value="Phòng Thể thao">Phòng Thể thao</MenuItem>
                  <MenuItem value="Phòng Truyền thanh">
                    Phòng Truyền thanh
                  </MenuItem>
                  <MenuItem value="Phòng Hành chính">Phòng Hành chính</MenuItem>
                  <MenuItem value="Phòng Tài chính">Phòng Tài chính</MenuItem>
                  <MenuItem value="Phòng Nhân sự">Phòng Nhân sự</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelectDepartmentDialogOpen(false);
              setSelectedDepartment("");
            }}
            disabled={loadingWarehouse}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmAddDeviceWithDepartment}
            variant="contained"
            disabled={!selectedDepartment || loadingWarehouse}
            startIcon={
              loadingWarehouse ? <CircularProgress size={20} /> : <AddIcon />
            }
          >
            {loadingWarehouse ? "Đang thêm..." : "Xác nhận"}
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

      {/* Device Details Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedDevice(null);
          setActiveBorrow(null);
        }}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Chi tiết thiết bị
          </Typography>
          <Divider sx={{ my: 2 }} />

          {selectedDevice && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã thiết bị
                </Typography>
                <Typography variant="body1">{selectedDevice.code}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tên thiết bị
                </Typography>
                <Typography variant="body1">{selectedDevice.name}</Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Danh mục
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.category}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thương hiệu
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.brand}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.model}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số serial
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.serialNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedDevice.status)}
                    color={getStatusColor(selectedDevice.status) as any}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng ban
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.department}
                  </Typography>
                </Box>
                {selectedDevice.assignedTo && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Người được giao
                    </Typography>
                    <Typography variant="body1">
                      {selectedDevice.assignedTo}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày mua
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedDevice.purchaseDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giá mua
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.purchasePrice
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedDevice.purchasePrice)
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Thông tin mượn trả */}
              {activeBorrow && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "primary.light",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Thông tin mượn trả
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Người mượn
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {activeBorrow.borrowerName ||
                          activeBorrow.borrowerId ||
                          "N/A"}
                      </Typography>
                    </Box>
                    {activeBorrow.department && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phòng ban mượn
                        </Typography>
                        <Typography variant="body1">
                          {activeBorrow.department}
                        </Typography>
                      </Box>
                    )}
                    {activeBorrow.purpose && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Mục đích mượn
                        </Typography>
                        <Typography variant="body1">
                          {activeBorrow.purpose}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày mượn
                      </Typography>
                      <Typography variant="body1">
                        {formatFirestoreDate(activeBorrow.borrowDate)}
                      </Typography>
                    </Box>
                    {activeBorrow.expectedReturnDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dự kiến trả
                        </Typography>
                        <Typography variant="body1">
                          {formatFirestoreDate(activeBorrow.expectedReturnDate)}
                        </Typography>
                      </Box>
                    )}
                    {activeBorrow.status === "overdue" && (
                      <Box>
                        <Chip label="Quá hạn trả" color="error" size="small" />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {selectedDevice.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.description}
                  </Typography>
                </Box>
              )}
              {selectedDevice.specifications && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông số kỹ thuật
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.specifications}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDetailDrawerOpen(false);
                setSelectedDevice(null);
                setActiveBorrow(null);
              }}
              fullWidth
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
