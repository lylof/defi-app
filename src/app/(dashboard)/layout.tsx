"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        {!isAdminPath && <Sidebar />}
        <div className={`flex-1 ${!isAdminPath ? 'p-8' : 'p-0'}`}>{children}</div>
      </div>
    </AuthProvider>
  );
} 