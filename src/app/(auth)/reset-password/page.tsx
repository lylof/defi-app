import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réinitialisation de mot de passe | LPT Défis",
  description: "Réinitialisez votre mot de passe",
};

interface PageProps {
  params: Record<string, never>;
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const token = searchParams.token || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">LPT Défis</h1>
          <p className="mt-2 text-gray-600">
            Réinitialisez votre mot de passe
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4 p-6 bg-white/10 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold text-center text-red-600">Token manquant</h2>
            <p className="text-center text-gray-600">
              Le lien de réinitialisation est invalide. Veuillez demander un nouveau lien.
            </p>
            <div className="flex justify-center">
              <Link
                href="/forgot-password"
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Demander un nouveau lien
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
} 