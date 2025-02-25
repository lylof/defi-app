import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";

const evaluationSchema = z.object({
  approved: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { approved } = evaluationSchema.parse(body);

    // Récupérer la participation
    const participation = await db.challengeParticipation.findUnique({
      where: { id: params.id },
      include: {
        challenge: true,
        user: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Soumission non trouvée" },
        { status: 404 }
      );
    }

    if (!participation.submitted) {
      return NextResponse.json(
        { error: "Cette participation n'a pas encore de soumission" },
        { status: 400 }
      );
    }

    // Mettre à jour la participation
    await db.challengeParticipation.update({
      where: { id: params.id },
      data: {
        evaluated: true,
        approved,
      },
    });

    // Si approuvé, attribuer les points
    if (approved) {
      await db.user.update({
        where: { id: participation.userId },
        data: {
          points: {
            increment: participation.challenge.points,
          },
        },
      });

      // Mettre à jour le classement
      await db.leaderboard.upsert({
        where: { userId: participation.userId },
        create: {
          userId: participation.userId,
          points: participation.challenge.points,
        },
        update: {
          points: {
            increment: participation.challenge.points,
          },
        },
      });
    }

    return NextResponse.json(
      { message: approved ? "Solution approuvée" : "Solution refusée" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'évaluation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'évaluation" },
      { status: 500 }
    );
  }
} 