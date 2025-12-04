"use client";
// Quản lý kho thiết bị - Trang danh sách kho thiết bị
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Pagination,
  Tooltip,
  Divider,
  Drawer,
  Stack,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getWarehouseDevices,
  deleteWarehouseDevice,
  searchWarehouseDevices,
  moveDeviceFromWarehouseToDevices,
} from "@/services/warehouse";
import { Device } from "@/services/devices";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Assessment as ReportIcon,
  Clear as ClearIcon,
  MoveUp as MoveUpIcon,
} from "@mui/icons-material";
import { formatDate } from "@/lib/formatDate";

const deviceStatuses = [
  { value: "all", label: "Tất cả", color: "default" },
  { value: "active", label: "Đang hoạt động", color: "success" },
  { value: "maintenance", label: "Cần bảo trì", color: "warning" },
  { value: "broken", label: "Đã hỏng", color: "error" },
  { value: "retired", label: "Thanh lý", color: "default" },
];

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

export default function WarehouseManagementPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [showDeleted, setShowDeleted] = useState(true); // Hiển thị thiết bị đã xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deviceToMove, setDeviceToMove] = useState<Device | null>(null);
  const [moveDepartment, setMoveDepartment] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDevices();
  }, [currentUser, router]);

  // Auto-apply filter when showDeleted changes
  useEffect(() => {
    if (allDevices.length > 0) {
      handleFilter();
    }
  }, [showDeleted]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const allDevicesData = await getWarehouseDevices();
      setAllDevices(allDevicesData);
      setDevices(allDevicesData);
    } catch (err) {
      console.error("Error loading devices:", err);
      setError("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setDevices(allDevices);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchWarehouseDevices(searchTerm);
      setDevices(searchResults);
    } catch (err) {
      setError("Không thể tìm kiếm thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filteredDevices = allDevices;

    // Filter deleted devices based on showDeleted state
    if (!showDeleted) {
      filteredDevices = filteredDevices.filter((device) => !device.isDeleted);
    }

    if (statusFilter !== "all") {
      filteredDevices = filteredDevices.filter(
        (device) => device.status === statusFilter
      );
    }

    if (categoryFilter !== "Tất cả") {
      filteredDevices = filteredDevices.filter(
        (device) => device.category === categoryFilter
      );
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredDevices = filteredDevices.filter(
        (device) =>
          device.name?.toLowerCase().includes(searchLower) ||
          device.code?.toLowerCase().includes(searchLower) ||
          device.brand?.toLowerCase().includes(searchLower) ||
          device.model?.toLowerCase().includes(searchLower) ||
          device.serialNumber?.toLowerCase().includes(searchLower) ||
          device.location?.toLowerCase().includes(searchLower) ||
          device.department?.toLowerCase().includes(searchLower)
      );
    }

    setDevices(filteredDevices);
    setCurrentPage(1);
    setFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("Tất cả");
    setSearchTerm("");
    setDevices(allDevices);
    setCurrentPage(1);
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteReason("");
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete?.id) return;

    try {
      setDeleting(true);
      await deleteWarehouseDevice(
        deviceToDelete.id,
        currentUser?.uid,
        currentUser?.displayName || currentUser?.email || undefined,
        "" // Không dùng lý do xóa nữa
      );
      setSuccess("Thiết bị đã được đánh dấu là đã xóa");
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
      setDeleteReason("");
      // Reload data from server to ensure consistency
      await loadDevices();
    } catch (err) {
      setError("Không thể xóa thiết bị khỏi kho");
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveClick = (device: Device) => {
    setDeviceToMove(device);
    setMoveDepartment(device.department || "");
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = async () => {
    if (!deviceToMove?.id) return;

    try {
      setMoving(true);
      await moveDeviceFromWarehouseToDevices(
        deviceToMove.id,
        currentUser?.uid,
        currentUser?.displayName || currentUser?.email || undefined,
        moveDepartment
      );
      setSuccess("Thiết bị đã được chuyển lên phòng thành công");
      setMoveDialogOpen(false);
      setDeviceToMove(null);
      setMoveDepartment("");
      // Reload data from server to ensure consistency
      await loadDevices();
    } catch (err) {
      setError("Không thể chuyển thiết bị lên phòng");
    } finally {
      setMoving(false);
    }
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setDetailDrawerOpen(true);
  };

  const handleEdit = (device: Device) => {
    router.push(`/warehouse/${device.id}/edit`);
  };

  const handleAddNew = () => {
    router.push("/warehouse/new");
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

  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const sortedDevices = [...devices].sort((a, b) => {
    if (a.isDeleted === b.isDeleted) return 0;
    return a.isDeleted ? 1 : -1;
  });
  const currentDevices = sortedDevices.slice(
    indexOfFirstDevice,
    indexOfLastDevice
  );
  const totalPages = Math.ceil(devices.length / devicesPerPage);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Export functions
  const handleExportExcel = () => {
    // Convert devices to CSV format
    const headers = [
      "Mã thiết bị",
      "Tên thiết bị",
      "Danh mục",
      "Thương hiệu",
      "Model",
      "Số serial",
      "Trạng thái",
      "Vị trí",
      "Phòng ban",
      "Ngày mua",
      "Giá mua",
    ];

    const rows = devices.map((device) => [
      device.code || "",
      device.name || "",
      device.category || "",
      device.brand || "",
      device.model || "",
      device.serialNumber || "",
      getStatusLabel(device.status),
      device.location || "",
      device.department || "",
      device.purchaseDate || "",
      device.purchasePrice?.toString() || "",
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `danh_sach_kho_thiet_bi_${new Date().getTime()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("Xuất file Excel thành công");
    setExportMenuAnchor(null);
  };

  const handleExportPDF = () => {
    // Simple PDF export using window.print
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Không thể mở cửa sổ in");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Danh sách kho thiết bị</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Danh sách kho thiết bị</h1>
          <p>Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</p>
          <p>Tổng số thiết bị: ${devices.length}</p>
          <table>
            <thead>
              <tr>
                <th>Mã TB</th>
                <th>Tên thiết bị</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Trạng thái</th>
                <th>Vị trí</th>
                <th>Phòng ban</th>
              </tr>
            </thead>
            <tbody>
              ${devices
                .map(
                  (device) => `
                <tr>
                  <td>${device.code || ""}</td>
                  <td>${device.name || ""}</td>
                  <td>${device.category || ""}</td>
                  <td>${device.brand || ""}</td>
                  <td>${getStatusLabel(device.status)}</td>
                  <td>${device.location || ""}</td>
                  <td>${device.department || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();

    setSuccess("Xuất file PDF thành công");
    setExportMenuAnchor(null);
  };

  // Report statistics
  const getReportStats = () => {
    // Filter out deleted devices for statistics
    const activeDevices = devices.filter((device) => !device.isDeleted);

    const total = activeDevices.length;
    const byStatus = activeDevices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = activeDevices.reduce((acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDepartment = activeDevices.reduce((acc, device) => {
      const dept = device.department || "Chưa phân bổ";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = activeDevices.reduce((acc, device) => {
      const loc = device.location || "Chưa xác định";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus, byCategory, byDepartment, byLocation };
  };

  const stats = getReportStats();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quản lý kho thiết bị
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Danh sách và quản lý tất cả thiết bị trong trung tâm (trong kho và
          đang sử dụng)
        </Typography>
      </Box>

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "2fr 1fr 1fr",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Tìm kiếm thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleFilter();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm("");
                        handleClearFilters();
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Filters */}
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {deviceStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={categoryFilter}
                label="Danh mục"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {deviceCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilter}
            >
              Áp dụng bộ lọc
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Xóa bộ lọc
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  color="error"
                />
              }
              label="Hiển thị thiết bị đã xóa"
            />
          </Box>

          {/* Additional Actions */}
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Thêm thiết bị mới
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            >
              Xuất thiết bị
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => setReportDialogOpen(true)}
            >
              Báo cáo
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDevices}
            >
              Làm mới
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tổng số thiết bị
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {devices.length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Đang hoạt động
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.byStatus.active || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Cần bảo trì
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.byStatus.maintenance || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Đã hỏng
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {stats.byStatus.broken || 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Devices Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentDevices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Không có thiết bị nào
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã TB</TableCell>
                      <TableCell>Tên thiết bị</TableCell>
                      <TableCell>Danh mục</TableCell>
                      <TableCell>Thương hiệu</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Vị trí</TableCell>
                      <TableCell>Phòng ban</TableCell>
                      <TableCell>Người thêm</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDevices.map((device) => (
                      <TableRow
                        key={device.id}
                        hover
                        sx={{
                          opacity: device.isDeleted ? 0.5 : 1,
                          backgroundColor: device.isDeleted
                            ? "rgba(255, 0, 0, 0.05)"
                            : "inherit",
                        }}
                      >
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.code}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.category}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.brand}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.model}
                        </TableCell>
                        <TableCell>
                          {device.isDeleted ? (
                            <Chip label="Đã xóa" color="error" size="small" />
                          ) : (
                            <Chip
                              label={getStatusLabel(device.status)}
                              color={getStatusColor(device.status) as any}
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.location}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: device.isDeleted ? "error.main" : "inherit",
                          }}
                        >
                          {device.department}
                        </TableCell>
                        <TableCell>
                          {device.createdByName || (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewDetails(device)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {!device.isDeleted && (
                              <>
                                <Tooltip title="Sửa">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleEdit(device)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(device)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa thiết bị</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn xóa thiết bị{" "}
            <strong>{deviceToDelete?.name}</strong> không? Thiết bị sẽ được đánh
            dấu là "Đã xóa" và vẫn hiển thị trong danh sách với màu đỏ.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move to Department Dialog */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)}>
        <DialogTitle>Chuyển thiết bị lên phòng</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Chuyển thiết bị <strong>{deviceToMove?.name}</strong> từ kho lên
            phòng ban sử dụng. Thiết bị sẽ không còn hiển thị trong kho nữa.
          </Typography>
          <TextField
            fullWidth
            label="Phòng ban"
            placeholder="Nhập tên phòng ban (ví dụ: Phòng Kỹ thuật)"
            value={moveDepartment}
            onChange={(e) => setMoveDepartment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleMoveConfirm}
            color="success"
            variant="contained"
            disabled={moving}
          >
            {moving ? <CircularProgress size={24} /> : "Chuyển"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Device Details Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Chi tiết thiết bị
          </Typography>
          <Divider sx={{ my: 2 }} />

          {selectedDevice && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã thiết bị
                </Typography>
                <Typography variant="body1">{selectedDevice.code}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tên thiết bị
                </Typography>
                <Typography variant="body1">{selectedDevice.name}</Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Danh mục
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.category}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thương hiệu
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.brand}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.model}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số serial
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.serialNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedDevice.status)}
                    color={getStatusColor(selectedDevice.status) as any}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vị trí
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng ban
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày mua
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.purchaseDate
                      ? formatDate(selectedDevice.purchaseDate)
                      : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giá mua
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.purchasePrice
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedDevice.purchasePrice)
                      : "N/A"}
                  </Typography>
                </Box>
                {selectedDevice.createdByName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Người thêm vào kho
                    </Typography>
                    <Typography variant="body1">
                      {selectedDevice.createdByName}
                    </Typography>
                  </Box>
                )}
                {selectedDevice.createdAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày thêm vào kho
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedDevice.createdAt)}
                    </Typography>
                  </Box>
                )}
              </Box>
              {selectedDevice.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.description}
                  </Typography>
                </Box>
              )}
              {selectedDevice.specifications && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông số kỹ thuật
                  </Typography>
                  <Typography variant="body1">
                    {selectedDevice.specifications}
                  </Typography>
                </Box>
              )}
              {selectedDevice.isDeleted && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="error"
                    fontWeight="bold"
                    gutterBottom
                  >
                    ⚠️ Thiết bị đã bị xóa
                  </Typography>
                  {selectedDevice.deletedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Ngày xóa: {formatDate(selectedDevice.deletedAt)}
                    </Typography>
                  )}
                  {(selectedDevice.deletedByName || selectedDevice.deletedBy) && (
                    <Typography variant="body2" color="text.secondary">
                      Người xóa:{" "}
                      {selectedDevice.deletedByName &&
                      selectedDevice.deletedByName !== "Không xác định"
                        ? selectedDevice.deletedByName
                        : selectedDevice.deletedBy || "Không xác định"}
                    </Typography>
                  )}
                  {selectedDevice.deleteReason && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Lý do: {selectedDevice.deleteReason}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {!selectedDevice?.isDeleted && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  if (selectedDevice) {
                    handleEdit(selectedDevice);
                  }
                }}
                fullWidth
              >
                Sửa thiết bị
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => setDetailDrawerOpen(false)}
              fullWidth
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuList>
          <MenuItem onClick={handleExportExcel}>
            <ListItemIcon>
              <ExportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xuất Excel (CSV)</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <ExportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xuất PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Báo cáo kho thiết bị</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Tổng quan
              </Typography>
              <Typography variant="body1">
                Tổng số thiết bị: <strong>{stats.total}</strong>
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Theo trạng thái
              </Typography>
              <Stack spacing={1}>
                {deviceStatuses
                  .filter((s) => s.value !== "all")
                  .map((status) => (
                    <Box
                      key={status.value}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{status.label}:</Typography>
                      <Chip
                        label={stats.byStatus[status.value] || 0}
                        color={status.color as any}
                        size="small"
                      />
                    </Box>
                  ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Theo danh mục
              </Typography>
              <Stack spacing={1}>
                {Object.entries(stats.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <Box
                      key={category}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{category}:</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Theo phòng ban
              </Typography>
              <Stack spacing={1}>
                {Object.entries(stats.byDepartment)
                  .sort(([, a], [, b]) => b - a)
                  .map(([department, count]) => (
                    <Box
                      key={department}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{department}:</Typography>
                      <Chip label={count} size="small" color="primary" />
                    </Box>
                  ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Theo vị trí
              </Typography>
              <Stack spacing={1}>
                {Object.entries(stats.byLocation)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([location, count]) => (
                    <Box
                      key={location}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{location}:</Typography>
                      <Chip label={count} size="small" color="secondary" />
                    </Box>
                  ))}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
