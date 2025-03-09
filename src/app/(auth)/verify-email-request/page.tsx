import { Metadata } from "next";
import { EmailVerificationRequestForm } from "@/components/auth/email-verification-request-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vérification d'email | LPT Défis",
  description: "Vérifiez votre adresse email",
};

export default function VerifyEmailRequestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">LPT Défis</h1>
          <p className="mt-2 text-gray-600">
            Vérifiez votre adresse email
          </p>
        </div>

        <EmailVerificationRequestForm />

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