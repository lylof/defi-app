import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";

const markReadSchema = z.object({
  ids: z.array(z.string())
});

export async function POST(req: Request) {
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

    const body = await req.json();
    const { ids } = markReadSchema.parse(body);

    await db.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.id
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors du marquage des notifications:", error);
    
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