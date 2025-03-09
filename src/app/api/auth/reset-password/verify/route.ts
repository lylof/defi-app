import { NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/auth/services/password-reset-service";
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
    
    // Vérifier le token
    const email = await PasswordResetService.verifyToken(token);
    
    if (!email) {
      return NextResponse.json(
        { valid: false, message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      valid: true,
      email: email,
      message: "Token valide"
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification du token" },
      { status: 500 }
    );
  }
} 