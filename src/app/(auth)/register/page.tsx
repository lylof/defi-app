"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue");
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      setError("Une erreur est survenue lors de l'inscription");
    }
  };

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">LPT Défis</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Rejoignez notre communauté et relevez des défis passionnants pour améliorer vos compétences.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos informations pour créer votre compte
            </p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name">Nom</label>
                  <input
                    {...register("name")}
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-2 border rounded"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email">Email</label>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    className="w-full p-2 border rounded"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    {...register("password")}
                    id="password"
                    type="password"
                    className="w-full p-2 border rounded"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type="password"
                    className="w-full p-2 border rounded"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link 
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 