import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LevelService } from "@/lib/levels/level-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const progress = await LevelService.getUserProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json(
        { error: "Montant d'expérience invalide" },
        { status: 400 }
      );
    }

    await LevelService.addExperience(session.user.id, amount);
    const progress = await LevelService.getUserProgress(session.user.id);

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Erreur lors de l'ajout d'expérience:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 