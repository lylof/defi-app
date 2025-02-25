import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const challengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  points: z.coerce.number().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const json = await req.json();
    const body = challengeSchema.parse(json);

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Créer le défi avec des dates par défaut
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Par défaut, le défi dure 30 jours

    // Vérifier si la colonne createdById existe
    const hasCreatedById = await checkIfColumnExists('Challenge', 'createdById');

    // Préparer les données pour la création du défi
    const challengeData: any = {
      title: body.title,
      description: body.description,
      brief: body.description.substring(0, 100) + "...", // Créer un résumé automatique
      points: body.points,
      categoryId: body.categoryId,
      startDate: now,
      endDate: endDate,
      participants: 0 // Valeur par défaut
    };

    // Ajouter createdById seulement si la colonne existe
    if (hasCreatedById) {
      challengeData.createdById = session.user.id;
    }

    const challenge = await prisma.challenge.create({
      data: challengeData,
      include: {
        category: true,
      },
    });

    // Créer un log d'administration si possible
    try {
      await prisma.adminLog.create({
        data: {
          action: "CREATE_CHALLENGE",
          details: JSON.stringify({ challengeId: challenge.id, title: challenge.title }),
          adminId: session.user.id,
          targetId: challenge.id,
        }
      });
    } catch (logError) {
      console.error("Erreur lors de la création du log:", logError);
      // On continue même si la création du log échoue
    }

    return NextResponse.json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création du défi:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si la colonne createdById existe
    const hasCreatedById = await checkIfColumnExists('Challenge', 'createdById');

    const challenges = await prisma.challenge.findMany({
      include: {
        category: true,
        participations: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Erreur lors de la récupération des défis:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour vérifier si une colonne existe dans une table
async function checkIfColumnExists(table: string, column: string): Promise<boolean> {
  try {
    // Cette requête est spécifique à PostgreSQL
    const result: any = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = ${table}
        AND column_name = ${column}
      );
    `;
    
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking if column ${column} exists in table ${table}:`, error);
    return false;
  }
} 