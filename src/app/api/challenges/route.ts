import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtAccessToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // Vérification du token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwtAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }

    // Récupération des défis avec leurs catégories
    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
        participations: {
          where: {
            userId: decoded.id
          },
          select: {
            submitted: true,
            submission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Erreur lors de la récupération des défis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des défis" },
      { status: 500 }
    );
  }
} 