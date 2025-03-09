"use client";

import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { BadgeNotificationProvider } from "@/components/badges/badge-notification-provider";
import { AuthStatusNotification } from "@/components/ui/auth-status-notification";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BadgeNotificationProvider>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster />
          <AuthStatusNotification />
        </div>
      </BadgeNotificationProvider>
    </SessionProvider>
  );
} 