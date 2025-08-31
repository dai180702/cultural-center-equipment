"use client";
// xem chi tiết thiết bị
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getDeviceById, deleteDevice, Device } from "@/services/devices";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

export default function DeviceDetailPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const deviceId = params.id as string;

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDevice();
  }, [currentUser, router, deviceId]);

  // Cập nhật sidebar khi thay đổi kích thước màn hình
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // Ẩn sidebar trên mobile - chỉ hiện khi click menu
    } else {
      setSidebarOpen(true); // Hiện sidebar trên desktop
    }
  }, [isMobile]);

  // Thêm listener cho resize window để đảm bảo responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMobileSize = width < 1200; // Khớp với breakpoint lg

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

  const loadDevice = async () => {
    try {
      setLoading(true);
      const deviceData = await getDeviceById(deviceId);
      if (deviceData) {
        setDevice(deviceData);
      } else {
        setError("Không tìm thấy thiết bị");
      }
    } catch (err) {
      console.error("Error loading device:", err);
      setError("Không thể tải thông tin thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteDevice(deviceId);
      setSuccess("Thiết bị đã được xóa thành công");
      setTimeout(() => {
        router.push("/devices");
      }, 1500);
    } catch (err) {
      setError("Không thể xóa thiết bị");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "broken":
        return "error";
      case "retired":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "maintenance":
        return "Cần bảo trì";
      case "broken":
        return "Đã hỏng";
      case "retired":
        return "Thanh lý";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon />;
      case "maintenance":
        return <BuildIcon />;
      case "broken":
        return <ErrorIcon />;
      case "retired":
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatFirestoreDate = (timestamp: any) => {
    if (!timestamp) return "Chưa có thông tin";

    try {
      // Nếu là Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString("vi-VN");
      }
      // Nếu là Date string
      if (typeof timestamp === "string") {
        return new Date(timestamp).toLocaleDateString("vi-VN");
      }
      // Nếu là Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("vi-VN");
      }

      return "Định dạng không hợp lệ";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Lỗi định dạng ngày";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "Chưa có thông tin";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!currentUser) return null;

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
      {/* Tiêu đề */}
      <Box sx={{ mb: 4, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý Thiết bị
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên
        </Typography>
      </Box>

      {/* Hồ sơ người dùng */}
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
          P
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="medium">
            Minh Đại
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Người dùng
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
            {currentUser.email}
          </Typography>
        </Box>
      </Box>

      {/* Menu điều hướng */}
      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Button
          fullWidth
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/devices")}
          sx={{
            justifyContent: "flex-start",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            mb: 2,
          }}
        >
          Quay lại danh sách
        </Button>

        <Button
          fullWidth
          startIcon={<EditIcon />}
          onClick={() => router.push(`/devices/${deviceId}/edit`)}
          sx={{
            justifyContent: "flex-start",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            mb: 2,
          }}
        >
          Chỉnh sửa thiết bị
        </Button>

        <Button
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={handleDeleteClick}
          sx={{
            justifyContent: "flex-start",
            color: "white",
            bgcolor: "rgba(255,255,255,0.1)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            mb: 2,
          }}
        >
          Xóa thiết bị
        </Button>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.3)", my: 2 }} />

        <Button
          fullWidth
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{
            justifyContent: "flex-start",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          Về trang chủ
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!device) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy thiết bị. Vui lòng kiểm tra lại đường dẫn.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer - Ẩn hoàn toàn trên mobile, chỉ hiện khi click menu */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              bgcolor: "primary.main",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Desktop Sidebar - Luôn hiển thị trên desktop */}
      {!isMobile && <SidebarContent />}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Bar */}
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
          {/* Mobile Menu Button - Hiển thị nút menu 3 gạch trên mobile */}
          {isMobile && (
            <IconButton onClick={toggleSidebar} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Right side links */}
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

        {/* Main Content Area */}
        <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
          <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <IconButton
                  onClick={() => router.back()}
                  sx={{ color: "primary.main" }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  Chi tiết thiết bị
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => router.push(`/devices/${deviceId}/edit`)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                >
                  Xóa
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadDevice}
                >
                  Làm mới
                </Button>
              </Box>
            </Box>

            {/* Device Information */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Main Info and Status */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                {/* Main Info */}
                <Box sx={{ flex: { xs: "1", md: "2" } }}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Chip
                          icon={getStatusIcon(device.status)}
                          label={getStatusLabel(device.status)}
                          color={getStatusColor(device.status) as any}
                          size="medium"
                        />
                        <Typography variant="h5" fontWeight="bold">
                          {device.name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 3,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Mã thiết bị
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {device.code}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Danh mục
                            </Typography>
                            <Chip label={device.category} variant="outlined" />
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 3,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Thương hiệu
                            </Typography>
                            <Typography variant="body1">
                              {device.brand}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Model
                            </Typography>
                            <Typography variant="body1">
                              {device.model}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 3,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Số serial
                            </Typography>
                            <Typography variant="body1" fontFamily="monospace">
                              {device.serialNumber}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Vị trí
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocationIcon color="action" fontSize="small" />
                              <Typography variant="body1">
                                {device.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 3,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Phòng ban
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <BusinessIcon color="action" fontSize="small" />
                              <Typography variant="body1">
                                {device.department}
                              </Typography>
                            </Box>
                          </Box>

                          {device.assignedTo && (
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Người được giao
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PersonIcon color="action" fontSize="small" />
                                <Typography variant="body1">
                                  {device.assignedTo}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Status and Dates */}
                <Box sx={{ flex: { xs: "1", md: "1" } }}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Thông tin trạng thái
                      </Typography>

                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Ngày mua"
                            secondary={formatDate(device.purchaseDate)}
                          />
                        </ListItem>

                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Hết hạn bảo hành"
                            secondary={formatDate(device.warrantyExpiry)}
                          />
                        </ListItem>

                        {device.lastMaintenance && (
                          <ListItem>
                            <ListItemIcon>
                              <BuildIcon color="info" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Lần bảo trì cuối"
                              secondary={formatDate(device.lastMaintenance)}
                            />
                          </ListItem>
                        )}

                        {device.nextMaintenance && (
                          <ListItem>
                            <ListItemIcon>
                              <CalendarIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Lần bảo trì tiếp theo"
                              secondary={formatDate(device.nextMaintenance)}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Additional Details */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Thông tin chi tiết
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 3,
                      }}
                    >
                      {device.description && (
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Mô tả
                          </Typography>
                          <Typography variant="body1">
                            {device.description}
                          </Typography>
                        </Box>
                      )}

                      {device.specifications && (
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Thông số kỹ thuật
                          </Typography>
                          <Typography variant="body1">
                            {device.specifications}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 3,
                      }}
                    >
                      {device.purchasePrice && (
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Giá mua
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <MoneyIcon color="action" />
                            <Typography variant="body1" fontWeight="medium">
                              {formatCurrency(device.purchasePrice)}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {device.supplier && (
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Nhà cung cấp
                          </Typography>
                          <Typography variant="body1">
                            {device.supplier}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {device.maintenanceSchedule && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Lịch bảo trì
                        </Typography>
                        <Typography variant="body1">
                          {device.maintenanceSchedule}
                        </Typography>
                      </Box>
                    )}

                    {device.notes && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Ghi chú
                        </Typography>
                        <Typography variant="body1">{device.notes}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Thông tin hệ thống
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 3,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Người tạo
                      </Typography>
                      <Typography variant="body1">
                        {device.createdByName ||
                          device.createdBy ||
                          "Không xác định"}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Ngày tạo
                      </Typography>
                      <Typography variant="body1">
                        {formatFirestoreDate(device.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Cập nhật lần cuối
                      </Typography>
                      <Typography variant="body1">
                        {formatFirestoreDate(device.updatedAt)}
                      </Typography>
                      {device.updatedByName && (
                        <Typography variant="caption" color="text.secondary">
                          bởi {device.updatedByName}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        ID thiết bị
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {device.id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
              <DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
              <DialogContent>
                <Typography>
                  Bạn có chắc chắn muốn xóa thiết bị "{device.name}" (Mã:{" "}
                  {device.code})?
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Hành động này không thể hoàn tác.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel} disabled={deleting}>
                  Hủy
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  color="error"
                  disabled={deleting}
                  startIcon={deleting ? <CircularProgress size={20} /> : null}
                >
                  {deleting ? "Đang xóa..." : "Xóa"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
              open={!!success}
              autoHideDuration={6000}
              onClose={() => setSuccess(null)}
            >
              <Alert severity="success" sx={{ width: "100%" }}>
                {success}
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
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
