"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/navbar";
import { BadgeNotificationProvider } from "@/components/badges/badge-notification-provider";
import { AuthStatusNotification } from "@/components/ui/auth-status-notification";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

/**
 * Composant pour centraliser les providers de l'application
 * Inclut le provider de session pour NextAuth et le provider de thème
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Appeler la route API pour initialiser les comptes uniquement côté client
    const initAccounts = async () => {
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_INITIALIZE_ACCOUNTS === 'true') {
        try {
          console.log("Appel de l'API d'initialisation des comptes...");
          const response = await fetch('/api/init-accounts');
          const data = await response.json();
          console.log("Résultat de l'initialisation des comptes:", data);
        } catch (error) {
          console.error("Erreur lors de l'appel à l'API d'initialisation:", error);
        }
      }
    };

    // Déclencher l'initialisation
    initAccounts();
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <BadgeNotificationProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster />
            <AuthStatusNotification />
          </div>
        </BadgeNotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 