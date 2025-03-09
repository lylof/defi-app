import { NextResponse } from "next/server";
import { EmailVerificationService } from "@/lib/auth/services/email-verification-service";
import { EmailService } from "@/lib/email/email-service";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schéma de validation pour la demande
const requestSchema = z.object({
  email: z.string().email("Email invalide").optional(),
});

export async function POST(req: Request) {
  try {
    // Vérifier si l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    
    // Extraire et valider les données
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Utiliser l'email de la session si disponible, sinon utiliser celui fourni dans la requête
    const email = session?.user?.email || validationResult.data.email;
    
    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }
    
    // Générer un token de vérification
    const token = await EmailVerificationService.generateVerificationToken(email);
    
    // Si l'email existe et n'est pas déjà vérifié, envoyer un email de vérification
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${baseUrl}/auth/verify-email`;
      
      await EmailService.sendEmailVerificationEmail(email, token, verificationUrl);
    }
    
    // Toujours retourner un succès, même si l'email n'existe pas ou est déjà vérifié (pour des raisons de sécurité)
    return NextResponse.json({
      success: true,
      message: "Si l'adresse email existe et n'est pas déjà vérifiée, un email de vérification a été envoyé."
    });
  } catch (error) {
    console.error("Erreur lors de la demande de vérification d'email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la demande de vérification d'email" },
      { status: 500 }
    );
  }
} 