"use client";

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
  Avatar,
  Chip,
  Divider,
  Paper,
  FormHelperText,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  InputAdornment,
  Autocomplete,
  Menu,
  ListItemButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ContactPhone as ContactIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  Note as NoteIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { uploadUserAvatar } from "@/services/storage";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserByEmail, updateUser, User } from "@/services/users";
import { DEFAULT_DEPARTMENTS } from "@/lib/departments";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  getAllProvinces,
  getDistrictsByProvince,
  parseAddress,
  formatAddress,
} from "@/data/vietnam-provinces";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [formData, setFormData] = useState<{
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    startDate: string;
    status: "active" | "inactive" | "suspended";
    role: "director" | "deputy_director" | "manager" | "staff" | "technician";
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // State cho menu tìm kiếm
  const [provinceAnchorEl, setProvinceAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [districtAnchorEl, setDistrictAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [provinceSearchTerm, setProvinceSearchTerm] = useState("");
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, [currentUser?.email]);

  const loadUserProfile = async () => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await getUserByEmail(currentUser.email);
      if (userData) {
        setUser(userData);

        // Parse địa chỉ từ string
        const { province, district } = parseAddress(userData.address || "");
        setSelectedProvince(province);
        setSelectedDistrict(district);
        if (province) {
          setAvailableDistricts(getDistrictsByProvince(province));
        }

        setFormData({
          employeeId: userData.employeeId || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          department: userData.department || "",
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
      console.error("Lỗi khi tải thông tin:", error);
      setError("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload ảnh đại diện
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      setAvatarError("Vui lòng chọn file ảnh");
      return;
    }
    // Kiểm tra kích thước (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError("");
      
      // Upload ảnh lên Firebase Storage
      const avatarUrl = await uploadUserAvatar(user.id, file);
      
      // Cập nhật avatar URL vào user profile
      await updateUser(user.id, { avatar: avatarUrl });
      
      // Reload user data
      await loadUserProfile();
      
      setSuccess("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error("Lỗi upload avatar:", err);
      setAvatarError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      const newSkills = formData.skills.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại phải có 10-15 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    // Giữ lại district đã chọn nếu nó thuộc province mới
    const districts = getDistrictsByProvince(province);
    setAvailableDistricts(districts);

    // Nếu district hiện tại không thuộc province mới, xóa nó
    if (selectedDistrict && !districts.includes(selectedDistrict)) {
      setSelectedDistrict("");
      handleInputChange("address", formatAddress(province, ""));
    } else {
      handleInputChange("address", formatAddress(province, selectedDistrict));
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);

    // Cập nhật address trong formData
    handleInputChange("address", formatAddress(selectedProvince, district));
  };

  const handleSave = async () => {
    if (!validateForm() || !user?.id) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const cleanSkills = formData.skills.filter(
        (skill) => skill.trim() !== ""
      );

      // Format địa chỉ từ province và district
      const finalAddress = formatAddress(selectedProvince, selectedDistrict);

      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: finalAddress || undefined,
        emergencyContact: formData.emergencyContact.name.trim()
          ? formData.emergencyContact
          : undefined,
        skills: cleanSkills.length > 0 ? cleanSkills : undefined,
        notes: formData.notes.trim() || undefined,
      };

      const cleanedData = JSON.parse(JSON.stringify(updateData));
      await updateUser(user.id, cleanedData);

      setSuccess("Cập nhật thông tin thành công!");
      setEditMode(false);
      await loadUserProfile();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      // Parse lại địa chỉ gốc
      const { province, district } = parseAddress(user.address || "");
      setSelectedProvince(province);
      setSelectedDistrict(district);
      if (province) {
        setAvailableDistricts(getDistrictsByProvince(province));
      }

      setFormData({
        employeeId: user.employeeId || "",
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        startDate: user.startDate ? user.startDate.split("T")[0] : "",
        status: user.status || "active",
        role: user.role || "staff",
        address: user.address || "",
        emergencyContact: {
          name: user.emergencyContact?.name || "",
          phone: user.emergencyContact?.phone || "",
          relationship: user.emergencyContact?.relationship || "",
        },
        skills: user.skills && user.skills.length > 0 ? user.skills : [""],
        notes: user.notes || "",
      });
    }
    setEditMode(false);
    setErrors({});
    setError("");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang làm việc";
      case "inactive":
        return "Tạm nghỉ";
      case "suspended":
        return "Đình chỉ";
      default:
        return status;
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm() || !currentUser) return;

    try {
      setPasswordLoading(true);
      setError("");
      setSuccess("");

      // Xác thực lại người dùng với mật khẩu hiện tại
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Cập nhật mật khẩu mới
      await updatePassword(currentUser, passwordData.newPassword);

      setSuccess("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});

      setTabValue(0);
    } catch (error: any) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setPasswordErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      } else {
        setError("Không thể đổi mật khẩu. Vui lòng thử lại.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
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
            Đang tải thông tin...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy thông tin cá nhân. Vui lòng liên hệ quản trị viên.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thông tin cá nhân
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem và cập nhật thông tin cá nhân của bạn
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user.avatar}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {user.fullName.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload-profile"
                type="file"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
              <label htmlFor="avatar-upload-profile">
                <IconButton
                  component="span"
                  disabled={uploadingAvatar}
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    bgcolor: "primary.main",
                    color: "white",
                    width: 32,
                    height: 32,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  {uploadingAvatar ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </label>
              {avatarError && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ position: "absolute", bottom: -20, left: 0, whiteSpace: "nowrap" }}
                >
                  {avatarError}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.fullName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {getRoleText(user.role)}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  label={user.employeeId}
                  color="primary"
                  variant="outlined"
                />
                <Chip label={getStatusText(user.status)} color="success" />
                <Chip
                  label={user.department}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
            <Box>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      saving ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu"}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Thông tin chung" />
            <Tab label="Thông tin liên hệ" />
            <Tab label="Thông tin bổ sung" />
            <Tab
              label="Đổi mật khẩu"
              icon={<LockIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Tab 1: Thông tin chung */}
          <TabPanel value={tabValue} index={0}>
            {!editMode ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã nhân viên
                  </Typography>
                  <Typography variant="body1">{user.employeeId}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1">{user.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng ban
                  </Typography>
                  <Typography variant="body1">{user.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vai trò
                  </Typography>
                  <Typography variant="body1">
                    {getRoleText(user.role)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày vào làm
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.startDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Typography variant="body1">
                    {getStatusText(user.status)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Mã nhân viên"
                  value={formData.employeeId}
                  disabled
                  helperText="Không thể thay đổi mã nhân viên"
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
                  label="Email"
                  value={formData.email}
                  disabled
                  helperText="Không thể thay đổi email"
                />
                <TextField
                  fullWidth
                  label="Số điện thoại *"
                  value={formData.phone}
                  onChange={(e) => {
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
                <TextField
                  fullWidth
                  label="Phòng ban"
                  value={formData.department}
                  disabled
                  helperText="Liên hệ quản lý để thay đổi"
                />
                <TextField
                  fullWidth
                  label="Vai trò"
                  value={getRoleText(formData.role)}
                  disabled
                  helperText="Liên hệ quản lý để thay đổi"
                />
              </Box>
            )}
          </TabPanel>

          {/* Tab 2: Thông tin liên hệ */}
          <TabPanel value={tabValue} index={1}>
            {!editMode ? (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.address || "Chưa cập nhật"}
                  </Typography>
                </Box>

                {user.emergencyContact && user.emergencyContact.name && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Liên hệ khẩn cấp
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Họ tên"
                          secondary={user.emergencyContact.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Số điện thoại"
                          secondary={user.emergencyContact.phone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Mối quan hệ"
                          secondary={user.emergencyContact.relationship}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Địa chỉ
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {/* Tỉnh/Thành phố với search riêng */}
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

                    {/* Phường/Xã với search riêng */}
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
                            cursor: selectedProvince ? "pointer" : "default",
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
                      placeholder="Họ tên người liên hệ"
                    />
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        handleEmergencyContactChange("phone", e.target.value)
                      }
                      placeholder="Số điện thoại"
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
                      placeholder="VD: Vợ/Chồng, Bố/Mẹ..."
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </TabPanel>

          {/* Tab 3: Thông tin bổ sung */}
          <TabPanel value={tabValue} index={2}>
            {!editMode ? (
              <Box>
                {user.skills && user.skills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Kỹ năng chuyên môn
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {user.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {user.notes && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Ghi chú
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.notes}
                    </Typography>
                  </Box>
                )}

                {(!user.skills || user.skills.length === 0) && !user.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có thông tin bổ sung
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Kỹ năng chuyên môn
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {formData.skills.map((skill, index) => (
                      <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
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
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addSkill}
                      sx={{ mt: 1 }}
                    >
                      Thêm kỹ năng
                    </Button>
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label="Ghi chú"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Ghi chú thêm..."
                />
              </Box>
            )}
          </TabPanel>

          {/* Tab 4: Đổi mật khẩu */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 600 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh có ít nhất
                6 ký tự.
              </Alert>

              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField
                  fullWidth
                  label="Mật khẩu hiện tại *"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        edge="end"
                      >
                        {showCurrentPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Mật khẩu mới *"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword || "Tối thiểu 6 ký tự"}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu mới *"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />

                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordErrors({});
                    }}
                    disabled={passwordLoading}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      passwordLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <LockIcon />
                      )
                    }
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin hệ thống
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Ngày tạo:</strong> {formatDate(user.createdAt)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Cập nhật lần cuối:</strong> {formatDate(user.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
