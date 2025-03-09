"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Effet pour vérifier l'authentification et éviter les redirections prématurées
  useEffect(() => {
    if (status === "loading") return;
    
    // Vérification de l'authentification
    if (session && session.user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [session, status]);

  // Afficher un indicateur de chargement pendant la vérification de session
  if (status === "loading" || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    // Utiliser le chemin correct pour la page de connexion
    redirect("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
  }

  return <>{children}</>;
} 