import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

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

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        read: false
      },
      include: {
        badge: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 