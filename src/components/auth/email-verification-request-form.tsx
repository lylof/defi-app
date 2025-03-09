"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

// Schéma de validation
const emailVerificationSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide").optional(),
});

type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;

export function EmailVerificationRequestForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: session?.user?.email || "",
    },
  });

  const onSubmit = async (data: EmailVerificationFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/auth/verify-email/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      setEmailSent(true);
      toast.success("Si l'adresse email existe et n'est pas déjà vérifiée, un email de vérification a été envoyé.");
    } catch (error) {
      console.error("Erreur lors de la demande de vérification d'email:", error);
      toast.error("Une erreur est survenue lors de la demande de vérification d'email");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center">Email envoyé</h2>
        <p className="text-center text-gray-600">
          Si l'adresse email existe dans notre système et n'est pas déjà vérifiée, vous recevrez un email avec les instructions pour vérifier votre adresse email.
        </p>
        <p className="text-center text-gray-600">
          Veuillez vérifier votre boîte de réception et vos spams.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
      <h2 className="text-2xl font-semibold text-center">Vérification d'email</h2>
      <p className="text-center text-gray-600">
        {session?.user?.email 
          ? "Cliquez sur le bouton ci-dessous pour recevoir un email de vérification."
          : "Entrez votre adresse email pour recevoir un email de vérification."}
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!session?.user?.email && (
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              className="w-full p-2 border border-gray-300 rounded-md"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            "Envoyer l'email de vérification"
          )}
        </button>
      </form>
    </div>
  );
} 