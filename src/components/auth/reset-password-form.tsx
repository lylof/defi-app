"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Schéma de validation
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsVerifying(true);
        
        const response = await fetch("/api/auth/reset-password/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok && result.valid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          toast.error("Le lien de réinitialisation est invalide ou a expiré");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setIsTokenValid(false);
        toast.error("Une erreur est survenue lors de la vérification du lien");
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setIsTokenValid(false);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/auth/reset-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      setResetSuccess(true);
      toast.success("Votre mot de passe a été réinitialisé avec succès");
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      toast.error("Une erreur est survenue lors de la réinitialisation du mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Vérification du lien de réinitialisation...</span>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-red-600">Lien invalide</h2>
        <p className="text-center text-gray-600">
          Le lien de réinitialisation est invalide ou a expiré.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/forgot-password")}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center text-green-600">Mot de passe réinitialisé</h2>
        <p className="text-center text-gray-600">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <p className="text-center text-gray-600">
          Vous allez être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
      <h2 className="text-2xl font-semibold text-center">Réinitialiser votre mot de passe</h2>
      <p className="text-center text-gray-600">
        Veuillez entrer votre nouveau mot de passe.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md"
            {...register("password")}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md"
            {...register("confirmPassword")}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>
      </form>
    </div>
  );
} 