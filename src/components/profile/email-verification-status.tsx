"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";

export function EmailVerificationStatus() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si l'email est vérifié (la propriété peut ne pas être directement accessible dans le type)
  const isEmailVerified = session?.user && (session.user as any).emailVerified;
  const userEmail = session?.user?.email;

  const handleSendVerification = async () => {
    if (!userEmail || isLoading) return;

    try {
      setIsLoading(true);
      
      const response = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi de l'email de vérification");
      }

      alert("Un email de vérification a été envoyé à votre adresse email.");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de l'envoi de l'email de vérification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Mail className="mr-2 h-5 w-5" />
        Statut de vérification d'email
      </h3>
      
      <div className="flex items-center mb-2">
        {isEmailVerified ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Votre email est vérifié</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            <span>Votre email n'est pas vérifié</span>
          </>
        )}
      </div>
      
      {!isEmailVerified && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">
            La vérification de votre email vous permet de récupérer votre compte en cas d'oubli de mot de passe et renforce la sécurité de votre compte.
          </p>
          <button
            onClick={handleSendVerification}
            disabled={isLoading}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Envoi en cours..." : "Envoyer un email de vérification"}
          </button>
        </div>
      )}
    </div>
  );
} 