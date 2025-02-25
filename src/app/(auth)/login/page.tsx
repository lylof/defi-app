"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setError("Une erreur est survenue");
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
              Participez à des défis passionnants et améliorez vos compétences en développement.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connexion à votre compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez votre email et mot de passe pour vous connecter
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Connexion..." : "Se connecter"}
                </button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link 
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 