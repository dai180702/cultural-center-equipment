"use client";
// Báo cáo thiết bị
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
  Divider,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Stack,
  alpha,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getDevices, Device } from "@/services/devices";
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as ExcelIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Assessment as AssessmentIcon,
  DevicesOther as DevicesIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
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
import { Bar, Pie, Doughnut } from "react-chartjs-2";

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

const deviceStatusColors: Record<string, "success" | "warning" | "error" | "default"> = {
  active: "success",
  maintenance: "warning",
  broken: "error",
  retired: "default",
};

export default function DeviceReportsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

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
      const devicesData = await getDevices();
      setDevices(devicesData);
    } catch (err) {
      console.error("Error loading devices:", err);
      setError("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const getStatistics = () => {
    const total = devices.length;
    
    const byStatus = devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = devices.reduce((acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDepartment = devices.reduce((acc, device) => {
      const dept = device.department || "Chưa phân bổ";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = devices.reduce((acc, device) => {
      const loc = device.location || "Chưa xác định";
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Thiết bị đang được gán
    const assignedCount = devices.filter((d) => d.assignedTo).length;
    const unassignedCount = total - assignedCount;

    return {
      total,
      byStatus,
      byCategory,
      byDepartment,
      byLocation,
      assignedCount,
      unassignedCount,
    };
  };

  const stats = getStatistics();

  // Export PDF
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Không thể mở cửa sổ in");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo thiết bị</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #1976d2; }
            h2 { color: #424242; margin-top: 30px; }
            .summary { background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .summary-item { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .stats-table { margin: 20px 0; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO THIẾT BỊ</h1>
          <p style="text-align: center;">Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</p>
          
          <div class="summary">
            <h2>Tổng quan</h2>
            <div class="summary-item"><strong>Tổng số thiết bị:</strong> ${stats.total}</div>
            <div class="summary-item"><strong>Đang hoạt động:</strong> ${stats.byStatus.active || 0}</div>
            <div class="summary-item"><strong>Cần bảo trì:</strong> ${stats.byStatus.maintenance || 0}</div>
            <div class="summary-item"><strong>Đã hỏng:</strong> ${stats.byStatus.broken || 0}</div>
            <div class="summary-item"><strong>Thanh lý:</strong> ${stats.byStatus.retired || 0}</div>
            <div class="summary-item"><strong>Đang được sử dụng:</strong> ${stats.assignedCount}</div>
            <div class="summary-item"><strong>Chưa được sử dụng:</strong> ${stats.unassignedCount}</div>
          </div>

          <div class="page-break"></div>

          <h2>Thống kê theo trạng thái</h2>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Tỷ lệ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(stats.byStatus)
                .map(
                  ([status, count]) => `
                <tr>
                  <td>${deviceStatusLabels[status] || status}</td>
                  <td>${count}</td>
                  <td>${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2>Thống kê theo danh mục</h2>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Số lượng</th>
                <th>Tỷ lệ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(
                  ([category, count]) => `
                <tr>
                  <td>${category}</td>
                  <td>${count}</td>
                  <td>${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2>Thống kê theo phòng ban</h2>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Phòng ban</th>
                <th>Số lượng</th>
                <th>Tỷ lệ (%)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(stats.byDepartment)
                .sort(([, a], [, b]) => b - a)
                .map(
                  ([dept, count]) => `
                <tr>
                  <td>${dept}</td>
                  <td>${count}</td>
                  <td>${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="page-break"></div>

          <h2>Danh sách thiết bị</h2>
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
                <th>Người được giao</th>
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
                  <td>${deviceStatusLabels[device.status] || device.status}</td>
                  <td>${device.location || ""}</td>
                  <td>${device.department || ""}</td>
                  <td>${device.assignedTo ? "Có" : "Không"}</td>
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

  // Export Excel (CSV)
  const handleExportExcel = () => {
    const headers = [
      "Mã TB",
      "Tên thiết bị",
      "Danh mục",
      "Thương hiệu",
      "Model",
      "Số serial",
      "Trạng thái",
      "Vị trí",
      "Phòng ban",
      "Người được giao",
      "Ngày mua",
      "Hết hạn bảo hành",
    ];

    const csvContent = [
      headers.join(","),
      ...devices.map((device) =>
        [
          `"${device.code || ""}"`,
          `"${device.name || ""}"`,
          `"${device.category || ""}"`,
          `"${device.brand || ""}"`,
          `"${device.model || ""}"`,
          `"${device.serialNumber || ""}"`,
          `"${deviceStatusLabels[device.status] || device.status}"`,
          `"${device.location || ""}"`,
          `"${device.department || ""}"`,
          `"${device.assignedTo ? "Có" : "Không"}"`,
          `"${device.purchaseDate || ""}"`,
          `"${device.warrantyExpiry || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_thiet_bi_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccess("Xuất file Excel thành công");
    setExportMenuAnchor(null);
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

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

  // Chart data
  const statusChartData = {
    labels: Object.keys(stats.byStatus).map(
      (status) => deviceStatusLabels[status] || status
    ),
    datasets: [
      {
        label: "Số lượng",
        data: Object.values(stats.byStatus),
        backgroundColor: [
          alpha("#2e7d32", 0.8),
          alpha("#ed6c02", 0.8),
          alpha("#d32f2f", 0.8),
          alpha("#757575", 0.8),
        ],
        borderColor: [
          "#2e7d32",
          "#ed6c02",
          "#d32f2f",
          "#757575",
        ],
        borderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category),
    datasets: [
      {
        label: "Số lượng",
        data: Object.entries(stats.byCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([, count]) => count),
        backgroundColor: [
          alpha("#1976d2", 0.8),
          alpha("#2e7d32", 0.8),
          alpha("#ed6c02", 0.8),
          alpha("#9c27b0", 0.8),
          alpha("#d32f2f", 0.8),
        ],
        borderColor: [
          "#1976d2",
          "#2e7d32",
          "#ed6c02",
          "#9c27b0",
          "#d32f2f",
        ],
        borderWidth: 2,
      },
    ],
  };

  const assignmentChartData = {
    labels: ["Đang sử dụng", "Chưa sử dụng"],
    datasets: [
      {
        data: [stats.assignedCount, stats.unassignedCount],
        backgroundColor: [
          alpha("#1976d2", 0.8),
          alpha("#9e9e9e", 0.8),
        ],
        borderColor: ["#1976d2", "#9e9e9e"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", pb: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => router.back()}
                  sx={{ color: "white", bgcolor: alpha("#fff", 0.2), "&:hover": { bgcolor: alpha("#fff", 0.3) } }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssessmentIcon sx={{ fontSize: 32 }} />
                    Báo cáo thiết bị
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Thống kê và báo cáo tổng quan về thiết bị
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleExportMenuOpen}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: alpha("#fff", 0.9) },
                    minWidth: 120,
                  }}
                  startIcon={<MoreVertIcon />}
                >
                  Xuất báo cáo
                </Button>
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportMenuClose}
                >
                  <MenuItem onClick={handleExportPDF}>
                    <PdfIcon sx={{ mr: 1 }} />
                    Xuất PDF
                  </MenuItem>
                  <MenuItem onClick={handleExportExcel}>
                    <ExcelIcon sx={{ mr: 1 }} />
                    Xuất Excel
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                boxShadow: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1 }} variant="body2">
                      Tổng số thiết bị
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.total}
                    </Typography>
                  </Box>
                  <DevicesIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                color: "white",
                boxShadow: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1 }} variant="body2">
                      Đang hoạt động
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.byStatus.active || 0}
                    </Typography>
                    {stats.total > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={((stats.byStatus.active || 0) / stats.total) * 100}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha("#fff", 0.2),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "white",
                          },
                        }}
                      />
                    )}
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #ed6c02 0%, #e65100 100%)",
                color: "white",
                boxShadow: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1 }} variant="body2">
                      Cần bảo trì
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.byStatus.maintenance || 0}
                    </Typography>
                    {stats.total > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={((stats.byStatus.maintenance || 0) / stats.total) * 100}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha("#fff", 0.2),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "white",
                          },
                        }}
                      />
                    )}
                  </Box>
                  <BuildIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                color: "white",
                boxShadow: 3,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ opacity: 0.9, mb: 1 }} variant="body2">
                      Đã hỏng
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.byStatus.broken || 0}
                    </Typography>
                    {stats.total > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={((stats.byStatus.broken || 0) / stats.total) * 100}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha("#fff", 0.2),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "white",
                          },
                        }}
                      />
                    )}
                  </Box>
                  <ErrorIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Thống kê theo trạng thái
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 300 }}>
                  <Bar data={statusChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Top 5 danh mục
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 300 }}>
                  <Bar data={categoryChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Tình trạng phân bổ
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 250 }}>
                  <Doughnut data={assignmentChartData} options={chartOptions} />
                </Box>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Chip
                      label={`Đang sử dụng: ${stats.assignedCount}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Chưa sử dụng: ${stats.unassignedCount}`}
                      color="default"
                      size="small"
                    />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: "100%", boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BusinessIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Thống kê theo phòng ban
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Phòng ban</TableCell>
                        <TableCell align="right">Số lượng</TableCell>
                        <TableCell>Tiến độ</TableCell>
                        <TableCell align="right">Tỷ lệ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(stats.byDepartment)
                        .sort(([, a], [, b]) => b - a)
                        .map(([dept, count]) => (
                          <TableRow key={dept} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LocationIcon fontSize="small" color="action" />
                                {dept}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={stats.total > 0 ? (count / stats.total) * 100 : 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha("#1976d2", 0.1),
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Statistics Tables */}
        <Grid container spacing={3}>
          {/* By Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Chi tiết theo trạng thái
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="right">Số lượng</TableCell>
                        <TableCell>Tiến độ</TableCell>
                        <TableCell align="right">Tỷ lệ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(stats.byStatus)
                        .sort(([, a], [, b]) => b - a)
                        .map(([status, count]) => (
                          <TableRow key={status} hover>
                            <TableCell>
                              <Chip
                                label={deviceStatusLabels[status] || status}
                                color={deviceStatusColors[status] || "default"}
                                size="small"
                                icon={
                                  status === "active" ? (
                                    <CheckCircleIcon />
                                  ) : status === "maintenance" ? (
                                    <BuildIcon />
                                  ) : status === "broken" ? (
                                    <ErrorIcon />
                                  ) : undefined
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={stats.total > 0 ? (count / stats.total) * 100 : 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha("#1976d2", 0.1),
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%`}
                                size="small"
                                color={deviceStatusColors[status] || "default"}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* By Category */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Chi tiết theo danh mục
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Danh mục</TableCell>
                        <TableCell align="right">Số lượng</TableCell>
                        <TableCell>Tiến độ</TableCell>
                        <TableCell align="right">Tỷ lệ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(stats.byCategory)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([category, count]) => (
                          <TableRow key={category} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CategoryIcon fontSize="small" color="action" />
                                {category}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={stats.total > 0 ? (count / stats.total) * 100 : 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha("#1976d2", 0.1),
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

