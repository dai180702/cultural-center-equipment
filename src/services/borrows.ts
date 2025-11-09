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

  // Cập nhật thiết bị: chuyển từ kho sang đang sử dụng
  // Thiết bị từ warehouse sẽ được cập nhật: assignedTo = borrowerId, location = department của borrower
  try {
    // Kiểm tra xem thiết bị có trong warehouse không
    const { getWarehouseDeviceById } = await import("./warehouse");
    const warehouseDevice = await getWarehouseDeviceById(data.deviceId);

    if (warehouseDevice) {
      // Thiết bị đang ở warehouse, cập nhật assignedTo và location
      const warehouseRef = doc(db, "warehouse", data.deviceId);
      await updateDoc(warehouseRef, {
        assignedTo: data.borrowerId,
        location: data.department || warehouseDevice.location || "Đang sử dụng",
        updatedAt: now,
        updatedBy: userId,
        updatedByName: userName,
      } as any);
    } else {
      // Thiết bị có thể đã ở trong devices collection, cập nhật assignedTo
      const deviceRef = doc(db, "devices", data.deviceId);
      await updateDoc(deviceRef, {
        assignedTo: data.borrowerId,
        updatedAt: now,
        updatedBy: userId,
        updatedByName: userName,
      } as any);
    }
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

  // Lấy deviceId để trả thiết bị về kho khi trả
  try {
    const snap = await getDoc(ref);
    const data = snap.data() as any;
    const deviceId = data?.deviceId as string | undefined;
    if (deviceId) {
      // Kiểm tra xem thiết bị có trong warehouse không
      const { getWarehouseDeviceById } = await import("./warehouse");
      const warehouseDevice = await getWarehouseDeviceById(deviceId);

      if (warehouseDevice) {
        // Thiết bị đang ở warehouse, cập nhật về trạng thái kho (assignedTo = null, location = "Kho")
        const warehouseRef = doc(db, "warehouse", deviceId);
        await updateDoc(warehouseRef, {
          assignedTo: null,
          location: "Kho",
          updatedAt: now,
          updatedBy: userId,
          updatedByName: userName,
        } as any);
      } else {
        // Thiết bị có thể đang ở devices collection, cập nhật assignedTo = null
        const deviceRef = doc(db, "devices", deviceId);
        await updateDoc(deviceRef, {
          assignedTo: null,
          updatedAt: now,
          updatedBy: userId,
          updatedByName: userName,
        } as any);
      }
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

// Kiểm tra xem thiết bị có đang được mượn trong khoảng thời gian yêu cầu không
export const checkDeviceAvailability = async (
  deviceId: string,
  requestBorrowDate: Date,
  requestExpectedReturnDate?: Date
): Promise<{
  available: boolean;
  conflictRecord?: BorrowRecord;
  message?: string;
}> => {
  try {
    // Kiểm tra xem thiết bị có đang ở kho và sẵn sàng để mượn không
    const { getWarehouseDeviceById } = await import("./warehouse");
    const warehouseDevice = await getWarehouseDeviceById(deviceId);

    if (!warehouseDevice) {
      return {
        available: false,
        message:
          "Thiết bị không có trong kho. Chỉ có thể mượn thiết bị từ kho.",
      };
    }

    // Kiểm tra thiết bị có đang được assignedTo ai không
    if (warehouseDevice.assignedTo) {
      return {
        available: false,
        message:
          "Thiết bị đang được sử dụng bởi người khác. Vui lòng chọn thiết bị khác.",
      };
    }

    // Kiểm tra thiết bị có status active không
    if (warehouseDevice.status !== "active") {
      return {
        available: false,
        message: `Thiết bị đang ở trạng thái "${warehouseDevice.status}". Chỉ có thể mượn thiết bị đang hoạt động.`,
      };
    }

    // Kiểm tra xem có phiếu mượn nào đang active không
    const q1 = query(
      collection(db, "borrowRecords"),
      where("deviceId", "==", deviceId),
      where("status", "==", "borrowed")
    );
    const q2 = query(
      collection(db, "borrowRecords"),
      where("deviceId", "==", deviceId),
      where("status", "==", "overdue")
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Combine results
    const allDocs = [...snap1.docs, ...snap2.docs];

    if (allDocs.length === 0) {
      return { available: true };
    }

    // Kiểm tra từng phiếu mượn xem có overlap không
    for (const docSnap of allDocs) {
      const record = {
        id: docSnap.id,
        ...(docSnap.data() as any),
      } as BorrowRecord;

      // Convert Firestore timestamps to Date
      const recordBorrowDate =
        record.borrowDate instanceof Date
          ? record.borrowDate
          : (record.borrowDate as any)?.toDate?.() ||
            new Date(record.borrowDate);

      const recordReturnDate = record.returnDate
        ? record.returnDate instanceof Date
          ? record.returnDate
          : (record.returnDate as any)?.toDate?.() ||
            new Date(record.returnDate)
        : null;

      const recordExpectedReturnDate = record.expectedReturnDate
        ? record.expectedReturnDate instanceof Date
          ? record.expectedReturnDate
          : (record.expectedReturnDate as any)?.toDate?.() ||
            new Date(record.expectedReturnDate)
        : null;

      // Nếu phiếu mượn đã được trả thì bỏ qua
      if (recordReturnDate) {
        continue;
      }

      // Xác định ngày kết thúc của phiếu mượn hiện tại
      // Nếu có expectedReturnDate thì dùng nó, nếu không thì coi như vô thời hạn
      const recordEndDate = recordExpectedReturnDate || null;

      // Xác định ngày kết thúc của yêu cầu mượn mới
      const requestEndDate = requestExpectedReturnDate || null;

      // Case 1: Nếu phiếu mượn hiện tại không có ngày kết thúc (vô thời hạn)
      if (!recordEndDate) {
        // Nếu thiết bị đang được mượn vô thời hạn, không cho mượn mới
        return {
          available: false,
          conflictRecord: record,
          message: `Thiết bị đang được mượn bởi ${
            record.borrowerName || "người khác"
          } từ ${recordBorrowDate.toLocaleDateString(
            "vi-VN"
          )} (chưa có ngày trả dự kiến). Vui lòng chọn thiết bị khác hoặc đợi thiết bị được trả.`,
        };
      }

      // Case 2: Nếu yêu cầu mượn mới không có ngày kết thúc (vô thời hạn)
      if (!requestEndDate) {
        // Nếu yêu cầu mượn vô thời hạn, thì không được conflict với bất kỳ phiếu mượn nào đang active
        // Kiểm tra xem ngày mượn yêu cầu có nằm trong khoảng thời gian đang mượn không
        if (
          requestBorrowDate >= recordBorrowDate &&
          requestBorrowDate <= recordEndDate
        ) {
          return {
            available: false,
            conflictRecord: record,
            message: `Thiết bị đang được mượn bởi ${
              record.borrowerName || "người khác"
            } từ ${recordBorrowDate.toLocaleDateString(
              "vi-VN"
            )} đến ${recordEndDate.toLocaleDateString(
              "vi-VN"
            )}. Vui lòng chọn ngày mượn sau ${recordEndDate.toLocaleDateString(
              "vi-VN"
            )} hoặc nhập ngày trả dự kiến.`,
          };
        }
        // Nếu ngày mượn yêu cầu sau ngày kết thúc của phiếu mượn hiện tại, thì tiếp tục kiểm tra các phiếu khác
        // (có thể có nhiều phiếu mượn)
        continue;
      }

      // Case 3: Cả 2 đều có ngày kết thúc - Kiểm tra overlap giữa 2 khoảng thời gian
      // Overlap xảy ra khi:
      // - requestBorrowDate nằm trong khoảng [recordBorrowDate, recordEndDate]
      // - requestEndDate nằm trong khoảng [recordBorrowDate, recordEndDate]
      // - requestBorrowDate < recordBorrowDate và requestEndDate > recordEndDate
      const hasOverlap =
        (requestBorrowDate >= recordBorrowDate &&
          requestBorrowDate <= recordEndDate) ||
        (requestEndDate >= recordBorrowDate &&
          requestEndDate <= recordEndDate) ||
        (requestBorrowDate <= recordBorrowDate &&
          requestEndDate >= recordEndDate);

      if (hasOverlap) {
        return {
          available: false,
          conflictRecord: record,
          message: `Thiết bị đang được mượn bởi ${
            record.borrowerName || "người khác"
          } từ ${recordBorrowDate.toLocaleDateString(
            "vi-VN"
          )} đến ${recordEndDate.toLocaleDateString(
            "vi-VN"
          )}. Vui lòng chọn khoảng thời gian khác (sau ${recordEndDate.toLocaleDateString(
            "vi-VN"
          )}).`,
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking device availability:", error);
    throw new Error("Không thể kiểm tra tình trạng thiết bị");
  }
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
