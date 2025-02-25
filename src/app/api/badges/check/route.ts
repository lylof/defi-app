import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { badgeService } from "@/lib/badges/badge-service";
import { db } from "@/lib/db";

export async function POST() {
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

    const newBadges = await badgeService.checkAndAwardBadges(user.id);
    
    if (newBadges.length > 0) {
      // Mettre à jour les points de l'utilisateur
      const badgesData = await db.badge.findMany({
        where: { name: { in: newBadges } },
        select: { points: true }
      });
      
      const totalPoints = badgesData.reduce((sum, badge) => sum + badge.points, 0);
      
      await db.user.update({
        where: { id: user.id },
        data: { points: { increment: totalPoints } }
      });

      // Mettre à jour le classement
      await db.leaderboard.upsert({
        where: { userId: user.id },
        create: { userId: user.id, points: totalPoints },
        update: { points: { increment: totalPoints } }
      });
    }

    return NextResponse.json(newBadges);
  } catch (error) {
    console.error("Erreur lors de la vérification des badges:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 