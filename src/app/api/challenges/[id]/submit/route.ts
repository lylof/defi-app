import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import * as z from "zod";

const submissionSchema = z.object({
  description: z.string().min(10),
  repositoryUrl: z.string().url().optional(),
});

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

    const formData = await req.formData();
    const description = formData.get("description") as string;
    const repositoryUrl = formData.get("repositoryUrl") as string | null;
    const files = formData.getAll("files") as File[];

    // Valider les données
    const validatedData = submissionSchema.parse({
      description,
      repositoryUrl: repositoryUrl || undefined,
    });

    // Vérifier si le défi existe et est actif
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

    // Vérifier si le défi est toujours actif
    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return NextResponse.json(
        { error: "Le défi n'est plus disponible" },
        { status: 400 }
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
      const uploadDir = join(process.cwd(), "public/submissions", params.id);
      
      for (const file of files) {
        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Les fichiers ne doivent pas dépasser 10MB" },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);
        uploadedFiles.push({
          name: file.name,
          path: `/submissions/${params.id}/${fileName}`,
          size: file.size,
        });
      }
    }

    // Mettre à jour la participation
    const participation = await db.challengeParticipation.update({
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
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la soumission" },
      { status: 500 }
    );
  }
} 