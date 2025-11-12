"use client";
// Báo cáo hiệu suất thiết bị
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
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
  Stack,
  alpha,
  LinearProgress,
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
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { exportToExcel, exportToExcelMultiSheet, exportTableToPDF } from "@/utils/exportUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceReportPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [warehouseDevices, setWarehouseDevices] = useState<Device[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán hiệu suất sử dụng
  const calculateUsageRate = () => {
    const total = devices.length + warehouseDevices.length;
    if (total === 0) return 0;
    return Math.round((devices.length / total) * 100);
  };

  // Tính toán tỷ lệ thiết bị hoạt động tốt
  const calculateActiveRate = () => {
    const allDevices = [...devices, ...warehouseDevices];
    const total = allDevices.length;
    if (total === 0) return 0;
    const active = allDevices.filter((d) => d.status === "active").length;
    return Math.round((active / total) * 100);
  };

  // Thống kê mượn trả theo tháng
  const getBorrowStatsByMonth = () => {
    const last6Months: Record<string, { borrowed: number; returned: number }> =
      {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      last6Months[monthKey] = { borrowed: 0, returned: 0 };
    }

    borrowRecords.forEach((record) => {
      const borrowDate = record.borrowDate instanceof Date
        ? record.borrowDate
        : (record.borrowDate as any)?.toDate?.() || new Date(record.borrowDate);
      const monthKey = `${borrowDate.getFullYear()}-${String(
        borrowDate.getMonth() + 1
      ).padStart(2, "0")}`;

      if (last6Months[monthKey]) {
        last6Months[monthKey].borrowed++;
      }

      if (record.returnDate) {
        const returnDate = record.returnDate instanceof Date
          ? record.returnDate
          : (record.returnDate as any)?.toDate?.() || new Date(record.returnDate);
        const returnMonthKey = `${returnDate.getFullYear()}-${String(
          returnDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (last6Months[returnMonthKey]) {
          last6Months[returnMonthKey].returned++;
        }
      }
    });

    return last6Months;
  };

  // Top thiết bị được mượn nhiều nhất
  const getTopBorrowedDevices = () => {
    const deviceBorrowCount: Record<string, number> = {};
    borrowRecords.forEach((record) => {
      deviceBorrowCount[record.deviceId] =
        (deviceBorrowCount[record.deviceId] || 0) + 1;
    });

    const allDevices = [...devices, ...warehouseDevices];
    return Object.entries(deviceBorrowCount)
      .map(([deviceId, count]) => {
        const device = allDevices.find((d) => d.id === deviceId);
        return {
          deviceId,
          deviceName: device?.name || "Không xác định",
          deviceCode: device?.code || "",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const usageRate = calculateUsageRate();
  const activeRate = calculateActiveRate();
  const borrowStatsByMonth = getBorrowStatsByMonth();
  const topBorrowedDevices = getTopBorrowedDevices();

  // Dữ liệu biểu đồ mượn trả theo tháng
  const monthlyBorrowChartData = {
    labels: Object.keys(borrowStatsByMonth).map((key) => {
      const [year, month] = key.split("-");
      return `Tháng ${month}/${year}`;
    }),
    datasets: [
      {
        label: "Số lượt mượn",
        data: Object.values(borrowStatsByMonth).map((v) => v.borrowed),
        backgroundColor: alpha("#2196f3", 0.6),
        borderColor: "#2196f3",
        borderWidth: 2,
      },
      {
        label: "Số lượt trả",
        data: Object.values(borrowStatsByMonth).map((v) => v.returned),
        backgroundColor: alpha("#4caf50", 0.6),
        borderColor: "#4caf50",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
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
    try {
      const allDevices = [...devices, ...warehouseDevices];
      const deviceUsageData = allDevices.map((device) => {
        const borrowCount = borrowRecords.filter((b) => b.deviceId === device.id).length;
        return {
          "Mã thiết bị": device.code,
          "Tên thiết bị": device.name,
          "Danh mục": device.category,
          "Số lần mượn": borrowCount,
          "Trạng thái": device.status,
        };
      });

      const summaryData = [
        {
          "Tổng thiết bị": allDevices.length,
          "Tổng phiếu mượn": borrowRecords.length,
          "Đang mượn": borrowRecords.filter((b) => b.status === "borrowed").length,
          "Đã trả": borrowRecords.filter((b) => b.status === "returned").length,
        },
      ];

      exportToExcelMultiSheet(
        [
          { name: "Tổng quan", data: summaryData },
          { name: "Hiệu suất thiết bị", data: deviceUsageData },
        ],
        `Bao_cao_hieu_suat_${new Date().toISOString().split("T")[0]}`
      );
    } catch (err: any) {
      console.error("Error exporting Excel:", err);
      alert(err.message || "Không thể xuất file Excel");
    }
  };

  // Xuất PDF
  const handleExportPDF = () => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("vi-VN");
      const allDevices = [...devices, ...warehouseDevices];
      const summaryRows = [
        ["Tổng thiết bị", allDevices.length.toString()],
        ["Tổng phiếu mượn", borrowRecords.length.toString()],
        ["Đang mượn", borrowRecords.filter((b) => b.status === "borrowed").length.toString()],
        ["Đã trả", borrowRecords.filter((b) => b.status === "returned").length.toString()],
      ];

      exportTableToPDF(
        "BÁO CÁO HIỆU SUẤT",
        ["Chỉ tiêu", "Giá trị"],
        summaryRows,
        `Bao_cao_hieu_suat_${new Date().toISOString().split("T")[0]}`,
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/reports/summary")}
            variant="outlined"
          >
            Quay lại
          </Button>
          <TrendingUpIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo hiệu suất
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
          Phân tích hiệu suất sử dụng và hoạt động của thiết bị
        </Typography>
      </Box>

      {/* Thống kê tổng quan */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <SpeedIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {usageRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ sử dụng
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={usageRate}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleIcon
                  sx={{ fontSize: 40, color: "success.main" }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {activeRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ hoạt động tốt
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={activeRate}
                    color="success"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DevicesIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {borrowRecords.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng lượt mượn
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Biểu đồ mượn trả theo tháng */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thống kê mượn trả 6 tháng gần đây
          </Typography>
          <Box sx={{ height: 400, mt: 2 }}>
            <Bar data={monthlyBorrowChartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Top thiết bị được mượn nhiều nhất */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top 10 thiết bị được mượn nhiều nhất
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Mã thiết bị</TableCell>
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell align="right">Số lượt mượn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topBorrowedDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        Chưa có dữ liệu mượn trả
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topBorrowedDevices.map((item, index) => (
                    <TableRow key={item.deviceId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.deviceCode}</TableCell>
                      <TableCell>{item.deviceName}</TableCell>
                      <TableCell align="right">
                        <Chip label={item.count} color="primary" size="small" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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

