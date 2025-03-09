import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { FileUploadService } from "@/lib/uploads/file-upload-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
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

    // Utiliser le service d'upload de fichiers pour valider et télécharger l'avatar
    const uploadResult = await FileUploadService.uploadFile(
      file,
      session.user.id,
      "avatars",
      { category: "image" }
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    // Mettre à jour l'URL de l'avatar dans la base de données
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: uploadResult.publicUrl,
      },
      select: {
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload de l'avatar" },
      { status: 500 }
    );
  }
} 