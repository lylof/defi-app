import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, bio } = updateProfileSchema.parse(body);

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le profil
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        bio,
      },
      select: {
        name: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
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