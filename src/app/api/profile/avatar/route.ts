import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      );
    }

    // Créer un nom de fichier unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${session.user.email.split("@")[0]}-${Date.now()}.${file.type.split("/")[1]}`;
    const path = join(process.cwd(), "public/avatars", fileName);

    // Sauvegarder le fichier
    await writeFile(path, buffer);

    // Mettre à jour l'URL de l'avatar dans la base de données
    const avatarUrl = `/avatars/${fileName}`;
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        image: avatarUrl,
      },
      select: {
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload" },
      { status: 500 }
    );
  }
} 