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

export interface BorrowRecord {
  id?: string;
  deviceId: string;
  deviceCode?: string;
  deviceName?: string;
  borrowerId: string; // uid người mượn
  borrowerName?: string; // tên/email hiển thị
  department?: string; // phòng ban mượn
  purpose?: string; // mục đích mượn
  borrowDate: Date; // thời điểm mượn
  expectedReturnDate?: Date; // dự kiến trả
  returnDate?: Date; // thực tế trả
  status: "borrowed" | "returned" | "overdue";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // uid người tạo phiếu
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
}

// Dữ liệu form khi tạo/cập nhật phiếu mượn
export interface BorrowFormData {
  deviceId: string;
  deviceCode?: string;
  deviceName?: string;
  borrowerId: string;
  borrowerName?: string;
  department?: string;
  purpose?: string;
  borrowDate: string | Date;
  expectedReturnDate?: string | Date;
  notes?: string;
}

// Tạo phiếu mượn mới
export const addBorrowRecord = async (
  data: BorrowFormData,
  userId: string,
  userName?: string
): Promise<string> => {
  const toDate = (v?: string | Date) =>
    typeof v === "string" ? new Date(v) : v || undefined;

  const now = new Date();
  const payload: Omit<BorrowRecord, "id"> = {
    deviceId: data.deviceId,
    deviceCode: data.deviceCode,
    deviceName: data.deviceName,
    borrowerId: data.borrowerId,
    borrowerName: data.borrowerName,
    department: data.department,
    purpose: data.purpose,
    borrowDate: toDate(data.borrowDate)!,
    expectedReturnDate: toDate(data.expectedReturnDate),
    status: "borrowed",
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    createdByName: userName,
  };

  const docRef = await addDoc(collection(db, "borrowRecords"), payload);
  // Cập nhật thiết bị: gán assignedTo cho borrower
  try {
    const deviceRef = doc(db, "devices", data.deviceId);
    await updateDoc(deviceRef, {
      assignedTo: data.borrowerId,
      updatedAt: now,
      updatedBy: userId,
      updatedByName: userName,
    } as any);
  } catch (e) {
    // không chặn tạo phiếu nếu cập nhật thiết bị lỗi, chỉ log
    console.error("Failed to update device after borrow", e);
  }
  return docRef.id;
};

// Trả thiết bị (cập nhật phiếu mượn về returned)
export const returnBorrowRecord = async (
  id: string,
  userId?: string,
  userName?: string
): Promise<void> => {
  const ref = doc(db, "borrowRecords", id);
  const now = new Date();
  await updateDoc(ref, {
    status: "returned",
    returnDate: now,
    updatedAt: now,
    updatedBy: userId,
    updatedByName: userName,
  } as any);

  // Lấy deviceId để bỏ gán assignedTo khi trả
  try {
    const snap = await getDoc(ref);
    const data = snap.data() as any;
    const deviceId = data?.deviceId as string | undefined;
    if (deviceId) {
      const deviceRef = doc(db, "devices", deviceId);
      await updateDoc(deviceRef, {
        assignedTo: null,
        updatedAt: now,
        updatedBy: userId,
        updatedByName: userName,
      } as any);
    }
  } catch (e) {
    console.error("Failed to update device after return", e);
  }
};

// Lấy danh sách phiếu mượn (mặc định mới nhất)
export const getBorrowRecords = async (): Promise<BorrowRecord[]> => {
  const q = query(
    collection(db, "borrowRecords"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as BorrowRecord[];
};

// Lấy phiếu mượn theo thiết bị
export const getBorrowRecordsByDevice = async (
  deviceId: string
): Promise<BorrowRecord[]> => {
  const q = query(
    collection(db, "borrowRecords"),
    where("deviceId", "==", deviceId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as BorrowRecord[];
};

// Lấy phiếu mượn đang mượn (chưa trả)
export const getActiveBorrowByDevice = async (
  deviceId: string
): Promise<BorrowRecord | null> => {
  const q = query(
    collection(db, "borrowRecords"),
    where("deviceId", "==", deviceId),
    where("status", "==", "borrowed")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as BorrowRecord;
};

// Xóa phiếu mượn (nếu cần)
export const deleteBorrowRecord = async (id: string): Promise<void> => {
  const ref = doc(db, "borrowRecords", id);
  await deleteDoc(ref);
};

// Phân trang danh sách phiếu mượn
export const getBorrowRecordsWithPagination = async (
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  records: BorrowRecord[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  let q = query(
    collection(db, "borrowRecords"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as BorrowRecord[];
  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  return { records, lastDoc: lastVisible };
};
