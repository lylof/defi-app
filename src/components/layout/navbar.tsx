"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/logout-button";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            LPT Défis
          </Link>
          {session && (
            <>
              <Link
                href="/challenges"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Défis
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Classement
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              <NotificationIndicator />
              
              <Link
                href="/profile"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {session.user.name || "Mon profil"}
              </Link>
              {session.user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/submissions"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Évaluation
                  </Link>
                  <Link
                    href="/admin"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Administration
                  </Link>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 