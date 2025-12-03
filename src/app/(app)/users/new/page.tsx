"use client";
// thêm nhân viên mới
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
  Alert,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  Drawer,
  useTheme,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
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
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon2,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { DEFAULT_DEPARTMENTS } from "@/lib/departments";
import { useAuth } from "@/contexts/AuthContext";
import { getUserByEmail, getUserByEmployeeId, User } from "@/services/users";
import {
  getAllProvinces,
  getDistrictsByProvince,
  parseAddress,
  formatAddress,
} from "@/data/vietnam-provinces";

const steps = ["Thông tin cơ bản", "Thông tin công việc", "Thông tin bổ sung"];

export default function NewUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const { createUser, departments, loading, error, clearError } = useUsers();

  // State cho sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // State cho các menu con
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [HomeMenuOpen, setHomeMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(true);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    startDate: "",
    status: "active" as const,
    role: "staff" as const,
    address: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
    skills: [""],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [customDepartment, setCustomDepartment] = useState("");
  // Action password state
  const [actionPwdOpen, setActionPwdOpen] = useState(false);
  const [actionPwd, setActionPwd] = useState("");
  const [actionPwdError, setActionPwdError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingEmployeeId, setCheckingEmployeeId] = useState(false);

  // Thông tin người tạo (người đang đăng nhập)
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  );

  // State cho menu tìm kiếm địa chỉ
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [provinceAnchorEl, setProvinceAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [districtAnchorEl, setDistrictAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [provinceSearchTerm, setProvinceSearchTerm] = useState("");
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/users")) {
      setUsersMenuOpen(true);
    }
  }, [pathname]);

  // Load thông tin người tạo (người đang đăng nhập)
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!currentUser?.email) return;
      try {
        const profile = await getUserByEmail(currentUser.email);
        setCurrentUserProfile(profile);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };
    loadCurrentUserProfile();
  }, [currentUser?.email]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    const districts = getDistrictsByProvince(province);
    setAvailableDistricts(districts);

    if (selectedDistrict && !districts.includes(selectedDistrict)) {
      setSelectedDistrict("");
      handleInputChange("address", formatAddress(province, ""));
    } else {
      handleInputChange("address", formatAddress(province, selectedDistrict));
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    handleInputChange("address", formatAddress(selectedProvince, district));
  };

  const checkEmployeeIdExists = async (
    employeeId: string
  ): Promise<boolean> => {
    if (!employeeId.trim()) {
      return false;
    }
    try {
      setCheckingEmployeeId(true);
      const existingUser = await getUserByEmployeeId(employeeId.trim());
      return existingUser !== null;
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã nhân viên:", error);
      return false;
    } finally {
      setCheckingEmployeeId(false);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }
    try {
      setCheckingEmail(true);
      const existingUser = await getUserByEmail(email);
      return existingUser !== null;
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleEmployeeIdBlur = async () => {
    if (!formData.employeeId.trim()) return;
    const exists = await checkEmployeeIdExists(formData.employeeId);
    if (exists) {
      setErrors((prev) => ({
        ...prev,
        employeeId: "Mã nhân viên đã được sử dụng",
      }));
    }
  };

  const handleEmailBlur = async () => {
    if (
      formData.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      const exists = await checkEmailExists(formData.email);
      if (exists) {
        setErrors((prev) => ({ ...prev, email: "Email đã được sử dụng" }));
      }
    }
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value },
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const next = [...formData.skills];
    next[index] = value;
    setFormData((p) => ({ ...p, skills: next }));
  };

  const addSkill = () =>
    setFormData((p) => ({ ...p, skills: [...p.skills, ""] }));
  const removeSkill = (index: number) => {
    if (formData.skills.length <= 1) return;
    setFormData((p) => ({
      ...p,
      skills: p.skills.filter((_, i) => i !== index),
    }));
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!formData.employeeId.trim()) {
        next.employeeId = "Bắt buộc";
      } else {
        const employeeIdExists = await checkEmployeeIdExists(
          formData.employeeId
        );
        if (employeeIdExists) {
          next.employeeId = "Mã nhân viên đã được sử dụng";
        }
      }
      if (!formData.fullName.trim()) next.fullName = "Bắt buộc";
      if (!formData.email.trim()) {
        next.email = "Bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        next.email = "Email không hợp lệ";
      } else {
        // Kiểm tra email đã tồn tại
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          next.email = "Email đã được sử dụng";
        }
      }
      if (!formData.password.trim()) next.password = "Bắt buộc";
      else if (formData.password.length < 6)
        next.password = "Mật khẩu tối thiểu 6 ký tự";
      if (!formData.confirmPassword.trim()) next.confirmPassword = "Bắt buộc";
      else if (formData.confirmPassword !== formData.password)
        next.confirmPassword = "Mật khẩu không khớp";
      if (!formData.phone.trim()) next.phone = "Bắt buộc";
      else if (!/^[0-9]{10,15}$/.test(formData.phone.trim()))
        next.phone = "Số điện thoại phải có 10-15 chữ số";
    } else if (step === 1) {
      if (!formData.department.trim()) next.department = "Bắt buộc";
      if (formData.department === "Khác" && !customDepartment.trim()) {
        next.department = "Vui lòng nhập tên phòng ban";
      }
      if (!formData.startDate) next.startDate = "Bắt buộc";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  const performCreate = async () => {
    if (isSubmitting) return;
    const isValid = await validateStep(activeStep);
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const cleanSkills = formData.skills.filter((s) => s.trim() !== "");
      const { password, confirmPassword, ...rest } = formData as any;
      const payload = {
        ...rest,
        department:
          rest.department === "Khác" && customDepartment.trim()
            ? customDepartment.trim()
            : rest.department,
        skills: cleanSkills,
        emergencyContact: formData.emergencyContact.name.trim()
          ? formData.emergencyContact
          : undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      } as any;
      const cleanedPayload = JSON.parse(JSON.stringify(payload));
      await createUser(
        cleanedPayload,
        formData.password,
        currentUserProfile?.id,
        currentUserProfile?.fullName
      );
      router.push("/users");
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleSubmit = () => {
    setActionPwd("");
    setActionPwdError("");
    setActionPwdOpen(true);
  };

  const handleConfirmActionPwd = async () => {
    if (isSubmitting) return;

    const { getAppSettings } = await import("@/services/settings");
    const settings = await getAppSettings();
    const expected = settings?.actionPassword || "";
    if (!actionPwd.trim()) {
      setActionPwdError("Vui lòng nhập mật khẩu hành động");
      return;
    }
    if (!expected) {
      setActionPwdError(
        "Chưa thiết lập mật khẩu hành động. Vui lòng vào Quản lý mật khẩu để đặt trước."
      );
      return;
    }
    if (actionPwd !== expected) {
      setActionPwdError("Mật khẩu không đúng");
      return;
    }
    setActionPwdOpen(false);
    await performCreate();
  };

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
          {currentUser?.email?.charAt(0)?.toUpperCase() || "P"}
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="medium">
            {currentUser?.email?.split("@")[0] || "Người dùng"}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Người dùng
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
            {currentUser?.email}
          </Typography>
        </Box>
      </Box>

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

          {maintenanceMenuOpen && (
            <Box sx={{ ml: 2, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<CalendarIcon2 />}
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
              bgcolor: "rgba(255,255,255,0.2)",
              mb: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              "& .MuiButton-endIcon": {
                marginLeft: "auto",
              },
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

        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Thêm Nhân viên mới
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Nhập thông tin chi tiết của nhân viên mới
              </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            <Card>
              <CardContent sx={{ p: 4 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                    {error}
                  </Alert>
                )}

                {activeStep === 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Mã nhân viên *"
                      value={formData.employeeId}
                      onChange={(e) => {
                        handleInputChange("employeeId", e.target.value);
                      }}
                      onBlur={handleEmployeeIdBlur}
                      error={!!errors.employeeId}
                      helperText={
                        checkingEmployeeId
                          ? "Đang kiểm tra mã nhân viên..."
                          : errors.employeeId
                      }
                    />
                    <TextField
                      fullWidth
                      label="Họ và tên *"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                    />
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={handleEmailBlur}
                      error={!!errors.email}
                      helperText={
                        checkingEmail ? "Đang kiểm tra email..." : errors.email
                      }
                      disabled={checkingEmail}
                    />
                    <TextField
                      fullWidth
                      label="Mật khẩu *"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      error={!!errors.password}
                      helperText={errors.password}
                    />
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu *"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                    />
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      value={formData.phone}
                      onChange={(e) => {
                        // Chỉ cho phép nhập số
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange("phone", value);
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 15,
                      }}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                    {/* Địa chỉ với Tỉnh/TP và Phường/Xã */}
                    <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ mb: 1 }}
                      >
                        Địa chỉ
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        {/* Tỉnh/Thành phố */}
                        <Box>
                          <TextField
                            fullWidth
                            label="Tỉnh/Thành phố"
                            value={selectedProvince}
                            onClick={(e) => {
                              setProvinceAnchorEl(e.currentTarget);
                              setProvinceSearchTerm("");
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                            placeholder="Chọn tỉnh/thành phố..."
                            sx={{
                              "& .MuiInputBase-root": {
                                cursor: "pointer",
                              },
                            }}
                          />
                          <Menu
                            anchorEl={provinceAnchorEl}
                            open={Boolean(provinceAnchorEl)}
                            onClose={() => setProvinceAnchorEl(null)}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              sx: {
                                maxHeight: 300,
                                width: provinceAnchorEl?.offsetWidth || 300,
                                mt: 0.5,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                borderRadius: "4px",
                                "& .MuiList-root": {
                                  py: 0,
                                  px: 0,
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.25,
                                pb: 1,
                                position: "sticky",
                                top: 0,
                                bgcolor: "#fff",
                                zIndex: 1,
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm..."
                                value={provinceSearchTerm}
                                onChange={(e) =>
                                  setProvinceSearchTerm(e.target.value)
                                }
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#fff",
                                    fontSize: "0.95rem",
                                    "& input": {
                                      py: 0.875,
                                    },
                                  },
                                }}
                              />
                            </Box>
                            {getAllProvinces()
                              .filter((province) =>
                                province
                                  .toLowerCase()
                                  .includes(provinceSearchTerm.toLowerCase())
                              )
                              .map((province) => (
                                <MenuItem
                                  key={province}
                                  selected={province === selectedProvince}
                                  onClick={() => {
                                    handleProvinceChange(province);
                                    setProvinceAnchorEl(null);
                                    setProvinceSearchTerm("");
                                  }}
                                  sx={{
                                    py: 1,
                                    px: 2,
                                    fontSize: "0.95rem",
                                    minHeight: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    "&.Mui-selected": {
                                      bgcolor: "#d32f2f !important",
                                      color: "#fff",
                                      fontWeight: 500,
                                      "&:hover": {
                                        bgcolor: "#c62828 !important",
                                      },
                                    },
                                    "&:hover": {
                                      bgcolor: "#f5f5f5",
                                    },
                                  }}
                                >
                                  {province}
                                </MenuItem>
                              ))}
                            {getAllProvinces().filter((province) =>
                              province
                                .toLowerCase()
                                .includes(provinceSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <MenuItem
                                disabled
                                sx={{
                                  py: 1,
                                  px: 2,
                                  fontSize: "0.95rem",
                                  minHeight: "40px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Không tìm thấy
                              </MenuItem>
                            )}
                          </Menu>
                        </Box>

                        {/* Phường/Xã */}
                        <Box>
                          <TextField
                            fullWidth
                            label="Phường/Xã"
                            value={selectedDistrict}
                            onClick={(e) => {
                              if (selectedProvince) {
                                setDistrictAnchorEl(e.currentTarget);
                                setDistrictSearchTerm("");
                              }
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                            disabled={!selectedProvince}
                            placeholder={
                              !selectedProvince
                                ? "Chọn tỉnh/thành phố trước..."
                                : "Chọn phường/xã..."
                            }
                            helperText={
                              !selectedProvince
                                ? "Vui lòng chọn tỉnh/thành phố trước"
                                : ""
                            }
                            sx={{
                              "& .MuiInputBase-root": {
                                cursor: selectedProvince
                                  ? "pointer"
                                  : "default",
                              },
                            }}
                          />
                          <Menu
                            anchorEl={districtAnchorEl}
                            open={Boolean(districtAnchorEl)}
                            onClose={() => setDistrictAnchorEl(null)}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              sx: {
                                maxHeight: 300,
                                width: districtAnchorEl?.offsetWidth || 300,
                                mt: 0.5,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                borderRadius: "4px",
                                "& .MuiList-root": {
                                  py: 0,
                                  px: 0,
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.25,
                                pb: 1,
                                position: "sticky",
                                top: 0,
                                bgcolor: "#fff",
                                zIndex: 1,
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Tìm kiếm..."
                                value={districtSearchTerm}
                                onChange={(e) =>
                                  setDistrictSearchTerm(e.target.value)
                                }
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#fff",
                                    fontSize: "0.95rem",
                                    "& input": {
                                      py: 0.875,
                                    },
                                  },
                                }}
                              />
                            </Box>
                            {availableDistricts
                              .filter((district) =>
                                district
                                  .toLowerCase()
                                  .includes(districtSearchTerm.toLowerCase())
                              )
                              .map((district) => (
                                <MenuItem
                                  key={district}
                                  selected={district === selectedDistrict}
                                  onClick={() => {
                                    handleDistrictChange(district);
                                    setDistrictAnchorEl(null);
                                    setDistrictSearchTerm("");
                                  }}
                                  sx={{
                                    py: 1,
                                    px: 2,
                                    fontSize: "0.95rem",
                                    minHeight: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    "&.Mui-selected": {
                                      bgcolor: "#d32f2f !important",
                                      color: "#fff",
                                      fontWeight: 500,
                                      "&:hover": {
                                        bgcolor: "#c62828 !important",
                                      },
                                    },
                                    "&:hover": {
                                      bgcolor: "#f5f5f5",
                                    },
                                  }}
                                >
                                  {district}
                                </MenuItem>
                              ))}
                            {availableDistricts.filter((district) =>
                              district
                                .toLowerCase()
                                .includes(districtSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <MenuItem
                                disabled
                                sx={{
                                  py: 1,
                                  px: 2,
                                  fontSize: "0.95rem",
                                  minHeight: "40px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Không tìm thấy
                              </MenuItem>
                            )}
                          </Menu>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {activeStep === 1 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel>Phòng ban *</InputLabel>
                      <Select
                        value={formData.department}
                        label="Phòng ban *"
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                      >
                        {Array.from(
                          new Set(
                            [
                              ...(departments && departments.length > 0
                                ? departments
                                : []),
                              ...DEFAULT_DEPARTMENTS,
                              "Khác",
                            ].filter(Boolean)
                          )
                        ).map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>

                    {formData.department === "Khác" && (
                      <TextField
                        fullWidth
                        label="Tên phòng ban khác *"
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        error={!!errors.department}
                        helperText={errors.department}
                      />
                    )}
                    <TextField
                      fullWidth
                      label="Ngày vào làm *"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={formData.status}
                        label="Trạng thái"
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                      >
                        <MenuItem value="active">Đang làm việc</MenuItem>
                        <MenuItem value="inactive">Tạm nghỉ</MenuItem>
                        <MenuItem value="suspended">Đình chỉ</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Vai trò</InputLabel>
                      <Select value={formData.role} label="Vai trò" disabled>
                        <MenuItem value="staff">Nhân viên</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box sx={{ display: "grid", gap: 3 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Thông tin liên hệ khẩn cấp
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Họ tên"
                          value={formData.emergencyContact.name}
                          onChange={(e) =>
                            handleEmergencyContactChange("name", e.target.value)
                          }
                        />
                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          value={formData.emergencyContact.phone}
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "phone",
                              e.target.value
                            )
                          }
                        />
                        <TextField
                          fullWidth
                          label="Mối quan hệ"
                          value={formData.emergencyContact.relationship}
                          onChange={(e) =>
                            handleEmergencyContactChange(
                              "relationship",
                              e.target.value
                            )
                          }
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Kỹ năng chuyên môn
                      </Typography>
                      <Box>
                        {formData.skills.map((skill, index) => (
                          <Box
                            key={index}
                            sx={{ display: "flex", gap: 1, mb: 1 }}
                          >
                            <TextField
                              fullWidth
                              label={`Kỹ năng ${index + 1}`}
                              value={skill}
                              onChange={(e) =>
                                handleSkillChange(index, e.target.value)
                              }
                            />
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => removeSkill(index)}
                              disabled={formData.skills.length === 1}
                            >
                              <RemoveIcon />
                            </Button>
                          </Box>
                        ))}
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={addSkill}
                        >
                          Thêm kỹ năng
                        </Button>
                      </Box>
                    </Box>

                    <TextField
                      fullWidth
                      label="Ghi chú"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      multiline
                      rows={3}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/users")}
                    startIcon={<CancelIcon />}
                  >
                    Hủy
                  </Button>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {activeStep > 0 && (
                      <Button variant="outlined" onClick={handleBack}>
                        Quay lại
                      </Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                      <Button variant="contained" onClick={handleNext}>
                        Tiếp theo
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={
                          loading || isSubmitting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        disabled={loading || isSubmitting}
                      >
                        {loading || isSubmitting
                          ? "Đang lưu..."
                          : "Lưu nhân viên"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>

      <Dialog open={actionPwdOpen} onClose={() => setActionPwdOpen(false)}>
        <DialogTitle>Xác nhận mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mật khẩu hành động"
            type="password"
            fullWidth
            value={actionPwd}
            onChange={(e) => {
              setActionPwd(e.target.value);
              if (actionPwdError) setActionPwdError("");
            }}
            error={!!actionPwdError}
            helperText={
              actionPwdError || "Nhập mật khẩu để xác nhận thao tác tạo"
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionPwdOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleConfirmActionPwd}
            disabled={isSubmitting || loading}
            startIcon={
              isSubmitting || loading ? <CircularProgress size={20} /> : null
            }
          >
            {isSubmitting || loading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
