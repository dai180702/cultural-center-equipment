"use client";
// chỉnh sửa thiết bị trong kho
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
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { DeviceFormData } from "@/services/devices";
import {
  getWarehouseDeviceById,
  updateWarehouseDevice,
} from "@/services/warehouse";
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
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  List as ListIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as RemoveIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
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

const emptyFormData: DeviceFormData = {
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
};

const toDateInputValue = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "object" && typeof (value as any).toDate === "function") {
    return (value as any).toDate().toISOString().slice(0, 10);
  }
  return "";
};

const sanitizeFormData = (data: DeviceFormData): Partial<DeviceFormData> => {
  const cleanedEntries = Object.entries(data).filter(([_, value]) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    return true;
  });

  return Object.fromEntries(cleanedEntries) as Partial<DeviceFormData>;
};

export default function EditWarehouseDevicePage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const deviceId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>(emptyFormData);
  const [originalData, setOriginalData] = useState<DeviceFormData | null>(null);
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  const loadDevice = useCallback(async () => {
    if (!deviceId) {
      setError("Không xác định được thiết bị cần chỉnh sửa");
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      setError(null);

      const device = await getWarehouseDeviceById(deviceId);
      if (!device) {
        setError("Không tìm thấy thiết bị trong kho");
        return;
      }

      const normalizedData: DeviceFormData = {
        name: device.name || "",
        code: device.code || "",
        category: device.category || "",
        brand: device.brand || "",
        model: device.model || "",
        serialNumber: device.serialNumber || "",
        purchaseDate: toDateInputValue((device as any).purchaseDate),
        warrantyExpiry: toDateInputValue((device as any).warrantyExpiry),
        status: (device as any).status || "active",
        location: (device as any).location || "Kho",
        department: (device as any).department || "",
        assignedTo: (device as any).assignedTo || "",
        description: (device as any).description || "",
        specifications: (device as any).specifications || "",
        purchasePrice:
          typeof (device as any).purchasePrice === "number"
            ? (device as any).purchasePrice
            : null,
        supplier: (device as any).supplier || "",
        maintenanceSchedule: (device as any).maintenanceSchedule || "",
        lastMaintenance: toDateInputValue((device as any).lastMaintenance),
        nextMaintenance: toDateInputValue((device as any).nextMaintenance),
        notes: (device as any).notes || "",
      };

      setFormData(normalizedData);
      setOriginalData(normalizedData);
      setActiveStep(0);
      setErrors({});
    } catch (err) {
      console.error("Error loading warehouse device:", err);
      setError("Không thể tải thông tin thiết bị trong kho");
    } finally {
      setInitialLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDevice();
  }, [currentUser, loadDevice, router]);

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    switch (activeStep) {
      case 0:
        if (!formData.name.trim()) newErrors.name = "Tên thiết bị là bắt buộc";
        if (!formData.code.trim()) newErrors.code = "Mã thiết bị là bắt buộc";
        if (!formData.category) newErrors.category = "Danh mục là bắt buộc";
        if (!formData.brand.trim())
          newErrors.brand = "Thương hiệu là bắt buộc";
        if (!formData.model.trim()) newErrors.model = "Model là bắt buộc";
        if (!formData.serialNumber.trim())
          newErrors.serialNumber = "Số serial là bắt buộc";
        if (!formData.purchaseDate)
          newErrors.purchaseDate = "Ngày mua là bắt buộc";
        if (!formData.warrantyExpiry)
          newErrors.warrantyExpiry = "Ngày hết hạn bảo hành là bắt buộc";

        if (formData.purchaseDate && formData.warrantyExpiry) {
          if (
            new Date(formData.purchaseDate) > new Date(formData.warrantyExpiry)
          ) {
            newErrors.warrantyExpiry =
              "Ngày hết hạn bảo hành phải sau ngày mua";
          }
        }

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
      case 1:
        break;
      case 2:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DeviceFormData, value: any) => {
    let processedValue = value;

    if (field === "purchasePrice") {
      if (value === "" || value === null || value === undefined) {
        processedValue = null;
      } else {
        const numValue = Number(value);
        processedValue = isNaN(numValue) ? null : numValue;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
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

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setActiveStep(0);
    } else {
      setFormData(emptyFormData);
      setErrors({});
      setActiveStep(0);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!currentUser?.uid) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

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
          console.warn("Không thể lấy thông tin user từ bảng users:", err);
          userName =
            currentUser.displayName || currentUser.email || "Người dùng";
        }
      }

      const payload = sanitizeFormData({
        ...formData,
        location: "Kho",
      });

      await updateWarehouseDevice(deviceId, payload, currentUser.uid, userName);

      setSuccess(true);

      setTimeout(() => {
        router.push("/warehouse");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
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
                {errors.category && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
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
                {errors.status && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {errors.status}
                  </Typography>
                )}
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
                value={formData.location || "Kho"}
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
              <FormControl fullWidth>
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  value={formData.department || ""}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  label="Phòng ban"
                >
                  <MenuItem value="">
                    <em>Không chọn</em>
                  </MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                value={formData.purchasePrice ?? ""}
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
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={toggleSidebar}
              sx={{ color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: "white" }}>
              Kho thiết bị
            </Typography>
          </Box>

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

        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="xl">
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                Chỉnh sửa thiết bị trong kho
              </Typography>
            </Box>

            {initialLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error && !success ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : (
              <>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>

                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {steps[activeStep]}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleReset}
                          disabled={loading}
                        >
                          Khôi phục
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={loadDevice}
                          disabled={loading}
                        >
                          Tải lại
                        </Button>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {renderStepContent(activeStep)}
                  </CardContent>
                </Card>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    disabled={activeStep === 0 || loading}
                  >
                    Quay lại
                  </Button>

                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                      disabled={loading}
                    >
                      Tiếp tục
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      onClick={handleUpdate}
                      disabled={loading}
                    >
                      {loading ? "Đang lưu..." : "Cập nhật thiết bị"}
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Container>
        </Box>
      </Box>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Kho thiết bị
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
            p: 3,
            borderBottom: "1px solid rgba(255,255,255,0.2)",
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
            {currentUser?.displayName?.charAt(0)?.toUpperCase() || "U"}
          </Box>
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {currentUser?.displayName || currentUser?.email || "Người dùng"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Quản trị viên kho
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Button
            fullWidth
            startIcon={<HomeIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              mb: 1,
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Thêm thiết bị mới
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Danh sách kho
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/warehouse/new")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Thêm vào kho
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Bảo trì
          </Button>
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
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Danh sách bảo trì
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Lịch trình bảo trì
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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
                onClick={() => router.push("/reports/inventory")}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Tồn kho
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Bảo trì
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Nhân sự
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Danh sách nhân viên
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Thêm nhân viên
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Tất cả thông báo
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Cảnh báo
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
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
            }}
          >
            Cài đặt
          </Button>
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Cài đặt chung
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
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                Thông báo
              </Button>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
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
      </Drawer>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Thiết bị trong kho đã được cập nhật thành công
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error && !initialLoading}
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

