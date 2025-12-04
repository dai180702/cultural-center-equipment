"use client";
// Báo cáo người dùng
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
import { getUsers, User } from "@/services/users";
import { getBorrowRecords, BorrowRecord } from "@/services/borrows";
import {
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
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

const roleLabels: Record<string, string> = {
  director: "Giám đốc",
  deputy_director: "Phó giám đốc",
  manager: "Quản lý",
  staff: "Nhân viên",
  technician: "Kỹ thuật viên",
};

const statusLabels: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  suspended: "Tạm ngưng",
};

export default function UsersReportPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
      const [usersData, borrowsData] = await Promise.all([
        getUsers(),
        getBorrowRecords(),
      ]);
      setUsers(usersData);
      setBorrowRecords(borrowsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Thống kê theo trạng thái
  const usersByStatus = users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Thống kê theo vai trò
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Thống kê theo phòng ban
  const usersByDepartment = users.reduce((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top người dùng mượn nhiều nhất
  const getTopBorrowers = () => {
    const borrowerCount: Record<
      string,
      { count: number; borrowerName?: string; department?: string }
    > = {};
    borrowRecords.forEach((record) => {
      if (!borrowerCount[record.borrowerId]) {
        borrowerCount[record.borrowerId] = {
          count: 0,
          borrowerName: record.borrowerName,
          department: record.department,
        };
      }
      borrowerCount[record.borrowerId].count += 1;
    });

    return Object.entries(borrowerCount)
      .map(([userId, data]) => {
        const user = users.find((u) => u.uid === userId || u.id === userId);
        return {
          userId,
          userName: user?.fullName || data.borrowerName || "Không xác định",
          department: user?.department || data.department || "-",
          count: data.count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Dữ liệu biểu đồ trạng thái
  const statusChartData = {
    labels: Object.keys(usersByStatus).map((key) => statusLabels[key] || key),
    datasets: [
      {
        label: "Số lượng",
        data: Object.values(usersByStatus),
        backgroundColor: ["#4caf50", "#9e9e9e", "#f44336"],
      },
    ],
  };

  // Dữ liệu biểu đồ vai trò
  const roleChartData = {
    labels: Object.keys(usersByRole).map((key) => roleLabels[key] || key),
    datasets: [
      {
        label: "Số lượng",
        data: Object.values(usersByRole),
        backgroundColor: [
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336",
        ],
      },
    ],
  };

  // Dữ liệu biểu đồ phòng ban
  const departmentChartData = {
    labels: Object.keys(usersByDepartment).sort(
      (a, b) => usersByDepartment[b] - usersByDepartment[a]
    ),
    datasets: [
      {
        label: "Số lượng",
        data: Object.keys(usersByDepartment)
          .sort((a, b) => usersByDepartment[b] - usersByDepartment[a])
          .map((dept) => usersByDepartment[dept]),
        backgroundColor: [
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#00bcd4",
          "#ffeb3b",
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

  const topBorrowers = getTopBorrowers();

  // Xuất Excel
  const handleExportExcel = () => {
    try {
      const userData = users.map((user) => ({
        "Mã NV": user.employeeId,
        "Họ tên": user.fullName,
        Email: user.email,
        "Phòng ban": user.department,
        "Chức vụ": user.position,
        "Vai trò": roleLabels[user.role] || user.role,
        "Trạng thái": statusLabels[user.status] || user.status,
        "Ngày vào làm": user.startDate,
      }));

      const summaryData = [
        {
          "Tổng nhân viên": users.length,
          "Hoạt động": users.filter((u) => u.status === "active").length,
          "Không hoạt động": users.filter((u) => u.status === "inactive")
            .length,
          "Tạm ngưng": users.filter((u) => u.status === "suspended").length,
        },
      ];

      exportToExcelMultiSheet(
        [
          { name: "Tổng quan", data: summaryData },
          { name: "Danh sách nhân viên", data: userData },
        ],
        `Bao_cao_nguoi_dung_${new Date().toISOString().split("T")[0]}`
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
        ["Tổng nhân viên", users.length.toString()],
        [
          "Hoạt động",
          users.filter((u) => u.status === "active").length.toString(),
        ],
        [
          "Không hoạt động",
          users.filter((u) => u.status === "inactive").length.toString(),
        ],
        [
          "Tạm ngưng",
          users.filter((u) => u.status === "suspended").length.toString(),
        ],
      ];

      exportTableToPDF(
        "BÁO CÁO NGƯỜI DÙNG",
        ["Chỉ tiêu", "Giá trị"],
        summaryRows,
        `Bao_cao_nguoi_dung_${new Date().toISOString().split("T")[0]}`,
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
          <PeopleIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo người dùng
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
          Thống kê và phân tích về người dùng và hoạt động mượn trả
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
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng người dùng
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
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {usersByStatus.active || 0}
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
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CancelIcon sx={{ fontSize: 40, color: "grey.500" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {(usersByStatus.inactive || 0) +
                      (usersByStatus.suspended || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Không hoạt động
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
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonIcon sx={{ fontSize: 40, color: "info.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Object.keys(usersByDepartment).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phòng ban
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Biểu đồ */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo trạng thái
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={statusChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo vai trò
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={roleChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 16px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo phòng ban
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={departmentChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Top người dùng mượn nhiều nhất */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top 10 người dùng mượn nhiều nhất
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên người dùng</TableCell>
                  <TableCell>Phòng ban</TableCell>
                  <TableCell align="right">Số lượt mượn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topBorrowers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        Chưa có dữ liệu mượn trả
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topBorrowers.map((item, index) => (
                    <TableRow key={item.userId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.userName}</TableCell>
                      <TableCell>{item.department}</TableCell>
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

      {/* Bảng chi tiết */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
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
                    {Object.entries(usersByDepartment)
                      .sort(([, a], [, b]) => b - a)
                      .map(([dept, count]) => (
                        <TableRow key={dept}>
                          <TableCell>{dept}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {users.length > 0
                              ? Math.round((count / users.length) * 100)
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
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê theo vai trò
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vai trò</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Tỷ lệ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(usersByRole)
                      .sort(([, a], [, b]) => b - a)
                      .map(([role, count]) => (
                        <TableRow key={role}>
                          <TableCell>{roleLabels[role] || role}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {users.length > 0
                              ? Math.round((count / users.length) * 100)
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
