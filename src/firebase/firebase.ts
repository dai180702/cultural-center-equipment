import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBX2sfeOq4-exaM8XxoQ7llrLA_jpu7Eo0",
  authDomain: "cultural-center-equipment.firebaseapp.com",
  projectId: "cultural-center-equipment",
  storageBucket: "cultural-center-equipment.firebasestorage.app",
  messagingSenderId: "841413614666",
  appId: "1:841413614666:web:3ba932c370edecb83edab3",
  measurementId: "G-DW503JRBP3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getSecondaryAuth = () => {
  const secondaryName = "secondary";
  const secondaryApp = getApps().find((a) => a.name === secondaryName)
    ? getApp(secondaryName)
    : initializeApp(firebaseConfig, secondaryName);
  return getAuth(secondaryApp);
};


if (process.env.NODE_ENV === "development") {
  // Uncomment these lines if you want to use Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;
