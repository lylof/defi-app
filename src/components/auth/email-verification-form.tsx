"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface EmailVerificationFormProps {
  token: string;
}

export function EmailVerificationForm({ token }: EmailVerificationFormProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  // Vérifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsVerifying(true);
        setError(null);
        
        const response = await fetch("/api/auth/verify-email/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Une erreur est survenue");
        }

        setIsVerified(true);
        toast.success("Votre adresse email a été vérifiée avec succès");
        
        // Mettre à jour la session pour refléter que l'email est vérifié
        await update();
        
        // Rediriger vers le tableau de bord après 3 secondes
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'email:", error);
        setError("Le lien de vérification est invalide ou a expiré");
        toast.error("Une erreur est survenue lors de la vérification de l'email");
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setError("Token manquant");
    }
  }, [token, router, update]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p>Vérification de votre adresse email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-red-600">Erreur de vérification</h2>
        <p className="text-center text-gray-600">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/auth/verify-email-request")}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-green-600">Email vérifié</h2>
        <p className="text-center text-gray-600">
          Votre adresse email a été vérifiée avec succès.
        </p>
        <p className="text-center text-gray-600">
          Vous allez être redirigé vers votre tableau de bord...
        </p>
      </div>
    );
  }

  return null;
} 