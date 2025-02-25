import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { badgeService } from "@/lib/badges/badge-service";

const badgeSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  image: z.string().url(),
  condition: z.string(),
  points: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = badgeSchema.parse(body);

    const badge = await db.badge.create({
      data,
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du badge:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const badges = await db.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" }
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Erreur lors de la récupération des badges:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 