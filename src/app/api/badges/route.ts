import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la création de badge
const badgeSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  image: z.string().url().optional().or(z.literal("")),
  points: z.coerce.number().int().min(0),
  condition: z.string().min(5).max(1000),
});

// GET /api/badges - Récupérer tous les badges
export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: {
        points: "desc",
      },
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Erreur lors de la récupération des badges:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}

// POST /api/badges - Créer un nouveau badge
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    // Valider les données
    const body = await request.json();
    const validationResult = badgeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Données invalides", errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, image, points, condition } = validationResult.data;

    // Vérifier si un badge avec le même nom existe déjà
    const existingBadge = await prisma.badge.findFirst({
      where: { name },
    });

    if (existingBadge) {
      return NextResponse.json(
        { message: "Un badge avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    // Créer le badge
    const createData: any = {
      name,
      description,
      points,
      condition,
    };
    
    // Ajouter l'image seulement si elle est définie
    if (image !== undefined) {
      createData.image = image === "" ? null : image;
    }
    
    const badge = await prisma.badge.create({
      data: createData,
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "CREATE_BADGE",
        targetId: badge.id,
        details: `Création du badge "${name}"`,
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du badge:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du badge" },
      { status: 500 }
    );
  }
} 