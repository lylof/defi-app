import { NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/auth/services/password-reset-service";
import { z } from "zod";

// Schéma de validation pour la réinitialisation
const resetSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    // Extraire et valider les données
    const body = await req.json();
    const validationResult = resetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { token, password } = validationResult.data;
    
    // Réinitialiser le mot de passe
    const success = await PasswordResetService.resetPassword(token, password);
    
    if (!success) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
} 