import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FileUploadService } from "@/lib/uploads/file-upload-service";

// Schéma de validation pour la soumission
const submissionSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  repositoryUrl: z.string().url("L'URL doit être valide").optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les données du formulaire
    const formData = await req.formData();
    const description = formData.get("description") as string;
    const repositoryUrl = formData.get("repositoryUrl") as string | null;
    const files = formData.getAll("files") as File[];

    // Valider les données
    const validatedData = submissionSchema.parse({
      description,
      repositoryUrl: repositoryUrl || undefined,
    });

    // Récupérer le défi
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        participations: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Défi non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur participe au défi
    const hasParticipated = challenge.participations.length > 0;

    if (!hasParticipated) {
      return NextResponse.json(
        { error: "Vous ne participez pas à ce défi" },
        { status: 400 }
      );
    }

    // Gérer les fichiers
    const uploadedFiles = [];
    if (files.length > 0) {
      // Utiliser le service d'upload de fichiers pour valider et télécharger les fichiers
      const uploadResults = await FileUploadService.uploadMultipleFiles(
        files,
        session.user.id,
        `submissions/${params.id}`,
        { 
          category: "any", 
          maxSize: 20 * 1024 * 1024 // 20MB max par fichier
        }
      );

      // Vérifier si tous les uploads ont réussi
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        return NextResponse.json(
          { 
            error: "Certains fichiers n'ont pas pu être téléchargés", 
            details: failedUploads.map(f => f.error)
          },
          { status: 400 }
        );
      }

      // Ajouter les fichiers téléchargés à la liste
      uploadedFiles.push(...uploadResults.map(result => ({
        name: result.fileName,
        path: result.publicUrl,
        size: result.fileSize,
        type: result.fileType
      })));
    }

    // Mettre à jour la participation
    const participation = await prisma.challengeParticipation.update({
      where: {
        id: challenge.participations[0].id,
      },
      data: {
        submitted: true,
        submission: JSON.stringify({
          description: validatedData.description,
          repositoryUrl: validatedData.repositoryUrl,
          files: uploadedFiles,
          submittedAt: new Date(),
        }),
      },
    });

    return NextResponse.json(
      { message: "Solution soumise avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la soumission:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la soumission" },
      { status: 500 }
    );
  }
} 