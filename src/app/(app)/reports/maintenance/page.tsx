"use client";
// Báo cáo bảo trì
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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getDevices, Device } from "@/services/devices";
import { getWarehouseDevices } from "@/services/warehouse";
import {
  Build as BuildIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import {
  exportToExcel,
  exportToExcelMultiSheet,
  exportTableToPDF,
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
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function MaintenanceReportPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [warehouseDevices, setWarehouseDevices] = useState<Device[]>([]);
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
      const [devicesData, warehouseData] = await Promise.all([
        getDevices(),
        getWarehouseDevices(),
      ]);
      setDevices(devicesData);
      setWarehouseDevices(warehouseData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const allDevices = [...devices, ...warehouseDevices];

  // Thống kê theo trạng thái bảo trì
  const maintenanceStats = {
    active: allDevices.filter((d) => d.status === "active").length,
    maintenance: allDevices.filter((d) => d.status === "maintenance").length,
    broken: allDevices.filter((d) => d.status === "broken").length,
    retired: allDevices.filter((d) => d.status === "retired").length,
  };

  // Thiết bị cần bảo trì
  const devicesNeedingMaintenance = allDevices.filter(
    (d) => d.status === "maintenance" || d.status === "broken"
  );

  // Thống kê theo danh mục - thiết bị cần bảo trì
  const maintenanceByCategory = devicesNeedingMaintenance.reduce(
    (acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Dữ liệu biểu đồ trạng thái
  const statusChartData = {
    labels: ["Hoạt động", "Cần bảo trì", "Đã hỏng", "Thanh lý"],
    datasets: [
      {
        label: "Số lượng",
        data: [
          maintenanceStats.active,
          maintenanceStats.maintenance,
          maintenanceStats.broken,
          maintenanceStats.retired,
        ],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#9e9e9e"],
      },
    ],
  };

  // Dữ liệu biểu đồ theo danh mục
  const categoryChartData = {
    labels: Object.keys(maintenanceByCategory),
    datasets: [
      {
        label: "Số lượng",
        data: Object.values(maintenanceByCategory),
        backgroundColor: [
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#00bcd4",
        ],
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
  };

  // Xuất Excel
  const handleExportExcel = () => {
    try {
      const maintenanceDevices = allDevices.filter(
        (d) => d.status === "maintenance" || d.status === "broken"
      );
      const excelData = maintenanceDevices.map((device) => ({
        "Mã thiết bị": device.code,
        "Tên thiết bị": device.name,
        "Danh mục": device.category,
        "Trạng thái": device.status,
        "Lần bảo trì cuối": device.lastMaintenance || "Chưa có",
        "Lần bảo trì tiếp theo": device.nextMaintenance || "Chưa có",
        "Lịch bảo trì": device.maintenanceSchedule || "Chưa có",
      }));

      const summaryData = [
        {
          "Đang hoạt động": maintenanceStats.active,
          "Cần bảo trì": maintenanceStats.maintenance,
          "Đã hỏng": maintenanceStats.broken,
          "Thanh lý": maintenanceStats.retired,
        },
      ];

      exportToExcelMultiSheet(
        [
          { name: "Tổng quan", data: summaryData },
          { name: "Thiết bị cần bảo trì", data: excelData },
        ],
        `Bao_cao_bao_tri_${new Date().toISOString().split("T")[0]}`
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
      const summaryRows = [
        ["Đang hoạt động", maintenanceStats.active.toString()],
        ["Cần bảo trì", maintenanceStats.maintenance.toString()],
        ["Đã hỏng", maintenanceStats.broken.toString()],
        ["Thanh lý", maintenanceStats.retired.toString()],
      ];

      exportTableToPDF(
        "BÁO CÁO BẢO TRÌ",
        ["Trạng thái", "Số lượng"],
        summaryRows,
        `Bao_cao_bao_tri_${new Date().toISOString().split("T")[0]}`,
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
          <BuildIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo bảo trì
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
          Thống kê và phân tích tình trạng bảo trì thiết bị
        </Typography>
      </Box>

      {/* Thống kê tổng quan */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              md: "1 1 calc(25% - 18px)",
            },
          }}
        >
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
                    {maintenanceStats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang hoạt động
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              md: "1 1 calc(25% - 18px)",
            },
          }}
        >
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <WarningIcon sx={{ fontSize: 40, color: "warning.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {maintenanceStats.maintenance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cần bảo trì
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              md: "1 1 calc(25% - 18px)",
            },
          }}
        >
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <ErrorIcon sx={{ fontSize: 40, color: "error.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {maintenanceStats.broken}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã hỏng
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              md: "1 1 calc(25% - 18px)",
            },
          }}
        >
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <BuildIcon sx={{ fontSize: 40, color: "grey.500" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {devicesNeedingMaintenance.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng cần bảo trì
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Biểu đồ */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo trạng thái
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={statusChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thiết bị cần bảo trì theo danh mục
              </Typography>
              <Box sx={{ height: 300 }}>
                {Object.keys(maintenanceByCategory).length > 0 ? (
                  <Bar data={categoryChartData} options={chartOptions} />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography color="text.secondary">
                      Không có thiết bị cần bảo trì
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Danh sách thiết bị cần bảo trì */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách thiết bị cần bảo trì
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã thiết bị</TableCell>
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Vị trí</TableCell>
                  <TableCell>Phòng ban</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devicesNeedingMaintenance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        Không có thiết bị cần bảo trì
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  devicesNeedingMaintenance.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.code}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            device.status === "maintenance"
                              ? "Cần bảo trì"
                              : "Đã hỏng"
                          }
                          color={
                            device.status === "maintenance"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{device.location || "-"}</TableCell>
                      <TableCell>{device.department || "-"}</TableCell>
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
