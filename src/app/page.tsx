"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeRedirect() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.replace("/dashboard"); // Trang chính trong (app)
    } else {
      router.replace("/login");
    }
  }, [currentUser]);

  return null;
}
