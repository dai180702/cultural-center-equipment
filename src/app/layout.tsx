import ClientThemeProvider from "@/components/clientThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
// import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientThemeProvider>
            {children}
            {/* <AuthGuard>{children}</AuthGuard> */}
          </ClientThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
