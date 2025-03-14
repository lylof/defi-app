"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/auth/logout-button";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Vérifier si l'utilisateur est sur une page admin
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Déterminer les liens en fonction du contexte (admin ou standard)
  const profileLink = session?.user.role === "ADMIN" 
    ? "/admin/profile" 
    : "/profile";
    
  // Classes pour les liens de navigation
  const linkClass = "text-sm font-medium transition-colors hover:text-primary";
  const adminLinkClass = `${linkClass} ${isAdminPage ? 'text-primary' : ''}`;

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          {/* Le logo redirige vers l'accueil admin pour les admins dans le contexte admin */}
          <Link 
            href={session?.user.role === "ADMIN" && isAdminPage ? "/admin" : "/"} 
            className="text-xl font-bold"
          >
            LPT Défis
            {session?.user.role === "ADMIN" && isAdminPage && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                Administration
              </span>
            )}
          </Link>
          
          {/* Liens standard pour utilisateurs non-admin ou admin hors contexte admin */}
          {session && (!session.user.role || session.user.role !== "ADMIN" || !isAdminPage) && (
            <>
              <Link
                href="/challenges"
                className={linkClass}
              >
                Défis
              </Link>
              <Link
                href="/leaderboard"
                className={linkClass}
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
              
              {/* Lien de profil adapté au contexte (admin ou standard) */}
              <Link
                href={profileLink}
                className={session.user.role === "ADMIN" && isAdminPage ? adminLinkClass : linkClass}
              >
                {session.user.name || "Mon profil"}
              </Link>
              
              {/* Liens spécifiques aux administrateurs */}
              {session.user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/submissions"
                    className={adminLinkClass}
                  >
                    Évaluation
                  </Link>
                  <Link
                    href="/admin"
                    className={adminLinkClass}
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
                className={linkClass}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className={linkClass}
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