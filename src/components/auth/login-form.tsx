"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(1, {
    message: "Veuillez entrer votre mot de passe.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue lors de la connexion.");
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6" role="region" aria-labelledby="login-heading">
      <div className="space-y-2 text-center">
        <h1 id="login-heading" className="text-2xl font-semibold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-4"
          aria-label="Formulaire de connexion"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  htmlFor="email"
                  className="block text-sm font-medium"
                >
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="vous@exemple.fr"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    aria-required="true"
                    aria-describedby="email-error"
                    {...field}
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Votre mot de passe"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      disabled={isLoading}
                      aria-required="true"
                      aria-describedby="password-error"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-pressed={showPassword}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage id="password-error" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link 
              href="/auth/reset-password" 
              className="text-sm font-medium text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-sm"
            >
              Mot de passe oublié?
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full h-10" 
            disabled={isLoading}
            aria-label="Se connecter à mon compte"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas de compte?{" "}
          <Link 
            href="/auth/register" 
            className="font-medium text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-sm"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
} 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(1, {
    message: "Veuillez entrer votre mot de passe.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue lors de la connexion.");
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6" role="region" aria-labelledby="login-heading">
      <div className="space-y-2 text-center">
        <h1 id="login-heading" className="text-2xl font-semibold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-4"
          aria-label="Formulaire de connexion"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  htmlFor="email"
                  className="block text-sm font-medium"
                >
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="vous@exemple.fr"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    aria-required="true"
                    aria-describedby="email-error"
                    {...field}
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel 
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Votre mot de passe"
                      type={showPassword ? "text" : "password"}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      disabled={isLoading}
                      aria-required="true"
                      aria-describedby="password-error"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-pressed={showPassword}
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage id="password-error" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link 
              href="/auth/reset-password" 
              className="text-sm font-medium text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-sm"
            >
              Mot de passe oublié?
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full h-10" 
            disabled={isLoading}
            aria-label="Se connecter à mon compte"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Vous n&apos;avez pas de compte?{" "}
          <Link 
            href="/auth/register" 
            className="font-medium text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 rounded-sm"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
} 