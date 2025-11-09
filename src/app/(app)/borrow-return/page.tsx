"use client";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  getBorrowRecords,
  BorrowRecord,
  returnBorrowRecord,
} from "@/services/borrows";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from "@mui/icons-material";

export default function BorrowReturnPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [allRecords, setAllRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "borrowed" | "returned" | "overdue" | "all"
  >("all");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(
    null
  );
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadBorrowRecords();
  }, [currentUser, router]);

  const loadBorrowRecords = async () => {
    try {
      setLoading(true);
      const data = await getBorrowRecords();
      // Convert Firestore timestamps to Date objects
      const processedData = data.map((record) => ({
        ...record,
        borrowDate:
          record.borrowDate instanceof Date
            ? record.borrowDate
            : (record.borrowDate as any)?.toDate?.() ||
              new Date(record.borrowDate),
        expectedReturnDate: record.expectedReturnDate
          ? record.expectedReturnDate instanceof Date
            ? record.expectedReturnDate
            : (record.expectedReturnDate as any)?.toDate?.() ||
              new Date(record.expectedReturnDate)
          : undefined,
        returnDate: record.returnDate
          ? record.returnDate instanceof Date
            ? record.returnDate
            : (record.returnDate as any)?.toDate?.() ||
              new Date(record.returnDate)
          : undefined,
        createdAt:
          record.createdAt instanceof Date
            ? record.createdAt
            : (record.createdAt as any)?.toDate?.() ||
              new Date(record.createdAt),
        updatedAt:
          record.updatedAt instanceof Date
            ? record.updatedAt
            : (record.updatedAt as any)?.toDate?.() ||
              new Date(record.updatedAt),
      }));
      setAllRecords(processedData);
      setRecords(processedData);
    } catch (err) {
      console.error("Error loading borrow records:", err);
      setError("Không thể tải danh sách mượn trả thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      applyFilters();
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredResults = allRecords.filter(
      (record) =>
        record.deviceName?.toLowerCase().includes(searchLower) ||
        record.deviceCode?.toLowerCase().includes(searchLower) ||
        record.borrowerName?.toLowerCase().includes(searchLower) ||
        record.department?.toLowerCase().includes(searchLower) ||
        record.purpose?.toLowerCase().includes(searchLower)
    );
    setRecords(filteredResults);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filteredRecords = allRecords;

    // Filter by status
    if (statusFilter !== "all") {
      filteredRecords = filteredRecords.filter(
        (record) => record.status === statusFilter
      );
    }

    // Check for overdue records
    if (statusFilter === "all" || statusFilter === "borrowed") {
      const now = new Date();
      filteredRecords = filteredRecords.map((record) => {
        if (
          record.status === "borrowed" &&
          record.expectedReturnDate &&
          new Date(record.expectedReturnDate) < now
        ) {
          return { ...record, status: "overdue" as const };
        }
        return record;
      });
    }

    setRecords(filteredRecords);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setRecords(allRecords);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed":
        return "warning";
      case "returned":
        return "success";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "borrowed":
        return "Đang mượn";
      case "returned":
        return "Đã trả";
      case "overdue":
        return "Quá hạn";
      default:
        return status;
    }
  };

  const handleReturnClick = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedRecord?.id) return;

    try {
      setReturning(true);
      await returnBorrowRecord(
        selectedRecord.id,
        currentUser?.uid,
        currentUser?.displayName || currentUser?.email || ""
      );
      setSuccess("Đã xác nhận trả thiết bị thành công");
      setReturnDialogOpen(false);
      setSelectedRecord(null);
      await loadBorrowRecords();
    } catch (err) {
      setError("Không thể xác nhận trả thiết bị");
    } finally {
      setReturning(false);
    }
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

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
  }, [statusFilter]);

  if (!currentUser) return null;

  return (
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
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <ScheduleIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary.main"
                  gutterBottom
                >
                  Danh sách mượn trả thiết bị
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý các phiếu mượn và trả thiết bị
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
                      Đang mượn
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {allRecords.filter((r) => r.status === "borrowed").length}
                    </Typography>
                  </Box>
                  <ScheduleIcon
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
                      Đã trả
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {allRecords.filter((r) => r.status === "returned").length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon
                    sx={{ fontSize: 40, color: "success.main", opacity: 0.3 }}
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
                      Quá hạn
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {
                        allRecords.filter(
                          (r) =>
                            r.status === "overdue" ||
                            (r.status === "borrowed" &&
                              r.expectedReturnDate &&
                              new Date(r.expectedReturnDate) < new Date())
                        ).length
                      }
                    </Typography>
                  </Box>
                  <WarningIcon
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
                      {allRecords.length}
                    </Typography>
                  </Box>
                  <PersonIcon
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
                  label="Tìm kiếm"
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
                  placeholder="Tìm theo thiết bị, người mượn, phòng ban..."
                />

                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as
                          | "borrowed"
                          | "returned"
                          | "overdue"
                          | "all"
                      )
                    }
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="borrowed">
                      <Chip
                        label="Đang mượn"
                        color="warning"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Đang mượn
                    </MenuItem>
                    <MenuItem value="returned">
                      <Chip
                        label="Đã trả"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Đã trả
                    </MenuItem>
                    <MenuItem value="overdue">
                      <Chip
                        label="Quá hạn"
                        color="error"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Quá hạn
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/borrow-return/new")}
                  sx={{ mr: "auto" }}
                >
                  Mượn thiết bị
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
                  onClick={loadBorrowRecords}
                >
                  Tải lại
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : records.length === 0 ? (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <ScheduleIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Không có phiếu mượn trả nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                      : "Chưa có phiếu mượn trả thiết bị nào"}
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
                            Người mượn
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Phòng ban
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Ngày mượn
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Dự kiến trả
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Ngày trả
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Trạng thái
                          </TableCell>
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentRecords.map((record) => (
                          <TableRow key={record.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {record.deviceCode || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {record.deviceName || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.borrowerName || record.borrowerId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.department || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.borrowDate
                                  ? new Date(
                                      record.borrowDate
                                    ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.expectedReturnDate
                                  ? new Date(
                                      record.expectedReturnDate
                                    ).toLocaleDateString("vi-VN")
                                  : "Chưa có"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.returnDate
                                  ? new Date(
                                      record.returnDate
                                    ).toLocaleDateString("vi-VN")
                                  : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(record.status)}
                                color={getStatusColor(record.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Tooltip title="Xem chi tiết">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      router.push(`/devices/${record.deviceId}`)
                                    }
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                {record.status === "borrowed" ||
                                record.status === "overdue" ? (
                                  <Tooltip title="Xác nhận trả">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleReturnClick(record)}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                ) : null}
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

      {/* Return Confirmation Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={() => !returning && setReturnDialogOpen(false)}
      >
        <DialogTitle>Xác nhận trả thiết bị</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Thiết bị:</strong> {selectedRecord.deviceName} (
                {selectedRecord.deviceCode})
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Người mượn:</strong> {selectedRecord.borrowerName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Ngày mượn:</strong>{" "}
                {selectedRecord.borrowDate
                  ? new Date(selectedRecord.borrowDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </Typography>
              <Typography variant="body1">
                Bạn có chắc chắn muốn xác nhận trả thiết bị này không?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReturnDialogOpen(false)}
            disabled={returning}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmReturn}
            disabled={returning}
            startIcon={returning ? <CircularProgress size={20} /> : null}
          >
            {returning ? "Đang xử lý..." : "Xác nhận trả"}
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
    </Box>
  );
}
