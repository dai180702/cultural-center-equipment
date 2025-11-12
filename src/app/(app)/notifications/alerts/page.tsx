"use client";
// Xem cảnh báo
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert as MuiAlert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getAlerts, Notification } from "@/services/notifications";

export default function NotificationsAlertsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadAlerts();
  }, [currentUser, router]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Cảnh báo
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {alerts.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                Không có cảnh báo nào
              </Typography>
            ) : (
              <List>
                {alerts.map((alert, index) => (
                  <Box key={alert.id}>
                    <ListItem>
                      <MuiAlert severity="error" sx={{ width: "100%" }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.createdAt
                            ? new Date(alert.createdAt).toLocaleString("vi-VN")
                            : "-"}
                        </Typography>
                      </MuiAlert>
                    </ListItem>
                    {index < alerts.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

