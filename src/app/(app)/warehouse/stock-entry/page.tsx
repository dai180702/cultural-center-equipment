"use client";
// Nhập kho - Chuyển thiết bị từ quản lý thiết bị về kho
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
  Paper,
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
  Checkbox,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getDevices, Device, searchDevices } from "@/services/devices";
import { moveDeviceFromDevicesToWarehouse } from "@/services/warehouse";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
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

export default function StockEntryPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(
    new Set()
  );
  const [moving, setMoving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [devicesPerPage] = useState(10);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadDevices();
  }, [currentUser, router]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const allDevicesData = await getDevices();
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
      const searchResults = await searchDevices(searchTerm);
      setDevices(searchResults);
    } catch (err) {
      setError("Không thể tìm kiếm thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filteredDevices = allDevices;

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
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("Tất cả");
    setSearchTerm("");
    setDevices(allDevices);
    setCurrentPage(1);
    setSelectedDevices(new Set());
  };

  const handleSelectDevice = (deviceId: string) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelectedDevices(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDevices.size === currentDevices.length) {
      setSelectedDevices(new Set());
    } else {
      const allIds = new Set(currentDevices.map((d) => d.id!));
      setSelectedDevices(allIds);
    }
  };

  const handleMoveToWarehouse = async () => {
    if (selectedDevices.size === 0) {
      setError("Vui lòng chọn ít nhất một thiết bị để nhập kho");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!currentUser) return;

    try {
      setMoving(true);
      setConfirmDialogOpen(false);
      const deviceIds = Array.from(selectedDevices);
      let successCount = 0;
      let errorCount = 0;

      for (const deviceId of deviceIds) {
        try {
          await moveDeviceFromDevicesToWarehouse(
            deviceId,
            currentUser.uid,
            currentUser.email || currentUser.displayName || undefined
          );
          successCount++;
        } catch (err) {
          console.error(`Error moving device ${deviceId}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(
          `Đã nhập ${successCount} thiết bị vào kho thành công${
            errorCount > 0 ? `. ${errorCount} thiết bị gặp lỗi.` : ""
          }`
        );
        setSelectedDevices(new Set());
        await loadDevices();
      } else {
        setError("Không thể nhập thiết bị vào kho. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error moving devices:", err);
      setError("Không thể nhập thiết bị vào kho. Vui lòng thử lại.");
    } finally {
      setMoving(false);
    }
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

  // Pagination
  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = devices.slice(indexOfFirstDevice, indexOfLastDevice);
  const totalPages = Math.ceil(devices.length / devicesPerPage);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/warehouse")}
            variant="outlined"
          >
            Quay lại
          </Button>
          <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Nhập kho
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Chọn thiết bị từ quản lý thiết bị để chuyển về kho
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
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
                        setDevices(allDevices);
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
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
            <FormControl sx={{ minWidth: 150 }}>
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
            <Button
              variant="contained"
              onClick={handleFilter}
              sx={{ minWidth: 100 }}
            >
              Lọc
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ minWidth: 100 }}
            >
              Xóa bộ lọc
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDevices}
            >
              Làm mới
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Action Bar */}
      {selectedDevices.size > 0 && (
        <Card
          sx={{
            mb: 3,
            bgcolor: "primary.light",
            color: "primary.contrastText",
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" fontWeight="bold">
                Đã chọn {selectedDevices.size} thiết bị
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<InventoryIcon />}
                onClick={handleMoveToWarehouse}
                disabled={moving}
              >
                Nhập kho
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setSelectedDevices(new Set())}
              >
                Bỏ chọn
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Devices Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : devices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Không có thiết bị nào
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={
                            currentDevices.length > 0 &&
                            currentDevices.every((d) =>
                              selectedDevices.has(d.id!)
                            )
                          }
                          indeterminate={
                            currentDevices.some((d) =>
                              selectedDevices.has(d.id!)
                            ) &&
                            !currentDevices.every((d) =>
                              selectedDevices.has(d.id!)
                            )
                          }
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Mã thiết bị
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Tên thiết bị
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Danh mục
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Thương hiệu
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Model
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Trạng thái
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Vị trí
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Phòng ban
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDevices.map((device) => (
                      <TableRow
                        key={device.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          bgcolor: selectedDevices.has(device.id!)
                            ? "action.selected"
                            : "inherit",
                        }}
                        onClick={() =>
                          device.id && handleSelectDevice(device.id)
                        }
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedDevices.has(device.id!)}
                            onChange={() =>
                              device.id && handleSelectDevice(device.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>{device.code}</TableCell>
                        <TableCell>{device.name}</TableCell>
                        <TableCell>{device.category}</TableCell>
                        <TableCell>{device.brand}</TableCell>
                        <TableCell>{device.model}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(device.status)}
                            color={getStatusColor(device.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{device.location || "-"}</TableCell>
                        <TableCell>{device.department || "-"}</TableCell>
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

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Xác nhận nhập kho</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn nhập {selectedDevices.size} thiết bị đã chọn
            vào kho? Thiết bị sẽ được chuyển từ quản lý thiết bị về kho.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmMove}
            variant="contained"
            disabled={moving}
            startIcon={
              moving ? <CircularProgress size={20} /> : <CheckCircleIcon />
            }
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
