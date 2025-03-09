import { NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/auth/services/password-reset-service";
import { EmailService } from "@/lib/email/email-service";
import { z } from "zod";

// Schéma de validation pour la demande
const requestSchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(req: Request) {
  try {
    // Extraire et valider les données
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { email } = validationResult.data;
    
    // Générer un token de réinitialisation
    const token = await PasswordResetService.generateResetToken(email);
    
    // Si l'email existe, envoyer un email de réinitialisation
    if (token) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password`;
      
      await EmailService.sendPasswordResetEmail(email, token, resetUrl);
    }
    
    // Toujours retourner un succès, même si l'email n'existe pas (pour des raisons de sécurité)
    return NextResponse.json({
      success: true,
      message: "Si l'adresse email existe, un email de réinitialisation a été envoyé."
    });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
} 