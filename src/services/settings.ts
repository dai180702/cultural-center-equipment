import { db } from "@/firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const SETTINGS_DOC_ID = "global";

export type AppSettings = {
  actionPassword?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export async function getAppSettings(): Promise<AppSettings | null> {
  const ref = doc(db, "settings", SETTINGS_DOC_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as AppSettings;
}

export async function setActionPassword(
  newPassword: string,
  updatedBy?: string
) {
  const ref = doc(db, "settings", SETTINGS_DOC_ID);
  const now = new Date().toISOString();
  const payload: AppSettings = {
    actionPassword: newPassword,
    updatedAt: now,
    updatedBy,
  };
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, payload as any);
  } else {
    await setDoc(ref, payload as any);
  }
}
