"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page de déconnexion
 * Déconnecte automatiquement l'utilisateur et redirige vers la page de connexion
 */
export default function LogoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour gérer la déconnexion
    const handleLogout = async () => {
      try {
        // Attendre un court délai pour permettre au composant de se monter complètement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Déconnecter l'utilisateur et rediriger vers la page de connexion
        await signOut({ redirect: true, callbackUrl: "/login" });
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        setError("Une erreur est survenue lors de la déconnexion. Veuillez réessayer.");
        setIsLoading(false);
      }
    };

    // Exécuter la déconnexion au chargement de la page
    handleLogout();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Déconnexion</CardTitle>
          <CardDescription className="text-center">
            {error ? error : "Déconnexion en cours..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isLoading && !error ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Veuillez patienter pendant que nous vous déconnectons...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.href = "/login"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                Aller à la page de connexion
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 