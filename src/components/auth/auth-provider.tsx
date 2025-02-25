"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
} 