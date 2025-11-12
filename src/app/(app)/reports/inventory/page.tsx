"use client";
// Báo cáo tồn kho
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
  Stack,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getWarehouseDevices } from "@/services/warehouse";
import { getDevices } from "@/services/devices";
import {
  Inventory as InventoryIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { exportToExcel, exportToExcelMultiSheet, exportTableToPDF } from "@/utils/exportUtils";
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
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function InventoryReportPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [warehouseDevices, setWarehouseDevices] = useState<any[]>([]);
  const [inUseDevices, setInUseDevices] = useState<any[]>([]);
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
      const [warehouseData, devicesData] = await Promise.all([
        getWarehouseDevices(),
        getDevices(),
      ]);
      setWarehouseDevices(warehouseData);
      setInUseDevices(devicesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Thống kê theo danh mục trong kho
  const warehouseByCategory = warehouseDevices.reduce((acc, device) => {
    acc[device.category] = (acc[device.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Thống kê theo trạng thái trong kho
  const warehouseByStatus = warehouseDevices.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Thống kê theo danh mục đang sử dụng
  const inUseByCategory = inUseDevices.reduce((acc, device) => {
    acc[device.category] = (acc[device.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dữ liệu biểu đồ so sánh kho vs đang sử dụng
  const comparisonChartData = {
    labels: Array.from(
      new Set([
        ...Object.keys(warehouseByCategory),
        ...Object.keys(inUseByCategory),
      ])
    ),
    datasets: [
      {
        label: "Trong kho",
        data: Array.from(
          new Set([
            ...Object.keys(warehouseByCategory),
            ...Object.keys(inUseByCategory),
          ])
        ).map((cat) => warehouseByCategory[cat] || 0),
        backgroundColor: alpha("#2196f3", 0.6),
        borderColor: "#2196f3",
        borderWidth: 2,
      },
      {
        label: "Đang sử dụng",
        data: Array.from(
          new Set([
            ...Object.keys(warehouseByCategory),
            ...Object.keys(inUseByCategory),
          ])
        ).map((cat) => inUseByCategory[cat] || 0),
        backgroundColor: alpha("#4caf50", 0.6),
        borderColor: "#4caf50",
        borderWidth: 2,
      },
    ],
  };

  // Dữ liệu biểu đồ trạng thái trong kho
  const statusChartData = {
    labels: Object.keys(warehouseByStatus).map((key) => {
      const labels: Record<string, string> = {
        active: "Hoạt động",
        maintenance: "Cần bảo trì",
        broken: "Đã hỏng",
        retired: "Thanh lý",
      };
      return labels[key] || key;
    }),
    datasets: [
      {
        label: "Số lượng",
        data: Object.values(warehouseByStatus),
        backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#9e9e9e"],
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
          <InventoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo tồn kho
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
          Thống kê và phân tích tình trạng tồn kho thiết bị
        </Typography>
      </Box>

      {/* Thống kê tổng quan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
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
                <InventoryIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {warehouseDevices.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thiết bị trong kho
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
                <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {inUseDevices.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thiết bị đang sử dụng
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
                <WarningIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {warehouseDevices.length + inUseDevices.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng thiết bị
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
                So sánh kho vs đang sử dụng theo danh mục
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar data={comparisonChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trạng thái thiết bị trong kho
              </Typography>
              <Box sx={{ height: 400 }}>
                <Doughnut data={statusChartData} options={chartOptions} />
              </Box>
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
                Thống kê trong kho theo danh mục
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
                    {Object.entries(warehouseByCategory)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([category, count]) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell align="right">{count as number}</TableCell>
                          <TableCell align="right">
                            {warehouseDevices.length > 0
                              ? Math.round(
                                  ((count as number) /
                                    warehouseDevices.length) *
                                    100
                                )
                              : 0}
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
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê đang sử dụng theo danh mục
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
                    {Object.entries(inUseByCategory)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([category, count]) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell align="right">{count as number}</TableCell>
                          <TableCell align="right">
                            {inUseDevices.length > 0
                              ? Math.round(
                                  ((count as number) / inUseDevices.length) *
                                    100
                                )
                              : 0}
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
