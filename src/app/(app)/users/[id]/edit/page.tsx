"use client";
// chỉnh sửa nhân viên
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
  Box as MuiBox,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  Drawer,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ContactPhone as ContactIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
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
  Warning as WarningIcon2,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon2,
  Edit as EditIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/services/users";
import { useAuth } from "@/contexts/AuthContext";

const steps = ["Thông tin cơ bản", "Thông tin công việc", "Thông tin bổ sung"]; // không còn sử dụng stepper

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const theme = useTheme();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const { fetchUserById, editUser, departments, loading, error, clearError } =
    useUsers();

  // State cho form
  const [formData, setFormData] = useState<{
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    startDate: string;
    status: "active" | "inactive" | "suspended";
    role: "admin" | "manager" | "staff" | "technician";
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    skills: string[];
    notes: string;
  }>({
    employeeId: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    startDate: "",
    status: "active",
    role: "staff",
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    skills: [""],
    notes: "",
  });

  // State cho validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0); // giữ state để tránh chỉnh sửa lớn, nhưng không dùng điều hướng
  const [initialLoading, setInitialLoading] = useState(true);
  // Action password state
  const [actionPwdOpen, setActionPwdOpen] = useState(false);
  const [actionPwd, setActionPwd] = useState("");
  const [actionPwdError, setActionPwdError] = useState("");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [maintenanceMenuOpen, setMaintenanceMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const [usersMenuOpen, setUsersMenuOpen] = useState(true);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/users")) setUsersMenuOpen(true);
  }, [pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Tải thông tin nhân viên
  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setInitialLoading(true);
      const userData = await fetchUserById(userId);
      if (userData) {
        setFormData({
          employeeId: userData.employeeId || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          department: userData.department || "",
          position: userData.position || "",
          startDate: userData.startDate ? userData.startDate.split("T")[0] : "",
          status: userData.status || "active",
          role: userData.role || "staff",
          address: userData.address || "",
          emergencyContact: {
            name: userData.emergencyContact?.name || "",
            phone: userData.emergencyContact?.phone || "",
            relationship: userData.emergencyContact?.relationship || "",
          },
          skills:
            userData.skills && userData.skills.length > 0
              ? userData.skills
              : [""],
          notes: userData.notes || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin nhân viên:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi khi user nhập
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Xử lý thay đổi emergency contact
  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  // Xử lý thay đổi skills
  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  // Thêm skill mới
  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  // Xóa skill
  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      const newSkills = formData.skills.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0 || step === -1) {
      if (!formData.employeeId.trim()) {
        newErrors.employeeId = "Mã nhân viên là bắt buộc";
      }
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Họ tên là bắt buộc";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Số điện thoại là bắt buộc";
      }
    }

    if (step === 1 || step === -1) {
      if (!formData.department.trim()) {
        newErrors.department = "Phòng ban là bắt buộc";
      }
      if (!formData.position.trim()) {
        newErrors.position = "Chức vụ là bắt buộc";
      }
      if (!formData.startDate) {
        newErrors.startDate = "Ngày vào làm là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Không còn điều hướng step

  // Xử lý submit form
  const performUpdate = async () => {
    // Validate toàn bộ các bước cùng lúc
    if (!validateStep(-1)) {
      return;
    }

    try {
      // Loại bỏ skill rỗng
      const cleanSkills = formData.skills.filter(
        (skill) => skill.trim() !== ""
      );

      const userData = {
        ...formData,
        skills: cleanSkills,
        // Loại bỏ emergency contact nếu không có thông tin
        emergencyContact: formData.emergencyContact.name.trim()
          ? formData.emergencyContact
          : undefined,
        // Loại bỏ address nếu rỗng
        address: formData.address.trim() || undefined,
        // Loại bỏ notes nếu rỗng
        notes: formData.notes.trim() || undefined,
      };

      // Loại bỏ các trường undefined để tránh lỗi updateDoc
      const cleanedUserData = JSON.parse(JSON.stringify(userData));

      await editUser(userId, cleanedUserData);
      router.push(`/users/${userId}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
    }
  };

  const handleSubmit = () => {
    setActionPwd("");
    setActionPwdError("");
    setActionPwdOpen(true);
  };

  const handleConfirmActionPwd = async () => {
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
    await performUpdate();
  };

  // Xử lý hủy
  const handleCancel = () => {
    router.push(`/users/${userId}`);
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Đang tải thông tin nhân viên...
          </Typography>
        </Box>
      </Container>
    );
  }

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
              "& .MuiButton-endIcon": { marginLeft: "auto" },
            }}
          >
            Quản lý thiết bị
          </Button>

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
                startIcon={<EditIcon />}
                onClick={() => router.push(`/users/${userId}/edit`)}
                sx={{
                  justifyContent: "flex-start",
                  color: "white",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  py: 0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Chỉnh sửa
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
      {isMobile && (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: 280, bgcolor: "primary.main" } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {!isMobile && <SidebarContent />}

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
          {isMobile && (
            <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push(`/users/${userId}`)}
              >
                Quay lại
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Chỉnh sửa Nhân viên
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Cập nhật thông tin của nhân viên {formData.fullName}
            </Typography>
          </Box>

          {/* Bỏ Stepper: form một trang */}

          {/* Form một trang */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                  {error}
                </Alert>
              )}
              {/* Thông tin cơ bản */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <MuiBox
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Mã nhân viên *"
                      value={formData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                      error={!!errors.employeeId}
                      helperText={errors.employeeId}
                      placeholder="VD: NV001"
                    />
                  </MuiBox>
                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Họ và tên *"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </MuiBox>
                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      error={!!errors.email}
                      helperText={errors.email}
                      placeholder="example@company.com"
                    />
                  </MuiBox>
                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Số điện thoại *"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      error={!!errors.phone}
                      helperText={errors.phone}
                      placeholder="0123456789"
                    />
                  </MuiBox>
                  <MuiBox sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      multiline
                      rows={2}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </MuiBox>
                </MuiBox>
              </Paper>
              {/* Thông tin công việc */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin công việc
                </Typography>
                <MuiBox
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <MuiBox>
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel>Phòng ban *</InputLabel>
                      <Select
                        value={formData.department}
                        label="Phòng ban *"
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </MuiBox>
                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Chức vụ *"
                      value={formData.position}
                      onChange={(e) =>
                        handleInputChange("position", e.target.value)
                      }
                      error={!!errors.position}
                      helperText={errors.position}
                      placeholder="VD: Nhân viên, Trưởng nhóm..."
                    />
                  </MuiBox>
                  <MuiBox>
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
                  </MuiBox>
                  <MuiBox>
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
                  </MuiBox>
                  <MuiBox>
                    <FormControl fullWidth>
                      <InputLabel>Vai trò</InputLabel>
                      <Select
                        value={formData.role}
                        label="Vai trò"
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                      >
                        <MenuItem value="admin">Quản trị viên</MenuItem>
                        <MenuItem value="manager">Quản lý</MenuItem>
                        <MenuItem value="staff">Nhân viên</MenuItem>
                        <MenuItem value="technician">Kỹ thuật viên</MenuItem>
                      </Select>
                    </FormControl>
                  </MuiBox>
                </MuiBox>
              </Paper>
              {/* Thông tin bổ sung */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin bổ sung
                </Typography>
                <MuiBox sx={{ display: "grid", gap: 3 }}>
                  <MuiBox>
                    <Typography variant="h6" gutterBottom>
                      Thông tin liên hệ khẩn cấp
                    </Typography>
                    <MuiBox
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <MuiBox>
                        <TextField
                          fullWidth
                          label="Họ tên"
                          value={formData.emergencyContact.name}
                          onChange={(e) =>
                            handleEmergencyContactChange("name", e.target.value)
                          }
                          placeholder="Họ tên người liên hệ"
                        />
                      </MuiBox>
                      <MuiBox>
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
                          placeholder="Số điện thoại"
                        />
                      </MuiBox>
                      <MuiBox>
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
                          placeholder="VD: Vợ/Chồng, Bố/Mẹ..."
                        />
                      </MuiBox>
                    </MuiBox>
                  </MuiBox>

                  <MuiBox>
                    <Typography variant="h6" gutterBottom>
                      Kỹ năng chuyên môn
                    </Typography>
                    <MuiBox sx={{ mb: 2 }}>
                      {formData.skills.map((skill, index) => (
                        <MuiBox
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
                            placeholder="VD: Quản lý dự án, Lập trình..."
                          />
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeSkill(index)}
                            disabled={formData.skills.length === 1}
                          >
                            <RemoveIcon />
                          </Button>
                        </MuiBox>
                      ))}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addSkill}
                        sx={{ mt: 1 }}
                      >
                        Thêm kỹ năng
                      </Button>
                    </MuiBox>
                  </MuiBox>

                  <MuiBox>
                    <TextField
                      fullWidth
                      label="Ghi chú"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      multiline
                      rows={3}
                      placeholder="Ghi chú thêm về nhân viên..."
                    />
                  </MuiBox>
                </MuiBox>
              </Paper>
              {/* Action buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Cập nhật nhân viên"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
        {/* Password confirmation dialog */}
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
                actionPwdError || "Nhập mật khẩu để xác nhận thao tác cập nhật"
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionPwdOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleConfirmActionPwd}>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
