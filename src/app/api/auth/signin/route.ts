import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signJwtAccessToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validation des champs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Vérification du mot de passe
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Création du token JWT
    const { password: _, ...userWithoutPass } = user;
    const accessToken = signJwtAccessToken(userWithoutPass);

    return NextResponse.json(
      {
        user: userWithoutPass,
        accessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
} 