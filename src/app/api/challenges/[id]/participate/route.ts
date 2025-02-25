import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier si le défi existe
    const challenge = await db.challenge.findUnique({
      where: { id: params.id },
      include: {
        participations: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Défi non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le défi est actif
    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return NextResponse.json(
        { error: "Le défi n'est plus disponible" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur participe déjà
    if (challenge.participations.length > 0) {
      return NextResponse.json(
        { error: "Vous participez déjà à ce défi" },
        { status: 400 }
      );
    }

    // Créer la participation
    const participation = await db.challengeParticipation.create({
      data: {
        userId: session.user.id,
        challengeId: params.id,
      },
    });

    // Incrémenter le nombre de participants
    await db.challenge.update({
      where: { id: params.id },
      data: {
        participants: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(
      { message: "Participation enregistrée" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la participation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 