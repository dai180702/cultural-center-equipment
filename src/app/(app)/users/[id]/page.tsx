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
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/services/users";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { fetchUserById, removeUser, loading, error, clearError } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Tải thông tin nhân viên
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

  // Xử lý xóa nhân viên
  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
  };

  // Xác nhận xóa nhân viên
  const confirmDeleteUser = async () => {
    if (user) {
      try {
        await removeUser(user.id!);
        setDeleteDialogOpen(false);
        router.push("/users");
      } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
      }
    }
  };

  // Lấy màu cho trạng thái
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

  // Lấy màu cho vai trò
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
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

  // Lấy text hiển thị cho trạng thái
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

  // Lấy text hiển thị cho vai trò
  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "manager":
        return "Quản lý";
      case "staff":
        return "Nhân viên";
      case "technician":
        return "Kỹ thuật viên";
      default:
        return role;
    }
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format ngày ngắn gọn
  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
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
                {user.position}
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
                  label={getRoleText(user.role)}
                  color={getRoleColor(user.role) as any}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  color="warning"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                >
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
                    <ListItemText primary="Địa chỉ" secondary={user.address} />
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
                    <PersonIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Chức vụ" secondary={user.position} />
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
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vai trò"
                    secondary={getRoleText(user.role)}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Thông tin bổ sung */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
        }}
      >
        {/* Kỹ năng chuyên môn */}
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

        {/* Thông tin liên hệ khẩn cấp */}
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

      {/* Ghi chú */}
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

      {/* Thông tin hệ thống */}
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
                <strong>Cập nhật lần cuối:</strong> {formatDate(user.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhân viên <strong>{user.fullName}</strong>{" "}
            (Mã: {user.employeeId})?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
