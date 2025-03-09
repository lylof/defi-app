import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { EvaluationService } from "@/lib/submissions/evaluation-service";
import * as z from "zod";

// Schéma de validation pour l'évaluation d'un critère
const criterionEvaluationSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0).max(10),
  comment: z.string().optional(),
});

// Schéma de validation pour l'évaluation d'une soumission
const evaluationSchema = z.object({
  criteriaEvaluations: z.array(criterionEvaluationSchema),
  approvalThreshold: z.number().min(0).max(100).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { criteriaEvaluations, approvalThreshold } = evaluationSchema.parse(body);

    // Évaluer la soumission
    const result = await EvaluationService.evaluateSubmission(
      params.id,
      session.user.id,
      criteriaEvaluations,
      approvalThreshold
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de l'évaluation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'évaluation", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // Récupérer les évaluations de la soumission
    const evaluations = await EvaluationService.getSubmissionEvaluations(params.id);

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des évaluations", message: (error as Error).message },
      { status: 500 }
    );
  }
} 