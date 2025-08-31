// "use client";

// import { useAuth } from "@/contexts/AuthContext";
// import { useRouter } from "next/navigation";
// import { ReactNode, useEffect } from "react";

// interface Props {
//   children: ReactNode;
// }

// export default function AuthGuard({ children }: Props) {
//   const { currentUser } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!currentUser) {
//       router.replace("/login"); // Nếu chưa login thì về /login
//     }
//   }, [currentUser, router]);

//   if (!currentUser) return null; 

//   return <>{children}</>;
// }

