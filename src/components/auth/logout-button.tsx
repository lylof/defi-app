"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${className}`}
    >
      {isLoading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
} 