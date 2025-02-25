import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    console.log("Début de l'inscription");
    const body = await req.json();
    console.log("Body reçu:", body);
    
    const { name, email, password } = registerSchema.parse(body);
    console.log("Données validées");

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    console.log("Vérification email existant:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10);
    console.log("Mot de passe hashé");

    // Créer l'utilisateur
    console.log("Tentative de création de l'utilisateur");
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("Utilisateur créé:", user);

    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données d'inscription invalides" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
} 