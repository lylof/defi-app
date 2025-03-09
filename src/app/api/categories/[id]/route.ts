import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la mise à jour de catégorie
const categorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

// GET /api/categories/[id] - Récupérer une catégorie spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        challenges: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération de la catégorie" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
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

    // Vérifier si une autre catégorie avec le même nom existe déjà
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: params.id },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { message: "Une catégorie avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_CATEGORY",
        targetId: params.id,
        details: `Mise à jour de la catégorie "${name}"`,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        challenges: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la catégorie est utilisée par des défis
    if (category.challenges.length > 0) {
      return NextResponse.json(
        { message: "Impossible de supprimer une catégorie utilisée par des défis" },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: params.id },
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_CATEGORY",
        targetId: params.id,
        details: `Suppression de la catégorie "${category.name}"`,
      },
    });

    return NextResponse.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
} 