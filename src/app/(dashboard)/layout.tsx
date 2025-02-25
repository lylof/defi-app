import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8">{children}</div>
      </div>
    </AuthProvider>
  );
} 