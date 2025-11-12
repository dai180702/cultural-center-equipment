"use client";
// Quản lý thông báo
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  Notification,
  NotificationFormData,
} from "@/services/notifications";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

export default function NotificationsManagePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: "all",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadNotifications();
  }, [currentUser, router]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetAudience: "all",
    });
    setAddDialogOpen(true);
  };

  const handleEdit = (notif: Notification) => {
    setEditingNotification(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      priority: notif.priority,
      targetAudience: notif.targetAudience || "all",
      expiresAt: notif.expiresAt ? notif.expiresAt.toISOString().split("T")[0] : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (notif: Notification) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
      try {
        await deleteNotification(notif.id!);
        setSuccess("Đã xóa thông báo thành công");
        loadNotifications();
      } catch (err: any) {
        setError(err.message || "Không thể xóa thông báo");
      }
    }
  };

  const handleSaveAdd = async () => {
    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        setError("Tiêu đề và nội dung không được để trống");
        return;
      }
      await addNotification(
        formData,
        currentUser?.uid || "",
        currentUser?.email || undefined
      );
      setSuccess("Đã thêm thông báo thành công");
      setAddDialogOpen(false);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || "Không thể thêm thông báo");
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        setError("Tiêu đề và nội dung không được để trống");
        return;
      }
      if (!editingNotification?.id) return;
      await updateNotification(
        editingNotification.id,
        formData,
        currentUser?.uid,
        currentUser?.email || undefined
      );
      setSuccess("Đã cập nhật thông báo thành công");
      setEditDialogOpen(false);
      setEditingNotification(null);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật thông báo");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "alert":
        return "error";
      default:
        return "info";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1">
          Quản lý Thông báo
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Thêm thông báo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Độ ưu tiên</TableCell>
                    <TableCell>Đối tượng</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notif, index) => (
                      <TableRow key={notif.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{notif.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={notif.type}
                            color={getTypeColor(notif.type) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notif.priority}
                            color={getPriorityColor(notif.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {typeof notif.targetAudience === "string"
                            ? notif.targetAudience
                            : "Nhiều người"}
                        </TableCell>
                        <TableCell>
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(notif)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(notif)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm/sửa */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {addDialogOpen ? "Thêm thông báo mới" : "Sửa thông báo"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Nội dung"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Loại</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              label="Loại"
            >
              <MenuItem value="info">Thông tin</MenuItem>
              <MenuItem value="warning">Cảnh báo</MenuItem>
              <MenuItem value="error">Lỗi</MenuItem>
              <MenuItem value="success">Thành công</MenuItem>
              <MenuItem value="alert">Cảnh báo khẩn</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Độ ưu tiên</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              label="Độ ưu tiên"
            >
              <MenuItem value="low">Thấp</MenuItem>
              <MenuItem value="medium">Trung bình</MenuItem>
              <MenuItem value="high">Cao</MenuItem>
              <MenuItem value="urgent">Khẩn cấp</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Đối tượng</InputLabel>
            <Select
              value={typeof formData.targetAudience === "string" ? formData.targetAudience : "all"}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              label="Đối tượng"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="director">Lãnh đạo</MenuItem>
              <MenuItem value="deputy_director">Phó lãnh đạo</MenuItem>
              <MenuItem value="manager">Quản lý</MenuItem>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="technician">Kỹ thuật viên</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Ngày hết hạn (tùy chọn)"
            type="date"
            value={formData.expiresAt || ""}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={addDialogOpen ? handleSaveAdd : handleSaveEdit}
          >
            {addDialogOpen ? "Lưu" : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

