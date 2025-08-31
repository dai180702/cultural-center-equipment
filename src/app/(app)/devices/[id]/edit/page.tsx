"use client";
// chỉnh sửa thiết bị
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
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  Divider,
  Grid,
  Drawer,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getDeviceById,
  updateDevice,
  Device,
  DeviceFormData,
} from "@/services/devices";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

// Danh sách các trạng thái thiết bị với màu sắc tương ứng
const deviceStatuses = [
  { value: "active", label: "Đang hoạt động", color: "success" },
  { value: "maintenance", label: "Cần bảo trì", color: "warning" },
  { value: "broken", label: "Đã hỏng", color: "error" },
  { value: "retired", label: "Thanh lý", color: "default" },
];

const deviceCategories = [
  "Máy tính",
  "Máy in",
  "Thiết bị mạng",
  "Thiết bị âm thanh",
  "Thiết bị video",
  "Thiết bị thể thao",
  "Thiết bị văn phòng",
  "Khác",
];

export default function EditDevicePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState<DeviceFormData>({
    name: "",
    code: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    status: "active",
    location: "",
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
  });

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
        setFormData({
          name: deviceData.name || "",
          code: deviceData.code || "",
          category: deviceData.category || "",
          brand: deviceData.brand || "",
          model: deviceData.model || "",
          serialNumber: deviceData.serialNumber || "",
          purchaseDate: deviceData.purchaseDate || "",
          warrantyExpiry: deviceData.warrantyExpiry || "",
          status: deviceData.status || "active",
          location: deviceData.location || "",
          department: deviceData.department || "",
          assignedTo: deviceData.assignedTo || "",
          description: deviceData.description || "",
          specifications: deviceData.specifications || "",
          purchasePrice: deviceData.purchasePrice || null,
          supplier: deviceData.supplier || "",
          maintenanceSchedule: deviceData.maintenanceSchedule || "",
          lastMaintenance: deviceData.lastMaintenance || "",
          nextMaintenance: deviceData.nextMaintenance || "",
          notes: deviceData.notes || "",
        });
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

  const handleInputChange = (field: keyof DeviceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateDevice(
        deviceId,
        formData,
        currentUser?.uid,
        currentUser?.displayName || currentUser?.email || "Người dùng"
      );
      setSuccess("Thiết bị đã được cập nhật thành công");
      setTimeout(() => {
        router.push(`/devices/${deviceId}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating device:", err);
      setError("Không thể cập nhật thiết bị");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          Chỉnh sửa Thiết bị
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
          onClick={() => router.push(`/devices/${deviceId}`)}
          sx={{
            justifyContent: "flex-start",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            mb: 2,
          }}
        >
          Quay lại chi tiết
        </Button>

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
                  Chỉnh sửa thiết bị
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary">
                Cập nhật thông tin thiết bị: {device.name} (Mã: {device.code})
              </Typography>
            </Box>

            {/* Edit Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Basic Information */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Thông tin cơ bản
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Tên thiết bị *"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                          error={!formData.name}
                          helperText={
                            !formData.name ? "Tên thiết bị là bắt buộc" : ""
                          }
                        />

                        <TextField
                          fullWidth
                          label="Mã thiết bị *"
                          value={formData.code}
                          onChange={(e) =>
                            handleInputChange("code", e.target.value)
                          }
                          required
                          error={!formData.code}
                          helperText={
                            !formData.code ? "Mã thiết bị là bắt buộc" : ""
                          }
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel>Danh mục *</InputLabel>
                          <Select
                            value={formData.category}
                            onChange={(e) =>
                              handleInputChange("category", e.target.value)
                            }
                            label="Danh mục *"
                            error={!formData.category}
                          >
                            {deviceCategories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                          <InputLabel>Trạng thái *</InputLabel>
                          <Select
                            value={formData.status}
                            onChange={(e) =>
                              handleInputChange("status", e.target.value)
                            }
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
                        </FormControl>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Thương hiệu *"
                          value={formData.brand}
                          onChange={(e) =>
                            handleInputChange("brand", e.target.value)
                          }
                          required
                          error={!formData.brand}
                          helperText={
                            !formData.brand ? "Thương hiệu là bắt buộc" : ""
                          }
                        />

                        <TextField
                          fullWidth
                          label="Model *"
                          value={formData.model}
                          onChange={(e) =>
                            handleInputChange("model", e.target.value)
                          }
                          required
                          error={!formData.model}
                          helperText={
                            !formData.model ? "Model là bắt buộc" : ""
                          }
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Số serial *"
                        value={formData.serialNumber}
                        onChange={(e) =>
                          handleInputChange("serialNumber", e.target.value)
                        }
                        required
                        error={!formData.serialNumber}
                        helperText={
                          !formData.serialNumber ? "Số serial là bắt buộc" : ""
                        }
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Location and Assignment */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Vị trí và phân công
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Vị trí *"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          required
                          error={!formData.location}
                          helperText={
                            !formData.location ? "Vị trí là bắt buộc" : ""
                          }
                        />

                        <TextField
                          fullWidth
                          label="Phòng ban *"
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          required
                          error={!formData.department}
                          helperText={
                            !formData.department ? "Phòng ban là bắt buộc" : ""
                          }
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Người được giao"
                        value={formData.assignedTo}
                        onChange={(e) =>
                          handleInputChange("assignedTo", e.target.value)
                        }
                        placeholder="Tên người được giao thiết bị"
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Dates and Warranty */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Ngày tháng và bảo hành
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Ngày mua *"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) =>
                            handleInputChange("purchaseDate", e.target.value)
                          }
                          required
                          error={!formData.purchaseDate}
                          helperText={
                            !formData.purchaseDate ? "Ngày mua là bắt buộc" : ""
                          }
                          InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                          fullWidth
                          label="Hết hạn bảo hành *"
                          type="date"
                          value={formData.warrantyExpiry}
                          onChange={(e) =>
                            handleInputChange("warrantyExpiry", e.target.value)
                          }
                          required
                          error={!formData.warrantyExpiry}
                          helperText={
                            !formData.warrantyExpiry
                              ? "Hết hạn bảo hành là bắt buộc"
                              : ""
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Lần bảo trì cuối"
                          type="date"
                          value={formData.lastMaintenance}
                          onChange={(e) =>
                            handleInputChange("lastMaintenance", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                        />

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
                    </Box>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Thông tin bổ sung
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Giá mua"
                          type="number"
                          value={formData.purchasePrice || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "purchasePrice",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          placeholder="Nhập giá mua (VND)"
                          InputProps={{
                            startAdornment: (
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                ₫
                              </Typography>
                            ),
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Nhà cung cấp"
                          value={formData.supplier}
                          onChange={(e) =>
                            handleInputChange("supplier", e.target.value)
                          }
                          placeholder="Tên nhà cung cấp"
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Lịch bảo trì"
                        value={formData.maintenanceSchedule}
                        onChange={(e) =>
                          handleInputChange(
                            "maintenanceSchedule",
                            e.target.value
                          )
                        }
                        placeholder="Mô tả lịch bảo trì"
                        multiline
                        rows={2}
                      />

                      <TextField
                        fullWidth
                        label="Mô tả"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Mô tả chi tiết về thiết bị"
                        multiline
                        rows={3}
                      />

                      <TextField
                        fullWidth
                        label="Thông số kỹ thuật"
                        value={formData.specifications}
                        onChange={(e) =>
                          handleInputChange("specifications", e.target.value)
                        }
                        placeholder="Các thông số kỹ thuật của thiết bị"
                        multiline
                        rows={3}
                      />

                      <TextField
                        fullWidth
                        label="Ghi chú"
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Ghi chú bổ sung"
                        multiline
                        rows={2}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Hủy
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadDevice}
                        disabled={saving}
                      >
                        Làm mới
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={
                          saving ? <CircularProgress size={20} /> : <SaveIcon />
                        }
                        disabled={
                          saving ||
                          !formData.name ||
                          !formData.code ||
                          !formData.category ||
                          !formData.brand ||
                          !formData.model ||
                          !formData.serialNumber ||
                          !formData.purchaseDate ||
                          !formData.warrantyExpiry ||
                          !formData.status ||
                          !formData.location ||
                          !formData.department
                        }
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </form>

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
