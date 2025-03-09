import { NextResponse } from "next/server";
import { EmailVerificationService } from "@/lib/auth/services/email-verification-service";
import { z } from "zod";

// Schéma de validation pour la vérification
const verifySchema = z.object({
  token: z.string().min(1, "Token requis"),
});

export async function POST(req: Request) {
  try {
    // Extraire et valider les données
    const body = await req.json();
    const validationResult = verifySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { token } = validationResult.data;
    
    // Vérifier l'email
    const success = await EmailVerificationService.verifyEmail(token);
    
    if (!success) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Adresse email vérifiée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification de l'email" },
      { status: 500 }
    );
  }
} 