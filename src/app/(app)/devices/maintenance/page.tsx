"use client";
// Danh sách thiết bị hư hỏng cần bảo trì
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Pagination,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getDevices,
  getDevicesByStatus,
  Device,
  searchDevices,
} from "@/services/devices";
import {
  getWarehouseDevices,
  searchWarehouseDevices,
} from "@/services/warehouse";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const deviceCategories = [
  "Tất cả",
  "Máy tính",
  "Máy in",
  "Thiết bị mạng",
  "Thiết bị âm thanh",
  "Thiết bị video",
  "Thiết bị thể thao",
  "Thiết bị văn phòng",
  "Khác",
];

export default function MaintenancePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  // allDevices sẽ chứa cả thiết bị đang dùng (devices) và thiết bị trong kho (warehouse)
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "maintenance" | "broken" | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadMaintenanceDevices();
  }, [currentUser, router]);

  const loadMaintenanceDevices = async () => {
    try {
      setLoading(true);

      // Helper function để kiểm tra thiết bị có bị xóa không
      const isDeviceDeleted = (device: Device) => {
        return device?.isDeleted === true || (device?.deletedAt !== null && device?.deletedAt !== undefined);
      };

      // 1. Lấy thiết bị đang sử dụng (collection "devices")
      const inUseDevices = await getDevices();

      // 2. Lấy thiết bị trong kho (collection "warehouse")
      const warehouseDevices = await getWarehouseDevices();

      // 3. Lọc thiết bị chưa bị xóa từ cả hai nguồn
      const activeInUseDevices = (inUseDevices || []).filter(
        (device) => !isDeviceDeleted(device)
      );
      const activeWarehouseDevices = (warehouseDevices || []).filter(
        (device) => !isDeviceDeleted(device)
      );

      // 4. Gộp 2 nguồn và chỉ giữ thiết bị cần bảo trì / đã hỏng (chưa bị xóa)
      const combinedDevices = [...activeInUseDevices, ...activeWarehouseDevices];
      const maintenanceDevices = combinedDevices.filter(
        (device) =>
          device.status === "maintenance" || device.status === "broken"
      );

      setAllDevices(maintenanceDevices);
      setDevices(maintenanceDevices);
    } catch (err) {
      console.error("Error loading maintenance devices:", err);
      setError("Không thể tải danh sách thiết bị cần bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      applyFilters();
      return;
    }

    try {
      setLoading(true);

      // Helper function để kiểm tra thiết bị có bị xóa không
      const isDeviceDeleted = (device: Device) => {
        return device?.isDeleted === true || (device?.deletedAt !== null && device?.deletedAt !== undefined);
      };

      // Tìm kiếm trong danh sách thiết bị đang sử dụng
      const searchInUse = await searchDevices(searchTerm);
      // Tìm kiếm trong kho
      const searchWarehouse = await searchWarehouseDevices(searchTerm);

      // Lọc thiết bị chưa bị xóa
      const activeSearchInUse = (searchInUse || []).filter(
        (device) => !isDeviceDeleted(device)
      );
      const activeSearchWarehouse = (searchWarehouse || []).filter(
        (device) => !isDeviceDeleted(device)
      );

      // Gộp kết quả, lọc trạng thái cần bảo trì / đã hỏng (chưa bị xóa)
      const mergedResults = [...activeSearchInUse, ...activeSearchWarehouse];
      const filteredResults = mergedResults.filter(
        (device) =>
          device.status === "maintenance" || device.status === "broken"
      );

      setDevices(filteredResults);
    } catch (err) {
      setError("Không thể tìm kiếm thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredDevices = allDevices;

    // Filter by status
    if (statusFilter !== "all") {
      filteredDevices = filteredDevices.filter(
        (device) => device.status === statusFilter
      );
    }

    // Filter by category
    if (categoryFilter !== "Tất cả") {
      filteredDevices = filteredDevices.filter(
        (device) => device.category === categoryFilter
      );
    }

    setDevices(filteredDevices);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("Tất cả");
    setSearchTerm("");
    setDevices(allDevices);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "maintenance":
        return "warning";
      case "broken":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "maintenance":
        return "Cần bảo trì";
      case "broken":
        return "Đã hỏng";
      default:
        return status;
    }
  };

  // Pagination
  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = devices.slice(indexOfFirstDevice, indexOfLastDevice);
  const totalPages = Math.ceil(devices.length / devicesPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  // Apply filters when they change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [statusFilter, categoryFilter]);

  if (!currentUser) return null;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top Header Bar */}
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

      {/* Main Content Area */}
      <Box sx={{ flex: 1, bgcolor: "#f5f5f5", p: 3 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <ErrorIcon sx={{ fontSize: 40, color: "error.main" }} />
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                >
                  Danh sách thiết bị cần bảo trì
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý các thiết bị hư hỏng, cần bảo trì
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
              mb: 3,
            }}
          >
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tổng số thiết bị cần bảo trì
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {
                        allDevices.filter((d) => d.status === "maintenance")
                          .length
                      }
                    </Typography>
                  </Box>
                  <WarningIcon
                    sx={{ fontSize: 40, color: "warning.main", opacity: 0.3 }}
                  />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tổng số thiết bị đã hỏng
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {allDevices.filter((d) => d.status === "broken").length}
                    </Typography>
                  </Box>
                  <ErrorIcon
                    sx={{ fontSize: 40, color: "error.main", opacity: 0.3 }}
                  />
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tổng cộng
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {allDevices.length}
                    </Typography>
                  </Box>
                  <BuildIcon
                    sx={{ fontSize: 40, color: "primary.main", opacity: 0.3 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Search and Filter Bar */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 3,
                  mb: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Tìm kiếm thiết bị"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSearch}>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Tìm theo tên, mã, thương hiệu..."
                />

                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "maintenance" | "broken" | "all"
                      )
                    }
                    label="Trạng thái"
                  >
                    <MenuItem value="all">
                      <Chip
                        label="Tất cả"
                        color="default"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Tất cả
                    </MenuItem>
                    <MenuItem value="maintenance">
                      <Chip
                        label="Cần bảo trì"
                        color="warning"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Cần bảo trì
                    </MenuItem>
                    <MenuItem value="broken">
                      <Chip
                        label="Đã hỏng"
                        color="error"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Đã hỏng
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Danh mục"
                  >
                    {deviceCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={applyFilters}
                >
                  Lọc
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleClearFilters}
                >
                  Làm mới
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadMaintenanceDevices}
                >
                  Tải lại
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Devices Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : devices.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <ErrorIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Không có thiết bị nào cần bảo trì
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    categoryFilter !== "Tất cả"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                      : "Tất cả thiết bị đang hoạt động bình thường"}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "primary.main" }}>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Mã thiết bị
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Tên thiết bị
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Danh mục
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Trạng thái
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Phòng ban
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Ngày cập nhật
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentDevices.map((device) => (
                          <TableRow key={device.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {device.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {device.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {device.brand} - {device.model}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={device.category}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(device.status)}
                                color={getStatusColor(device.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {device.department}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {device.updatedAt
                                  ? new Date(
                                      device.updatedAt
                                    ).toLocaleDateString("vi-VN")
                                  : "Chưa cập nhật"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="Xem chi tiết">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      router.push(`/devices/${device.id}`)
                                    }
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Chỉnh sửa">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      router.push(`/devices/${device.id}/edit`)
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 3 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

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
    </Box>
  );
}
