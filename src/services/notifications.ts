import { db } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "alert";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "director" | "deputy_director" | "manager" | "staff" | "technician" | string[]; // Có thể là "all", role cụ thể, hoặc array UIDs
  isRead?: boolean;
  readBy?: string[]; // Array UIDs của người đã đọc
  relatedDeviceId?: string; // FK → devices.id hoặc warehouse.id
  relatedUserId?: string; // FK → users.uid
  relatedBorrowId?: string; // FK → borrowRecords.id
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // UID người tạo
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface NotificationFormData {
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "alert";
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience?: "all" | "director" | "deputy_director" | "manager" | "staff" | "technician" | string[];
  relatedDeviceId?: string;
  relatedUserId?: string;
  relatedBorrowId?: string;
  expiresAt?: string; // ISO string
}

// Lấy danh sách tất cả thông báo
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const querySnapshot = await getDocs(
      query(notificationsRef, orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate(),
      readBy: doc.data().readBy || [],
    })) as Notification[];
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new Error("Không thể tải danh sách thông báo. Vui lòng thử lại.");
  }
};

// Lấy thông báo với phân trang
export const getNotificationsPaginated = async (
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  notifications: Notification[];
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
}> => {
  try {
    const notificationsRef = collection(db, "notifications");
    let q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    const notifications = (hasMore ? docs.slice(0, pageSize) : docs).map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
        readBy: doc.data().readBy || [],
      })
    ) as Notification[];

    return {
      notifications,
      lastDoc: hasMore ? docs[pageSize - 1] : undefined,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting paginated notifications:", error);
    throw new Error("Không thể tải danh sách thông báo. Vui lòng thử lại.");
  }
};

// Lấy thông báo theo ID
export const getNotificationById = async (
  id: string
): Promise<Notification | null> => {
  try {
    const notificationRef = doc(db, "notifications", id);
    const docSnapshot = await getDoc(notificationRef);
    if (!docSnapshot.exists()) {
      return null;
    }
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate(),
      readBy: data.readBy || [],
    } as Notification;
  } catch (error) {
    console.error("Error getting notification:", error);
    throw new Error("Không thể tải thông tin thông báo. Vui lòng thử lại.");
  }
};

// Lấy thông báo chưa đọc của người dùng
export const getUnreadNotifications = async (
  userId: string,
  userRole?: string
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const allNotifications = await getNotifications();
    
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
      if (typeof notif.targetAudience === "string" && notif.targetAudience === userRole) {
        return true;
      }
      if (Array.isArray(notif.targetAudience) && notif.targetAudience.includes(userId)) {
        return true;
      }
      return false;
    });

    // Lọc thông báo chưa đọc
    return relevantNotifications.filter(
      (notif) => !notif.readBy || !notif.readBy.includes(userId)
    );
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw new Error("Không thể tải thông báo chưa đọc. Vui lòng thử lại.");
  }
};

// Lấy thông báo cảnh báo (alerts)
export const getAlerts = async (): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const querySnapshot = await getDocs(
      query(
        notificationsRef,
        where("type", "==", "alert"),
        orderBy("createdAt", "desc")
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      expiresAt: doc.data().expiresAt?.toDate(),
      readBy: doc.data().readBy || [],
    })) as Notification[];
  } catch (error) {
    console.error("Error getting alerts:", error);
    throw new Error("Không thể tải danh sách cảnh báo. Vui lòng thử lại.");
  }
};

// Thêm thông báo mới
export const addNotification = async (
  notificationData: NotificationFormData,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
    const notification = {
      ...notificationData,
      isRead: false,
      readBy: [],
      expiresAt: notificationData.expiresAt
        ? new Date(notificationData.expiresAt)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      createdByName: userName || "Người dùng",
    };

    const docRef = await addDoc(collection(db, "notifications"), notification);
    return docRef.id;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw new Error("Không thể thêm thông báo. Vui lòng thử lại.");
  }
};

// Cập nhật thông báo
export const updateNotification = async (
  id: string,
  notificationData: Partial<NotificationFormData>,
  userId?: string,
  userName?: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", id);
    const updateData: any = {
      ...notificationData,
      updatedAt: new Date(),
      updatedBy: userId || "Không xác định",
      updatedByName: userName || "Không xác định",
    };

    if (notificationData.expiresAt) {
      updateData.expiresAt = new Date(notificationData.expiresAt);
    }

    await updateDoc(notificationRef, updateData);
  } catch (error) {
    console.error("Error updating notification:", error);
    throw new Error("Không thể cập nhật thông báo. Vui lòng thử lại.");
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    const notification = await getNotificationById(notificationId);
    
    if (!notification) {
      throw new Error("Thông báo không tồn tại.");
    }

    const readBy = notification.readBy || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    await updateDoc(notificationRef, {
      readBy,
      isRead: readBy.length > 0,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.");
  }
};

// Xóa thông báo
export const deleteNotification = async (id: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", id);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error("Không thể xóa thông báo. Vui lòng thử lại.");
  }
};

