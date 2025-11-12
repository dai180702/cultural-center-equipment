"use client";
// Quản lý phòng ban
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
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
} from "@/services/departments";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { getAppSettings } from "@/services/settings";

export default function DepartmentsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionPwdOpen, setActionPwdOpen] = useState(false);
  const [actionPwd, setActionPwd] = useState("");
  const [actionPwdError, setActionPwdError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDepartments();
  }, [currentUser, router]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError("Không thể tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setAddDialogOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, description: dept.description || "" });
    setEditDialogOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setDepartmentToDelete(dept);
    setActionPwdOpen(true);
  };

  const handleConfirmActionPwd = async () => {
    if (!actionPwd.trim()) {
      setActionPwdError("Vui lòng nhập mật khẩu hành động");
      return;
    }
    try {
      const settings = await getAppSettings();
      const expected = settings?.actionPassword || "";
      if (!expected) {
        setActionPwdError("Chưa thiết lập mật khẩu hành động");
        return;
      }
      if (actionPwd !== expected) {
        setActionPwdError("Mật khẩu không đúng");
        return;
      }
      setActionPwdOpen(false);
      if (departmentToDelete) {
        await deleteDepartment(departmentToDelete.id!);
        setSuccess("Đã xóa phòng ban thành công");
        loadDepartments();
        setDepartmentToDelete(null);
      }
    } catch (err: any) {
      setActionPwdError(err.message || "Lỗi xác thực mật khẩu");
    }
  };

  const handleSaveAdd = async () => {
    try {
      if (!formData.name.trim()) {
        setError("Tên phòng ban không được để trống");
        return;
      }
      await addDepartment(
        formData,
        currentUser?.uid || "",
        currentUser?.email || undefined
      );
      setSuccess("Đã thêm phòng ban thành công");
      setAddDialogOpen(false);
      loadDepartments();
    } catch (err: any) {
      setError(err.message || "Không thể thêm phòng ban");
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!formData.name.trim()) {
        setError("Tên phòng ban không được để trống");
        return;
      }
      if (!editingDepartment?.id) return;
      await updateDepartment(
        editingDepartment.id,
        formData,
        currentUser?.uid,
        currentUser?.email || undefined
      );
      setSuccess("Đã cập nhật phòng ban thành công");
      setEditDialogOpen(false);
      setEditingDepartment(null);
      loadDepartments();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật phòng ban");
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1">
          Quản lý Phòng ban
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Thêm phòng ban
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
          <TextField
            fullWidth
            placeholder="Tìm kiếm phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

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
                    <TableCell>Tên phòng ban</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((dept, index) => (
                      <TableRow key={dept.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell>{dept.description || "-"}</TableCell>
                        <TableCell>
                          {dept.createdAt
                            ? new Date(dept.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(dept)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(dept)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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

      {/* Dialog thêm */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm phòng ban mới</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên phòng ban"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveAdd}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sửa phòng ban</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên phòng ban"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog mật khẩu hành động */}
      <Dialog open={actionPwdOpen} onClose={() => setActionPwdOpen(false)}>
        <DialogTitle>Xác nhận mật khẩu hành động</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Mật khẩu hành động"
            value={actionPwd}
            onChange={(e) => {
              setActionPwd(e.target.value);
              setActionPwdError("");
            }}
            error={!!actionPwdError}
            helperText={actionPwdError || "Nhập mật khẩu để xác nhận xóa"}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionPwdOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleConfirmActionPwd}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

