"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { getAppSettings, setActionPassword } from "@/services/settings";
import { getUserByEmail } from "@/services/users";

export default function ManageUserActionPasswordPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [currentMasked, setCurrentMasked] = useState<string>("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!currentUser?.email) return;
      const profile = await getUserByEmail(currentUser.email);
      setRole(profile?.role || null);
      const s = await getAppSettings();
      setCurrentMasked(s?.actionPassword ? "********" : "(chưa thiết lập)");
    })();
  }, [currentUser?.email]);

  const isDirectorOrDeputy = role === "director" || role === "deputy_director";

  const [resetLoading, setResetLoading] = useState(false);
  const handleReset = async () => {
    try {
      setError(null);
      setSuccess(null);
      const ok =
        typeof window !== "undefined"
          ? window.confirm("Bạn có chắc muốn đặt lại mật khẩu hành động?")
          : true;
      if (!ok) return;
      setResetLoading(true);
      await setActionPassword("", currentUser?.email || "unknown");
      setCurrentMasked("(chưa thiết lập)");
      setSuccess("Đã đặt lại mật khẩu hành động (chưa thiết lập)");
    } catch (e: any) {
      setError(e?.message || "Lỗi khi đặt lại mật khẩu");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (!newPwd.trim()) {
        setError("Mật khẩu mới không được để trống");
        return;
      }
      if (newPwd !== confirmPwd) {
        setError("Xác nhận mật khẩu không khớp");
        return;
      }
      setLoading(true);
      await setActionPassword(newPwd, currentUser?.email || "unknown");
      setNewPwd("");
      setConfirmPwd("");
      setSuccess("Đã cập nhật mật khẩu hành động");
      setCurrentMasked("********");
    } catch (e: any) {
      setError(e?.message || "Lỗi khi cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!isDirectorOrDeputy) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">
              Bạn không có quyền truy cập trang này.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => router.push("/users")}>
                Quay lại danh sách
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Quản lý mật khẩu hành động
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Mật khẩu này dùng để xác nhận khi thêm mới, chỉnh sửa, xóa nhân
            viên.
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

          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Quên mật khẩu */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quên mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Nếu quên mật khẩu, bạn có thể đặt lại mật khẩu hành động.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  label="Trạng thái hiện tại"
                  value={currentMasked}
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 1 }}
                />
                <Button
                  color="error"
                  variant="outlined"
                  disabled={resetLoading}
                  onClick={handleReset}
                >
                  {resetLoading ? "Đang đặt lại..." : "Đặt lại"}
                </Button>
              </Box>
            </Box>

            {/* Thay đổi mật khẩu */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thay đổi mật khẩu
              </Typography>
              <Box sx={{ display: "grid", gap: 2 }}>
                <TextField
                  label="Mật khẩu mới"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
                <TextField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Button variant="outlined" onClick={() => router.back()}>
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    disabled={loading}
                    onClick={handleSave}
                  >
                    {loading ? "Đang lưu..." : "Lưu"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
