"use client";
// xem chi tiết nhân viên
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  TextField,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  ContactPhone as ContactIcon,
  Star as StarIcon,
  Note as NoteIcon,
  Warning as WarningIcon,
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
  Warning as Warning2Icon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon2,
  Add as AddIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { User, getUserByEmail } from "@/services/users";
import { useAuth } from "@/contexts/AuthContext";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const theme = useTheme();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const { fetchUserById, removeUser, loading, error, clearError } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionPwdOpen, setActionPwdOpen] = useState(false);
  const [actionPwd, setActionPwd] = useState("");
  const [actionPwdError, setActionPwdError] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "new" | "delete" | "edit" | null
  >(null);

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

  useEffect(() => {
    (async () => {
      try {
        if (!currentUser?.email) return;
        const profile = await getUserByEmail(currentUser.email);
        setCurrentUserRole(profile?.role || null);
      } catch (e) {
        // ignore
      }
    })();
  }, [currentUser?.email]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const userData = await fetchUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error("Lỗi khi tải thông tin nhân viên:", error);
    }
  };

  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (user) {
      try {
        setActionPwd("");
        setActionPwdError("");
        setPendingAction("delete");
        setActionPwdOpen(true);
      } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
      }
    }
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
    try {
      if (pendingAction === "delete" && user) {
        await removeUser(user.id!);
        setDeleteDialogOpen(false);
        router.push("/users");
      } else if (pendingAction === "new") {
        router.push("/users/new");
      } else if (pendingAction === "edit" && user) {
        router.push(`/users/${user.id}/edit`);
      }
      setActionPwdOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const requestNavigateNew = () => {
    setActionPwd("");
    setActionPwdError("");
    setPendingAction("new");
    setActionPwdOpen(true);
  };

  const requestNavigateEdit = () => {
    setActionPwd("");
    setActionPwdError("");
    setPendingAction("edit");
    setActionPwdOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "director":
        return "error";
      case "deputy_director":
        return "secondary";
      case "manager":
        return "warning";
      case "staff":
        return "info";
      case "technician":
        return "success";
      default:
        return "default";
    }
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
                onClick={requestNavigateNew}
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
            Đang tải thông tin nhân viên...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Không tìm thấy thông tin nhân viên</Alert>
      </Container>
    );
  }

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
        ></Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/users")}
              >
                Quay lại
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Thông tin Nhân viên
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Chi tiết thông tin của nhân viên {user.fullName}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Thông tin cơ bản */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                  }}
                >
                  {user.fullName.charAt(0)}
                </Avatar>
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
                    <Chip
                      label={getStatusText(user.status)}
                      color={getStatusColor(user.status) as any}
                    />
                    <Chip
                      label={user.department}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton color="warning" onClick={requestNavigateEdit}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton color="error" onClick={handleDeleteUser}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 4,
                }}
              >
                {/* Thông tin liên hệ */}
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <ContactIcon color="primary" />
                    Thông tin liên hệ
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText primary="Email" secondary={user.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={user.phone}
                      />
                    </ListItem>
                    {user.address && (
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Địa chỉ"
                          secondary={user.address}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                {/* Thông tin công việc */}
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <WorkIcon color="primary" />
                    Thông tin công việc
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phòng ban"
                        secondary={user.department}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Vai trò"
                        secondary={getRoleText(user.role)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Ngày vào làm"
                        secondary={formatDate(user.startDate)}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
            }}
          >
            {user.skills && user.skills.length > 0 && (
              <Box>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <StarIcon color="primary" />
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
                  </CardContent>
                </Card>
              </Box>
            )}

            {user.emergencyContact && user.emergencyContact.name && (
              <Box>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <WarningIcon color="primary" />
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
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>

          {user.notes && (
            <Box sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <NoteIcon color="primary" />
                    Ghi chú
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          <Card sx={{ mt: 4 }}>
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
                    <strong>Cập nhật lần cuối:</strong>{" "}
                    {formatDate(user.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
            <DialogContent>
              <Typography>
                Bạn có chắc chắn muốn xóa nhân viên{" "}
                <strong>{user.fullName}</strong> (Mã: {user.employeeId})?
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Hành động này không thể hoàn tác!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
              <Button
                onClick={confirmDeleteUser}
                color="error"
                variant="contained"
              >
                Xóa
              </Button>
            </DialogActions>
          </Dialog>

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
                  actionPwdError ||
                  (pendingAction === "delete"
                    ? "Nhập mật khẩu để xác nhận xóa"
                    : "Nhập mật khẩu để xác nhận thao tác")
                }
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setActionPwdOpen(false)}>Hủy</Button>
              <Button
                variant="contained"
                color={pendingAction === "delete" ? "error" : "primary"}
                onClick={handleConfirmActionPwd}
              >
                Xác nhận
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}
