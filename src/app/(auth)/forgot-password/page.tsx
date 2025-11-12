"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword(email);
      setSuccess(
        "Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn."
      );
      setEmail("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Email không tồn tại trong hệ thống.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email không hợp lệ.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <EmailIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Quên mật khẩu?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nhập email của bạn và chúng tôi sẽ gửi link khôi phục mật khẩu
            </Typography>
          </Box>

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

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading || !!success}
              placeholder="example@email.com"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.5 }}
              disabled={loading || !!success}
            >
              {loading ? "Đang gửi..." : "Gửi email khôi phục"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Link href="/login" passHref legacyBehavior>
              <MuiLink
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
                Quay lại đăng nhập
              </MuiLink>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

