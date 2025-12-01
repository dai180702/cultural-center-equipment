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
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  addBorrowRecord,
  BorrowFormData,
  checkDeviceAvailability,
} from "@/services/borrows";
import { getDevices, Device } from "@/services/devices";
import { getWarehouseDevices } from "@/services/warehouse";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

export default function NewBorrowPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<BorrowFormData>({
    deviceId: "",
    deviceCode: "",
    deviceName: "",
    borrowerId: "",
    borrowerName: "",
    department: "",
    purpose: "",
    borrowDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [currentUser, router]);

  // Tìm kiếm thiết bị real-time
  useEffect(() => {
    if (!searchTerm.trim()) {
      setDevices(allDevices);
    } else {
      const filtered = allDevices.filter((device) => {
        const searchFields = [
          device.name,
          device.code,
          device.brand,
          device.model,
          device.serialNumber,
          device.category,
        ]
          .join(" ")
          .toLowerCase();
        return searchFields.includes(searchTerm.toLowerCase());
      });
      setDevices(filtered);
    }
  }, [searchTerm, allDevices]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      // Chỉ lấy thiết bị từ kho (warehouse) - thiết bị chưa được sử dụng
      const devicesData = await getWarehouseDevices();
      // Lọc chỉ thiết bị có status active và không có assignedTo
      const availableDevices = devicesData.filter(
        (device) =>
          device.status === "active" &&
          !device.assignedTo &&
          (device.location?.toLowerCase().includes("kho") ||
            device.location === "Kho" ||
            !device.location)
      );
      setAllDevices(availableDevices);
      setDevices(availableDevices);

      // Tự động set người mượn là user hiện tại (bắt buộc, không thể thay đổi)
      if (currentUser?.email) {
        const { getUserByEmail } = await import("@/services/users");
        const currentUserProfile = await getUserByEmail(currentUser.email);
        if (currentUserProfile) {
          setFormData((prev) => ({
            ...prev,
            borrowerId: currentUserProfile.uid || currentUserProfile.id || "",
            borrowerName:
              currentUserProfile.fullName || currentUser.email || "",
            department: currentUserProfile.department || "",
          }));
        } else {
          setError("Không tìm thấy thông tin người dùng trong hệ thống");
        }
      } else {
        setError("Không tìm thấy thông tin đăng nhập");
      }
    } catch (err) {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = async (field: keyof BorrowFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Kiểm tra lại khi thay đổi ngày mượn hoặc ngày trả dự kiến
    if (
      (field === "borrowDate" || field === "expectedReturnDate") &&
      formData.deviceId
    ) {
      try {
        const borrowDate =
          field === "borrowDate"
            ? new Date(value)
            : new Date(formData.borrowDate);
        const expectedReturnDate =
          field === "expectedReturnDate"
            ? value
              ? new Date(value)
              : undefined
            : formData.expectedReturnDate
            ? new Date(formData.expectedReturnDate)
            : undefined;

        if (borrowDate && !isNaN(borrowDate.getTime())) {
          const availability = await checkDeviceAvailability(
            formData.deviceId,
            borrowDate,
            expectedReturnDate
          );

          if (!availability.available) {
            setErrors((prev) => ({
              ...prev,
              deviceId:
                availability.message ||
                "Thiết bị đang được mượn trong khoảng thời gian này",
            }));
          } else {
            // Clear error nếu thiết bị available
            setErrors((prev) => {
              const newErrors = { ...prev };
              if (
                newErrors.deviceId &&
                newErrors.deviceId.includes("đang được mượn")
              ) {
                delete newErrors.deviceId;
              }
              return newErrors;
            });
          }
        }
      } catch (err) {
        // Ignore error khi check, sẽ check lại khi submit
      }
    }
  };

  // Hàm chọn thiết bị từ bảng danh sách
  const handleSelectDevice = async (device: Device) => {
    if (device && device.id) {
      setFormData((prev) => ({
        ...prev,
        deviceId: device.id || "",
        deviceCode: device.code,
        deviceName: device.name,
      }));
      setErrors((prev) => ({ ...prev, deviceId: "" }));

      // Check availability
      if (formData.borrowDate) {
        try {
          const borrowDate = new Date(formData.borrowDate);
          const expectedReturnDate = formData.expectedReturnDate
            ? new Date(formData.expectedReturnDate)
            : undefined;

          const availability = await checkDeviceAvailability(
            device.id,
            borrowDate,
            expectedReturnDate
          );

          if (!availability.available) {
            setErrors((prev) => ({
              ...prev,
              deviceId:
                availability.message ||
                "Thiết bị đang được mượn trong khoảng thời gian này",
            }));
          }
        } catch (err) {
          // Ignore error khi check, sẽ check lại khi submit
        }
      }
    }
  };

  const handleDeviceChange = async (device: Device | null) => {
    if (device) {
      setFormData((prev) => ({
        ...prev,
        deviceId: device.id || "",
        deviceCode: device.code,
        deviceName: device.name,
      }));
      if (errors.deviceId) {
        setErrors((prev) => ({ ...prev, deviceId: "" }));
      }

      // Kiểm tra ngay khi chọn thiết bị nếu đã có ngày mượn
      if (formData.borrowDate) {
        try {
          const borrowDate = new Date(formData.borrowDate);
          const expectedReturnDate = formData.expectedReturnDate
            ? new Date(formData.expectedReturnDate)
            : undefined;

          if (!isNaN(borrowDate.getTime())) {
            const availability = await checkDeviceAvailability(
              device.id || "",
              borrowDate,
              expectedReturnDate
            );

            if (!availability.available) {
              setErrors((prev) => ({
                ...prev,
                deviceId:
                  availability.message ||
                  "Thiết bị đang được mượn trong khoảng thời gian này",
              }));
            }
          }
        } catch (err) {
          // Ignore error khi check, sẽ check lại khi submit
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        deviceId: "",
        deviceCode: "",
        deviceName: "",
      }));
    }
  };

  // Không cần handleUserChange nữa vì người mượn là user hiện tại và không thể thay đổi

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceId) {
      newErrors.deviceId = "Vui lòng chọn thiết bị";
    }
    if (!formData.borrowerId) {
      newErrors.borrowerId = "Không tìm thấy thông tin người mượn";
    }
    if (!formData.borrowDate) {
      newErrors.borrowDate = "Vui lòng chọn ngày mượn";
    }
    if (formData.expectedReturnDate && formData.borrowDate) {
      if (
        new Date(formData.expectedReturnDate) < new Date(formData.borrowDate)
      ) {
        newErrors.expectedReturnDate = "Ngày dự kiến trả phải sau ngày mượn";
      }
    }

    // Kiểm tra xem thiết bị có đang được mượn trong khoảng thời gian yêu cầu không
    if (
      formData.deviceId &&
      formData.borrowDate &&
      Object.keys(newErrors).length === 0
    ) {
      try {
        const borrowDate = new Date(formData.borrowDate);
        const expectedReturnDate = formData.expectedReturnDate
          ? new Date(formData.expectedReturnDate)
          : undefined;

        const availability = await checkDeviceAvailability(
          formData.deviceId,
          borrowDate,
          expectedReturnDate
        );

        if (!availability.available) {
          newErrors.deviceId =
            availability.message ||
            "Thiết bị đang được mượn trong khoảng thời gian này";
        }
      } catch (err) {
        newErrors.deviceId =
          err instanceof Error
            ? err.message
            : "Không thể kiểm tra tình trạng thiết bị";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    if (!currentUser?.uid) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Kiểm tra lại một lần nữa trước khi tạo phiếu (double check)
      const borrowDate = new Date(formData.borrowDate);
      const expectedReturnDate = formData.expectedReturnDate
        ? new Date(formData.expectedReturnDate)
        : undefined;

      const availability = await checkDeviceAvailability(
        formData.deviceId,
        borrowDate,
        expectedReturnDate
      );

      if (!availability.available) {
        setError(
          availability.message ||
            "Thiết bị đang được mượn trong khoảng thời gian này"
        );
        setErrors((prev) => ({
          ...prev,
          deviceId: availability.message || "Thiết bị đang được mượn",
        }));
        return;
      }

      await addBorrowRecord(
        formData,
        currentUser.uid,
        currentUser.displayName || currentUser.email || ""
      );

      setSuccess("Tạo phiếu mượn thiết bị thành công!");
      setTimeout(() => {
        router.push("/borrow-return");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tạo phiếu mượn thiết bị"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/borrow-return")}
              sx={{ mb: 2 }}
            >
              Quay lại
            </Button>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              Tạo phiếu mượn thiết bị
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Điền thông tin để tạo phiếu mượn thiết bị mới
            </Typography>
          </Box>

          {/* Error/Success Messages */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}

          {/* Form */}
          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Thông tin phiếu mượn
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Thiết bị - Tìm kiếm và Danh sách */}
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Chọn thiết bị cần mượn từ kho
                    </Typography>
                  </Box>

                  {/* Search Bar */}
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm thiết bị (tên, mã, thương hiệu, model, serial number...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchTerm("")}
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {/* Thiết bị đã chọn */}
                  {formData.deviceId && (
                    <Alert
                      severity="success"
                      sx={{ mb: 2 }}
                      onClose={() => {
                        setFormData((prev) => ({
                          ...prev,
                          deviceId: "",
                          deviceCode: "",
                          deviceName: "",
                        }));
                      }}
                    >
                      Đã chọn: <strong>{formData.deviceCode} - {formData.deviceName}</strong>
                    </Alert>
                  )}

                  {/* Error message */}
                  {errors.deviceId && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.deviceId}
                    </Alert>
                  )}

                  {/* Danh sách thiết bị */}
                  <TableContainer
                    component={Paper}
                    sx={{
                      maxHeight: 400,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                            Mã TB
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                            Tên thiết bị
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                            Danh mục
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                            Thương hiệu
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                            Model
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: "bold", bgcolor: "grey.50" }}
                          >
                            Trạng thái
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: "bold", bgcolor: "grey.50" }}
                          >
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {devices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                {searchTerm
                                  ? "Không tìm thấy thiết bị phù hợp"
                                  : "Không có thiết bị nào trong kho"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          devices.map((device) => (
                            <TableRow
                              key={device.id}
                              hover
                              sx={{
                                bgcolor:
                                  formData.deviceId === device.id
                                    ? "action.selected"
                                    : "inherit",
                              }}
                            >
                              <TableCell>{device.code}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {device.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {device.category}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {device.brand}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {device.model || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label="Sẵn sàng"
                                  size="small"
                                  color="success"
                                  sx={{ fontSize: "0.75rem" }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  variant={
                                    formData.deviceId === device.id
                                      ? "contained"
                                      : "outlined"
                                  }
                                  size="small"
                                  onClick={() => handleSelectDevice(device)}
                                  disabled={formData.deviceId === device.id}
                                >
                                  {formData.deviceId === device.id
                                    ? "Đã chọn"
                                    : "Chọn"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Divider />

                {/* Người mượn - Không thể thay đổi */}
                <Box>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Thông tin người mượn
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Người mượn *"
                    value={formData.borrowerName || "Đang tải..."}
                    disabled
                    error={!!errors.borrowerId}
                    helperText={
                      errors.borrowerId ||
                      "Người mượn là tài khoản đang đăng nhập (không thể thay đổi)"
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "action.disabledBackground",
                      },
                    }}
                  />
                </Box>

                {/* Phòng ban và Mục đích */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Phòng ban"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="Phòng ban của người mượn"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Mục đích mượn"
                    value={formData.purpose}
                    onChange={(e) =>
                      handleInputChange("purpose", e.target.value)
                    }
                    placeholder="Mục đích sử dụng thiết bị"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <Divider />

                {/* Ngày mượn và Ngày dự kiến trả */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Ngày mượn *"
                    type="date"
                    value={formData.borrowDate}
                    onChange={(e) =>
                      handleInputChange("borrowDate", e.target.value)
                    }
                    error={!!errors.borrowDate}
                    helperText={errors.borrowDate}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Ngày dự kiến trả"
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={(e) =>
                      handleInputChange("expectedReturnDate", e.target.value)
                    }
                    error={!!errors.expectedReturnDate}
                    helperText={
                      errors.expectedReturnDate ||
                      "Tùy chọn - để theo dõi thời hạn trả"
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <Divider />

                {/* Ghi chú */}
                <Box>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Ghi chú thêm về phiếu mượn (nếu có)"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={() => router.push("/borrow-return")}
                  disabled={submitting}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    submitting ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {submitting ? "Đang tạo..." : "Tạo phiếu mượn"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
