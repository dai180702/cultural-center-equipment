"use client";
// Xem tất cả thông báo
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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getNotifications, Notification } from "@/services/notifications";
import { getUserByEmail } from "@/services/users";

export default function NotificationsAllPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    loadCurrentUserRole();
    loadNotifications();
  }, [currentUser, router]);

  const loadCurrentUserRole = async () => {
    try {
      if (!currentUser?.email) return;
      const profile = await getUserByEmail(currentUser.email);
      if (profile) {
        setCurrentUserRole(profile.role);
      }
    } catch (err) {
      console.error("Error loading user role:", err);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await getNotifications();
      const userId = currentUser?.uid || "";

      // Lọc thông báo phù hợp với người dùng
      const relevantNotifications = allNotifications.filter((notif) => {
        // Kiểm tra thông báo đã hết hạn chưa
        if (notif.expiresAt && notif.expiresAt < new Date()) {
          return false;
        }

        // Kiểm tra target audience
        if (notif.targetAudience === "all") {
          return true;
        }
        if (
          typeof notif.targetAudience === "string" &&
          notif.targetAudience === currentUserRole
        ) {
          return true;
        }
        if (
          Array.isArray(notif.targetAudience) &&
          notif.targetAudience.includes(userId)
        ) {
          return true;
        }
        return false;
      });

      setNotifications(relevantNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "alert":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Tất cả Thông báo
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {notifications.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                Không có thông báo nào
              </Typography>
            ) : (
              <List>
                {notifications.map((notif, index) => (
                  <Box key={notif.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography variant="h6">{notif.title}</Typography>
                            <Chip
                              label={notif.type}
                              color={getTypeColor(notif.type) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {notif.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {notif.createdAt
                                ? new Date(notif.createdAt).toLocaleString(
                                    "vi-VN"
                                  )
                                : "-"}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
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
