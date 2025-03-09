import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour la mise à jour de badge
const badgeSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  image: z.string().url().optional().or(z.literal("")),
  points: z.coerce.number().int().min(0),
  condition: z.string().min(5).max(1000),
});

// GET /api/badges/[id] - Récupérer un badge spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const badge = await prisma.badge.findUnique({
      where: { id: params.id },
    });

    if (!badge) {
      return NextResponse.json(
        { message: "Badge non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error("Erreur lors de la récupération du badge:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du badge" },
      { status: 500 }
    );
  }
}

// PUT /api/badges/[id] - Mettre à jour un badge
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

    // Vérifier si le badge existe
    const existingBadge = await prisma.badge.findUnique({
      where: { id: params.id },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { message: "Badge non trouvé" },
        { status: 404 }
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

    // Vérifier si un autre badge avec le même nom existe déjà
    const duplicateBadge = await prisma.badge.findFirst({
      where: {
        name,
        id: { not: params.id },
      },
    });

    if (duplicateBadge) {
      return NextResponse.json(
        { message: "Un badge avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    // Mettre à jour le badge
    const updateData: any = {
      name,
      description,
      points,
      condition,
    };
    
    // Ajouter l'image seulement si elle est définie
    if (image !== undefined) {
      updateData.image = image === "" ? null : image;
    }
    
    const updatedBadge = await prisma.badge.update({
      where: { id: params.id },
      data: updateData,
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_BADGE",
        targetId: params.id,
        details: `Mise à jour du badge "${name}"`,
      },
    });

    return NextResponse.json(updatedBadge);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du badge" },
      { status: 500 }
    );
  }
}

// DELETE /api/badges/[id] - Supprimer un badge
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

    // Vérifier si le badge existe
    const badge = await prisma.badge.findUnique({
      where: { id: params.id },
      include: {
        users: true,
      },
    });

    if (!badge) {
      return NextResponse.json(
        { message: "Badge non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le badge est attribué à des utilisateurs
    if (badge.users.length > 0) {
      return NextResponse.json(
        { message: "Impossible de supprimer un badge attribué à des utilisateurs" },
        { status: 400 }
      );
    }

    // Supprimer le badge
    await prisma.badge.delete({
      where: { id: params.id },
    });

    // Enregistrer l'action dans les logs d'administration
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_BADGE",
        targetId: params.id,
        details: `Suppression du badge "${badge.name}"`,
      },
    });

    return NextResponse.json({ message: "Badge supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du badge:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du badge" },
      { status: 500 }
    );
  }
} 