import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la création de catégorie
const categorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

// GET /api/categories - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Créer une nouvelle catégorie
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
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Données invalides", errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Une catégorie avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "CREATE_CATEGORY",
        targetId: category.id,
        details: `Création de la catégorie "${name}"`,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
} 