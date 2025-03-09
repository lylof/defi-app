"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Composant de notification pour les erreurs d'authentification
 * S'affiche automatiquement en cas de problème d'authentification
 */
export function AuthStatusNotification() {
  const { data: session, status } = useSession();
  const [showNotification, setShowNotification] = useState(false);
  const [errorType, setErrorType] = useState<"expired" | "invalid" | "disconnected" | null>(null);
  const router = useRouter();

  // Vérifier l'état de la session à chaque changement
  useEffect(() => {
    // Vérifier si la session est en cours de chargement
    if (status === "loading") return;

    // Vérifier si l'utilisateur est déconnecté
    if (status === "unauthenticated") {
      // Ne pas afficher de notification sur les pages d'authentification
      if (window.location.pathname.includes("/login") || 
          window.location.pathname.includes("/register") ||
          window.location.pathname.includes("/logout")) {
        return;
      }
      
      setErrorType("disconnected");
      setShowNotification(true);
      return;
    }

    // Vérifier si la session est authentifiée mais invalide
    if (status === "authenticated" && session) {
      // Vérifier si l'ID utilisateur est manquant
      if (!session.user?.id) {
        setErrorType("invalid");
        setShowNotification(true);
        return;
      }

      // Vérifier si la session a expiré (en comparant la date d'expiration)
      if (session.expires) {
        const expiryDate = new Date(session.expires);
        if (expiryDate < new Date()) {
          setErrorType("expired");
          setShowNotification(true);
          return;
        }
      }
    }

    // Si tout est normal, masquer la notification
    setShowNotification(false);
  }, [session, status]);

  // Gérer la redirection en fonction du type d'erreur
  const handleAction = () => {
    if (errorType === "expired" || errorType === "invalid") {
      router.push("/logout");
    } else {
      router.push("/login");
    }
  };

  // Ne rien afficher si aucune notification n'est nécessaire
  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-5 duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="ml-3 w-full">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium text-red-800">
                {errorType === "expired" && "Session expirée"}
                {errorType === "invalid" && "Session invalide"}
                {errorType === "disconnected" && "Non connecté"}
              </h3>
              <button
                type="button"
                className="inline-flex text-red-500 hover:text-red-700"
                onClick={() => setShowNotification(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-sm text-red-700">
              {errorType === "expired" && "Votre session a expiré. Veuillez vous reconnecter pour continuer."}
              {errorType === "invalid" && "Votre session est invalide. Veuillez vous reconnecter."}
              {errorType === "disconnected" && "Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à cette page."}
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                {errorType === "expired" || errorType === "invalid" 
                  ? "Se reconnecter" 
                  : "Se connecter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 