"use client";
// thêm thiết bị vào kho
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
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Drawer,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { DeviceFormData } from "@/services/devices";
import { addDeviceToWarehouse } from "@/services/warehouse";
import { getUserByEmail } from "@/services/users";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon,
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
} from "@mui/icons-material";

const steps = ["Thông tin cơ bản", "Thông tin chi tiết", "Thông tin bảo trì"];

const deviceCategories = [
  "Máy tính",
  "Máy in",
  "Thiết bị mạng",
  "Thiết bị âm thanh",
  "Thiết bị video",
  "Thiết bị thể thao",
  "Thiết bị văn phòng",
  "Thiết bị điện tử",
  "Khác",
];

const deviceStatuses = [
  { value: "active", label: "Đang hoạt động", color: "success" },
  { value: "maintenance", label: "Cần bảo trì", color: "warning" },
  { value: "broken", label: "Đã hỏng", color: "error" },
  { value: "retired", label: "Thanh lý", color: "default" },
];

const departments = [
  "Phòng Kỹ thuật",
  "Phòng Văn hóa",
  "Phòng Thể thao",
  "Phòng Truyền thanh",
  "Phòng Hành chính",
  "Phòng Tài chính",
  "Phòng Nhân sự",
  "Khác",
];

export default function AddWarehouseDevicePage() {
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
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DeviceFormData>({
    name: "",
    code: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    status: "active",
    location: "Kho", // Default location for warehouse
    department: "",
    assignedTo: "",
    description: "",
    specifications: "",
    purchasePrice: null,
    supplier: "",
    maintenanceSchedule: "",
    lastMaintenance: "",
    nextMaintenance: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
  }, [currentUser, router]);

  // Cập nhật sidebar khi thay đổi kích thước màn hình
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Thêm listener cho resize window để đảm bảo responsive
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    // Validate based on current step
    switch (activeStep) {
      case 0: // Step 1: Basic Information
        if (!formData.name.trim()) newErrors.name = "Tên thiết bị là bắt buộc";
        if (!formData.code.trim()) newErrors.code = "Mã thiết bị là bắt buộc";
        if (!formData.category) newErrors.category = "Danh mục là bắt buộc";
        if (!formData.brand.trim()) newErrors.brand = "Thương hiệu là bắt buộc";
        if (!formData.model.trim()) newErrors.model = "Model là bắt buộc";
        if (!formData.serialNumber.trim())
          newErrors.serialNumber = "Số serial là bắt buộc";
        if (!formData.purchaseDate)
          newErrors.purchaseDate = "Ngày mua là bắt buộc";
        if (!formData.warrantyExpiry)
          newErrors.warrantyExpiry = "Ngày hết hạn bảo hành là bắt buộc";

        // Date validation for step 0
        if (formData.purchaseDate && formData.warrantyExpiry) {
          if (
            new Date(formData.purchaseDate) > new Date(formData.warrantyExpiry)
          ) {
            newErrors.warrantyExpiry =
              "Ngày hết hạn bảo hành phải sau ngày mua";
          }
        }

        // Purchase date cannot be in the future
        if (formData.purchaseDate) {
          const today = new Date();
          const purchaseDate = new Date(formData.purchaseDate);

          const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          const purchaseDateStart = new Date(
            purchaseDate.getFullYear(),
            purchaseDate.getMonth(),
            purchaseDate.getDate()
          );

          if (purchaseDateStart > todayStart) {
            newErrors.purchaseDate =
              "Ngày mua không thể là ngày trong tương lai";
          }
        }
        break;

      case 1: // Step 2: Detailed Information
        // Location is always "Kho" for warehouse, no validation needed
        // Department is not required for warehouse devices
        break;

      case 2: // Step 3: Maintenance Information
        // No required fields in step 3
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DeviceFormData, value: any) => {
    let processedValue = value;

    // Handle purchasePrice specifically
    if (field === "purchasePrice") {
      if (value === "" || value === null || value === undefined) {
        processedValue = null;
      } else {
        const numValue = Number(value);
        processedValue = isNaN(numValue) ? null : numValue;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!currentUser?.uid) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Lấy thông tin đầy đủ của người dùng từ bảng users
      let userName = "Người dùng";
      if (currentUser.email) {
        try {
          const userProfile = await getUserByEmail(currentUser.email);
          if (userProfile?.fullName) {
            userName = userProfile.fullName;
          } else {
            userName =
              currentUser.displayName || currentUser.email || "Người dùng";
          }
        } catch (err) {
          // Nếu không lấy được từ bảng users, dùng thông tin từ Firebase Auth
          console.warn("Không thể lấy thông tin user từ bảng users:", err);
          userName =
            currentUser.displayName || currentUser.email || "Người dùng";
        }
      }

      const deviceId = await addDeviceToWarehouse(
        formData,
        currentUser.uid,
        userName
      );

      setSuccess(true);

      // Redirect to warehouse list after 2 seconds
      setTimeout(() => {
        router.push("/warehouse");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      code: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      status: "active",
      location: "Kho",
      department: "",
      assignedTo: "",
      description: "",
      specifications: "",
      purchasePrice: null,
      supplier: "",
      maintenanceSchedule: "",
      lastMaintenance: "",
      nextMaintenance: "",
      notes: "",
    });
    setErrors({});
    setActiveStep(0);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <TextField
                fullWidth
                label="Tên thiết bị *"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Mã thiết bị *"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                error={!!errors.code}
                helperText={errors.code}
                required
                placeholder="VD: TB001"
              />
            </Box>
            <Box>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Danh mục *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  label="Danh mục *"
                >
                  {deviceCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.category && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {errors.category}
                </Typography>
              )}
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Thương hiệu *"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                error={!!errors.brand}
                helperText={errors.brand}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Model *"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                error={!!errors.model}
                helperText={errors.model}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Số serial *"
                value={formData.serialNumber}
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
                error={!!errors.serialNumber}
                helperText={errors.serialNumber}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Ngày mua *"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  handleInputChange("purchaseDate", e.target.value)
                }
                error={!!errors.purchaseDate}
                helperText={errors.purchaseDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Ngày hết hạn bảo hành *"
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) =>
                  handleInputChange("warrantyExpiry", e.target.value)
                }
                error={!!errors.warrantyExpiry}
                helperText={errors.warrantyExpiry}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <FormControl fullWidth error={!!errors.status} required>
                <InputLabel>Trạng thái *</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  label="Trạng thái *"
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
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <TextField
                fullWidth
                label="Vị trí"
                value="Kho"
                disabled
                helperText="Vị trí mặc định cho thiết bị trong kho"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Người được giao"
                value={formData.assignedTo}
                onChange={(e) =>
                  handleInputChange("assignedTo", e.target.value)
                }
                placeholder="VD: Nguyễn Văn A"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Nhà cung cấp"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                placeholder="VD: Công ty ABC"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Giá mua"
                type="number"
                value={formData.purchasePrice || ""}
                onChange={(e) =>
                  handleInputChange(
                    "purchasePrice",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="VD: 5000000"
                InputProps={{
                  endAdornment: <Typography variant="body2">VNĐ</Typography>,
                }}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                multiline
                rows={3}
                placeholder="Mô tả chi tiết về thiết bị..."
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Thông số kỹ thuật"
                value={formData.specifications}
                onChange={(e) =>
                  handleInputChange("specifications", e.target.value)
                }
                multiline
                rows={3}
                placeholder="Thông số kỹ thuật của thiết bị..."
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 3,
            }}
          >
            <Box>
              <TextField
                fullWidth
                label="Lịch bảo trì"
                value={formData.maintenanceSchedule}
                onChange={(e) =>
                  handleInputChange("maintenanceSchedule", e.target.value)
                }
                placeholder="VD: 6 tháng/lần"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Lần bảo trì gần nhất"
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) =>
                  handleInputChange("lastMaintenance", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Lần bảo trì tiếp theo"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) =>
                  handleInputChange("nextMaintenance", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Ghi chú"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                multiline
                rows={4}
                placeholder="Ghi chú bổ sung về thiết bị..."
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!currentUser) return null;

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
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  if (activeStep > 0) {
                    handleBack();
                  } else {
                    router.back();
                  }
                }}
                sx={{ mb: 2 }}
              >
                {activeStep > 0 ? "Quay lại bước trước" : "Quay lại"}
              </Button>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                Thêm thiết bị vào kho
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Nhập thông tin chi tiết về thiết bị mới để thêm vào kho
              </Typography>
            </Box>

            {/* Stepper */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Form */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                {renderStepContent(activeStep)}

                <Divider sx={{ my: 4 }} />

                {/* Navigation Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleReset}
                    >
                      Làm mới
                    </Button>

                    {activeStep > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                      >
                        Quay lại
                      </Button>
                    )}
                  </Box>

                  <Box>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        onClick={handleSubmit}
                        disabled={loading}
                        size="large"
                      >
                        {loading ? "Đang lưu..." : "Lưu thiết bị vào kho"}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleNext}
                        size="large"
                      >
                        Tiếp theo
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Thiết bị đã được thêm vào kho thành công! Đang chuyển hướng...
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
