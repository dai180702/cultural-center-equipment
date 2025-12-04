"use client";
// Báo cáo tổng hợp
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Stack,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getDevices, Device } from "@/services/devices";
import { getWarehouseDevices } from "@/services/warehouse";
import { getBorrowRecords, BorrowRecord } from "@/services/borrows";
import {
  Assessment as AssessmentIcon,
  DevicesOther as DevicesIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import {
  exportToExcel,
  exportToExcelMultiSheet,
  exportTableToPDF,
  exportHTMLToPDF,
} from "@/utils/exportUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const deviceStatusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  maintenance: "Cần bảo trì",
  broken: "Đã hỏng",
  retired: "Thanh lý",
};

const deviceStatusColors: Record<string, string> = {
  active: "#4caf50",
  maintenance: "#ff9800",
  broken: "#f44336",
  retired: "#9e9e9e",
};

interface SummaryStats {
  totalDevices: number;
  warehouseDevices: number;
  inUseDevices: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byDepartment: Record<string, number>;
  borrowStats: {
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
  };
}

export default function SummaryReportPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [warehouseDevices, setWarehouseDevices] = useState<Device[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SummaryStats | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [currentUser, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, warehouseData, borrowsData] = await Promise.all([
        getDevices(),
        getWarehouseDevices(),
        getBorrowRecords(),
      ]);
      setDevices(devicesData);
      setWarehouseDevices(warehouseData);
      setBorrowRecords(borrowsData);
      calculateStats(devicesData, warehouseData, borrowsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === "function") {
      return value.toDate();
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  const isBorrowRecordOverdue = (record: BorrowRecord): boolean => {
    const expectedReturnDate = toDate(record.expectedReturnDate);
    if (!expectedReturnDate) return false;

    const returnDate = toDate(record.returnDate);
    if (returnDate) {
      return returnDate > expectedReturnDate;
    }

    const now = new Date();
    return now > expectedReturnDate;
  };

  const calculateStats = (
    devicesData: Device[],
    warehouseData: Device[],
    borrowsData: BorrowRecord[]
  ) => {
    const allDevices = [...devicesData, ...warehouseData];
    const totalDevices = allDevices.length;

    // Thống kê theo trạng thái
    const byStatus = allDevices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Thống kê theo danh mục
    const byCategory = allDevices.reduce((acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Thống kê theo phòng ban
    const byDepartment = allDevices.reduce((acc, device) => {
      const dept = device.department || "Chưa phân bổ";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Thống kê mượn trả
    const overdueRecords = borrowsData.filter((record) =>
      isBorrowRecordOverdue(record)
    );
    const borrowedRecords = borrowsData.filter(
      (record) => !isBorrowRecordOverdue(record) && record.status === "borrowed"
    );
    const returnedRecords = borrowsData.filter(
      (record) => !isBorrowRecordOverdue(record) && record.status === "returned"
    );

    const borrowStats = {
      total: borrowsData.length,
      borrowed: borrowedRecords.length,
      returned: returnedRecords.length,
      overdue: overdueRecords.length,
    };

    setStats({
      totalDevices,
      warehouseDevices: warehouseData.length,
      inUseDevices: devicesData.length,
      byStatus,
      byCategory,
      byDepartment,
      borrowStats,
    });
  };

  // Dữ liệu biểu đồ trạng thái
  const statusChartData = stats
    ? {
        labels: Object.keys(stats.byStatus).map(
          (key) => deviceStatusLabels[key] || key
        ),
        datasets: [
          {
            label: "Số lượng",
            data: Object.values(stats.byStatus),
            backgroundColor: Object.keys(stats.byStatus).map(
              (key) => deviceStatusColors[key] || "#9e9e9e"
            ),
          },
        ],
      }
    : null;

  // Dữ liệu biểu đồ danh mục
  const categoryChartData = stats
    ? {
        labels: Object.keys(stats.byCategory),
        datasets: [
          {
            label: "Số lượng",
            data: Object.values(stats.byCategory),
            backgroundColor: [
              "#4caf50",
              "#2196f3",
              "#ff9800",
              "#9c27b0",
              "#f44336",
              "#00bcd4",
              "#ffeb3b",
              "#795548",
            ],
          },
        ],
      }
    : null;

  // Dữ liệu biểu đồ mượn trả
  const borrowChartData = stats
    ? {
        labels: ["Đang mượn", "Đã trả", "Quá hạn"],
        datasets: [
          {
            label: "Số lượng",
            data: [
              stats.borrowStats.borrowed,
              stats.borrowStats.returned,
              stats.borrowStats.overdue,
            ],
            backgroundColor: ["#2196f3", "#4caf50", "#f44336"],
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const chartOptionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value: any) {
            return Math.round(value);
          },
        },
      },
    },
  };

  // Xuất Excel
  const handleExportExcel = () => {
    if (!stats) return;
    try {
      const excelData = [
        {
          "Tổng thiết bị": stats.totalDevices,
          "Thiết bị trong kho": stats.warehouseDevices,
          "Thiết bị đang sử dụng": stats.inUseDevices,
          "Đang hoạt động": stats.byStatus.active || 0,
          "Cần bảo trì": stats.byStatus.maintenance || 0,
          "Đã hỏng": stats.byStatus.broken || 0,
          "Thanh lý": stats.byStatus.retired || 0,
          "Tổng phiếu mượn": stats.borrowStats.total,
          "Đang mượn": stats.borrowStats.borrowed,
          "Đã trả": stats.borrowStats.returned,
          "Quá hạn": stats.borrowStats.overdue,
        },
      ];

      // Thêm sheet theo danh mục
      const categoryData = Object.entries(stats.byCategory).map(
        ([key, value]) => ({
          "Danh mục": key,
          "Số lượng": value,
        })
      );

      // Thêm sheet theo phòng ban
      const departmentData = Object.entries(stats.byDepartment).map(
        ([key, value]) => ({
          "Phòng ban": key,
          "Số lượng": value,
        })
      );

      exportToExcelMultiSheet(
        [
          { name: "Tổng quan", data: excelData },
          { name: "Theo danh mục", data: categoryData },
          { name: "Theo phòng ban", data: departmentData },
        ],
        `Bao_cao_tong_hop_${new Date().toISOString().split("T")[0]}`
      );
    } catch (err: any) {
      console.error("Error exporting Excel:", err);
      alert(err.message || "Không thể xuất file Excel");
    }
  };

  // Xuất PDF
  const handleExportPDF = async () => {
    if (!stats) return;
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("vi-VN");

      // Tạo dữ liệu bảng tổng quan
      const summaryRows = [
        ["Tổng thiết bị", stats.totalDevices.toString()],
        ["Thiết bị trong kho", stats.warehouseDevices.toString()],
        ["Thiết bị đang sử dụng", stats.inUseDevices.toString()],
        ["Đang hoạt động", (stats.byStatus.active || 0).toString()],
        ["Cần bảo trì", (stats.byStatus.maintenance || 0).toString()],
        ["Đã hỏng", (stats.byStatus.broken || 0).toString()],
        ["Thanh lý", (stats.byStatus.retired || 0).toString()],
        ["Tổng phiếu mượn", stats.borrowStats.total.toString()],
        ["Đang mượn", stats.borrowStats.borrowed.toString()],
        ["Đã trả", stats.borrowStats.returned.toString()],
        ["Quá hạn", stats.borrowStats.overdue.toString()],
      ];

      exportTableToPDF(
        "BÁO CÁO TỔNG HỢP",
        ["Chỉ tiêu", "Giá trị"],
        summaryRows,
        `Bao_cao_tong_hop_${new Date().toISOString().split("T")[0]}`,
        `Ngày báo cáo: ${dateStr}`
      );
    } catch (err: any) {
      console.error("Error exporting PDF:", err);
      alert(err.message || "Không thể xuất file PDF");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard")}
            variant="outlined"
          >
            Quay lại
          </Button>
          <AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo tổng hợp
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<ExcelIcon />}
            onClick={handleExportExcel}
            variant="outlined"
            color="success"
          >
            Xuất Excel
          </Button>
          <Button
            startIcon={<PdfIcon />}
            onClick={handleExportPDF}
            variant="outlined"
            color="error"
          >
            Xuất PDF
          </Button>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Tổng quan về thiết bị, kho và hoạt động mượn trả
        </Typography>
      </Box>

      {stats && (
        <>
          {/* Thống kê tổng quan */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 3,
            }}
          >
            <Box>
              <Card
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DevicesIcon sx={{ fontSize: 40, color: "primary.main" }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalDevices}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng thiết bị
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <InventoryIcon
                      sx={{ fontSize: 40, color: "success.main" }}
                    />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.warehouseDevices}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Trong kho
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircleIcon
                      sx={{ fontSize: 40, color: "info.main" }}
                    />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.inUseDevices}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đang sử dụng
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AssignmentIcon
                      sx={{ fontSize: 40, color: "warning.main" }}
                    />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.borrowStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng phiếu mượn
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Biểu đồ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              mb: 3,
            }}
          >
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê theo trạng thái
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {statusChartData && (
                      <Bar data={statusChartData} options={chartOptionsBar} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê theo danh mục
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {categoryChartData && (
                      <Bar data={categoryChartData} options={chartOptionsBar} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê mượn trả
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {borrowChartData && (
                      <Bar data={borrowChartData} options={chartOptionsBar} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chi tiết mượn trả
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>Đang mượn:</Typography>
                      <Chip
                        label={stats.borrowStats.borrowed}
                        color="info"
                        size="small"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>Đã trả:</Typography>
                      <Chip
                        label={stats.borrowStats.returned}
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>Quá hạn:</Typography>
                      <Chip
                        label={stats.borrowStats.overdue}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Bảng chi tiết */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê theo trạng thái
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Trạng thái</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Tỷ lệ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(stats.byStatus).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>
                              <Chip
                                label={deviceStatusLabels[key] || key}
                                size="small"
                                sx={{
                                  bgcolor: deviceStatusColors[key] || "#9e9e9e",
                                  color: "white",
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">{value}</TableCell>
                            <TableCell align="right">
                              {Math.round((value / stats.totalDevices) * 100)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê theo danh mục
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Danh mục</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Tỷ lệ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(stats.byCategory)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, count]) => (
                            <TableRow key={category}>
                              <TableCell>{category}</TableCell>
                              <TableCell align="right">{count}</TableCell>
                              <TableCell align="right">
                                {Math.round((count / stats.totalDevices) * 100)}
                                %
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê theo phòng ban
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Phòng ban</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Tỷ lệ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(stats.byDepartment)
                          .sort(([, a], [, b]) => b - a)
                          .map(([dept, count]) => (
                            <TableRow key={dept}>
                              <TableCell>{dept}</TableCell>
                              <TableCell align="right">{count}</TableCell>
                              <TableCell align="right">
                                {Math.round((count / stats.totalDevices) * 100)}
                                %
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Nút làm mới */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadData}
            >
              Làm mới dữ liệu
            </Button>
          </Box>
        </>
      )}

      {/* Error Snackbar */}
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
