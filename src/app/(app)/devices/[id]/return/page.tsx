"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Card, CardContent, Typography, Box, Button, Alert, CircularProgress } from "@mui/material";
import { getDeviceById } from "@/services/devices";
import { getActiveBorrowByDevice, returnBorrowRecord } from "@/services/borrows";
import { useAuth } from "@/contexts/AuthContext";

export default function ReturnDevicePage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>("");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [borrower, setBorrower] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [d, active] = await Promise.all([
          getDeviceById(deviceId),
          getActiveBorrowByDevice(deviceId),
        ]);
        if (!mounted) return;
        if (!d) {
          setError("Không tìm thấy thiết bị");
          return;
        }
        setDeviceName(d.name);
        if (!active) {
          setError("Thiết bị hiện không có phiếu mượn đang hoạt động");
          return;
        }
        setRecordId(active.id || null);
        setBorrower(active.borrowerName || active.borrowerId || null);
      } catch (e: any) {
        setError(e?.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    if (deviceId) load();
    return () => {
      mounted = false;
    };
  }, [deviceId]);

  const handleReturn = async () => {
    if (!recordId) return;
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await returnBorrowRecord(recordId, currentUser?.uid, currentUser?.displayName || currentUser?.email || "");
      setSuccess("Đã xác nhận trả thiết bị");
      setTimeout(() => router.push(`/devices`), 800);
    } catch (e: any) {
      setError(e?.message || "Không thể xác nhận trả thiết bị");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress />
          <Typography>Đang tải...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Trả thiết bị
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Thiết bị: {deviceName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography sx={{ mb: 2 }}>
            Xác nhận trả thiết bị đang được mượn bởi: {borrower || "(không rõ)"}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={() => router.back()}>Hủy</Button>
            <Button variant="contained" disabled={!recordId || submitting} onClick={handleReturn}>
              {submitting ? "Đang xác nhận..." : "Xác nhận trả"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}





