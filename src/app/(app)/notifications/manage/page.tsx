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
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
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
import { getUsers, getUserByEmail, User } from "@/services/users";
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
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: "all",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State cho quyền và chọn người nhận
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [canCreateNotification, setCanCreateNotification] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [targetType, setTargetType] = useState<"role" | "specific">("role");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadCurrentUserRole();
    loadNotifications();
  }, [currentUser, router]);

  const loadCurrentUserRole = async () => {
    try {
      if (!currentUser?.email) return;
      const profile = await getUserByEmail(currentUser.email);
      if (profile) {
        const role = profile.role;
        setCurrentUserRole(role);
        // Chỉ director, deputy_director, manager mới có thể tạo thông báo
        setCanCreateNotification(
          role === "director" ||
            role === "deputy_director" ||
            role === "manager"
        );
      }
    } catch (err) {
      console.error("Error loading user role:", err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const allUsers = await getUsers();
      // Chỉ lấy nhân viên và kỹ thuật viên (staff và technician) có uid (đã có auth account)
      const staffAndTechnicians = allUsers.filter(
        (user) =>
          (user.role === "staff" || user.role === "technician") &&
          user.status === "active" &&
          (user.uid || user.id) // Chỉ lấy users có uid hoặc id
      );
      setUsers(staffAndTechnicians);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Không thể tải danh sách nhân viên");
    } finally {
      setLoadingUsers(false);
    }
  };

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
    if (!canCreateNotification) {
      setError(
        "Bạn không có quyền tạo thông báo. Chỉ lãnh đạo và trưởng phòng mới có quyền này."
      );
      return;
    }
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetAudience: "all",
    });
    setTargetType("role");
    setSelectedUserIds([]);
    loadUsers(); // Load danh sách users khi mở dialog
    setAddDialogOpen(true);
  };

  const handleEdit = (notif: Notification) => {
    if (!canCreateNotification) {
      setError(
        "Bạn không có quyền chỉnh sửa thông báo. Chỉ lãnh đạo và trưởng phòng mới có quyền này."
      );
      return;
    }
    setEditingNotification(notif);

    // Xác định targetType và selectedUserIds từ targetAudience
    if (Array.isArray(notif.targetAudience)) {
      setTargetType("specific");
      setSelectedUserIds(notif.targetAudience);
    } else {
      setTargetType("role");
      setSelectedUserIds([]);
    }

    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      priority: notif.priority,
      targetAudience: notif.targetAudience || "all",
      expiresAt: notif.expiresAt
        ? notif.expiresAt.toISOString().split("T")[0]
        : undefined,
    });
    loadUsers(); // Load danh sách users khi mở dialog
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
      if (!canCreateNotification) {
        setError("Bạn không có quyền tạo thông báo");
        return;
      }
      if (!formData.title.trim() || !formData.message.trim()) {
        setError("Tiêu đề và nội dung không được để trống");
        return;
      }

      // Kiểm tra ngày hết hạn không được trước ngày hiện tại
      if (formData.expiresAt) {
        const expiresDate = new Date(formData.expiresAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiresDate < today) {
          setError("Ngày hết hạn không thể trước ngày hiện tại");
          return;
        }
      }

      // Xử lý targetAudience dựa trên targetType
      let finalTargetAudience: NotificationFormData["targetAudience"];
      if (targetType === "specific") {
        if (selectedUserIds.length === 0) {
          setError("Vui lòng chọn ít nhất một người nhận");
          return;
        }
        finalTargetAudience = selectedUserIds;
      } else {
        const audienceValue =
          typeof formData.targetAudience === "string"
            ? formData.targetAudience
            : "all";
        finalTargetAudience = audienceValue as
          | "all"
          | "director"
          | "deputy_director"
          | "manager"
          | "staff"
          | "technician";
      }

      await addNotification(
        { ...formData, targetAudience: finalTargetAudience },
        currentUser?.uid || "",
        currentUser?.email || undefined
      );
      setSuccess("Đã thêm thông báo thành công");
      setAddDialogOpen(false);
      setTargetType("role");
      setSelectedUserIds([]);
      loadNotifications();
    } catch (err: any) {
      setError(err.message || "Không thể thêm thông báo");
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!canCreateNotification) {
        setError("Bạn không có quyền chỉnh sửa thông báo");
        return;
      }
      if (!formData.title.trim() || !formData.message.trim()) {
        setError("Tiêu đề và nội dung không được để trống");
        return;
      }
      if (!editingNotification?.id) return;

      // Kiểm tra ngày hết hạn không được trước ngày hiện tại
      if (formData.expiresAt) {
        const expiresDate = new Date(formData.expiresAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiresDate < today) {
          setError("Ngày hết hạn không thể trước ngày hiện tại");
          return;
        }
      }

      // Xử lý targetAudience dựa trên targetType
      let finalTargetAudience: NotificationFormData["targetAudience"];
      if (targetType === "specific") {
        if (selectedUserIds.length === 0) {
          setError("Vui lòng chọn ít nhất một người nhận");
          return;
        }
        finalTargetAudience = selectedUserIds;
      } else {
        const audienceValue =
          typeof formData.targetAudience === "string"
            ? formData.targetAudience
            : "all";
        finalTargetAudience = audienceValue as
          | "all"
          | "director"
          | "deputy_director"
          | "manager"
          | "staff"
          | "technician";
      }

      await updateNotification(
        editingNotification.id,
        { ...formData, targetAudience: finalTargetAudience },
        currentUser?.uid,
        currentUser?.email || undefined
      );
      setSuccess("Đã cập nhật thông báo thành công");
      setEditDialogOpen(false);
      setEditingNotification(null);
      setTargetType("role");
      setSelectedUserIds([]);
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
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Quản lý Thông báo
        </Typography>
        {canCreateNotification && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm thông báo
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
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
                            ? notif.targetAudience === "all"
                              ? "Tất cả"
                              : notif.targetAudience === "director"
                              ? "Lãnh đạo"
                              : notif.targetAudience === "deputy_director"
                              ? "Phó lãnh đạo"
                              : notif.targetAudience === "manager"
                              ? "Quản lý"
                              : notif.targetAudience === "staff"
                              ? "Nhân viên"
                              : notif.targetAudience === "technician"
                              ? "Kỹ thuật viên"
                              : notif.targetAudience
                            : Array.isArray(notif.targetAudience)
                            ? `${notif.targetAudience.length} người được chọn`
                            : "Nhiều người"}
                        </TableCell>
                        <TableCell>
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {canCreateNotification && (
                            <>
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
                            </>
                          )}
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
          setTargetType("role");
          setSelectedUserIds([]);
          setError(null);
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
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Nội dung"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            multiline
            rows={4}
            sx={{ mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Loại</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as any })
              }
              label="Độ ưu tiên"
            >
              <MenuItem value="low">Thấp</MenuItem>
              <MenuItem value="medium">Trung bình</MenuItem>
              <MenuItem value="high">Cao</MenuItem>
              <MenuItem value="urgent">Khẩn cấp</MenuItem>
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            Chọn đối tượng nhận thông báo
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <RadioGroup
              value={targetType}
              onChange={(e) => {
                const newType = e.target.value as "role" | "specific";
                setTargetType(newType);
                if (newType === "role") {
                  setSelectedUserIds([]);
                  setFormData({ ...formData, targetAudience: "all" });
                }
              }}
            >
              <FormControlLabel
                value="role"
                control={<Radio />}
                label="Chọn theo vai trò"
              />
              <FormControlLabel
                value="specific"
                control={<Radio />}
                label="Chọn nhân viên/kỹ thuật viên cụ thể"
              />
            </RadioGroup>
          </FormControl>

          {targetType === "role" ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Đối tượng</InputLabel>
              <Select
                value={
                  typeof formData.targetAudience === "string"
                    ? formData.targetAudience
                    : "all"
                }
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
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
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chọn nhân viên/kỹ thuật viên</InputLabel>
              <Select
                multiple
                value={selectedUserIds}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedUserIds(
                    typeof value === "string" ? value.split(",") : value
                  );
                }}
                input={<OutlinedInput label="Chọn nhân viên/kỹ thuật viên" />}
                renderValue={(selected) => {
                  if (selected.length === 0) return "Chưa chọn ai";
                  if (selected.length === 1) {
                    const user = users.find(
                      (u) => u.uid === selected[0] || u.id === selected[0]
                    );
                    return user ? user.fullName : selected[0];
                  }
                  return `Đã chọn ${selected.length} người`;
                }}
              >
                {loadingUsers ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Đang tải...
                  </MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>Không có nhân viên/kỹ thuật viên</MenuItem>
                ) : (
                  users.map((user) => {
                    const userId = user.uid || user.id || "";
                    return (
                      <MenuItem key={userId} value={userId}>
                        <Checkbox checked={selectedUserIds.includes(userId)} />
                        <ListItemText
                          primary={user.fullName}
                          secondary={`${
                            user.role === "staff"
                              ? "Nhân viên"
                              : "Kỹ thuật viên"
                          } - ${user.department}`}
                        />
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              <FormHelperText>
                Chọn một hoặc nhiều nhân viên/kỹ thuật viên để gửi thông báo
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            fullWidth
            label="Ngày hết hạn (tùy chọn)"
            type="date"
            value={formData.expiresAt || ""}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split("T")[0], // Không cho chọn ngày trước hôm nay
            }}
            helperText="Ngày hết hạn không thể trước ngày hiện tại"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
              setTargetType("role");
              setSelectedUserIds([]);
              setError(null);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={addDialogOpen ? handleSaveAdd : handleSaveEdit}
            disabled={!canCreateNotification}
          >
            {addDialogOpen ? "Lưu" : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
