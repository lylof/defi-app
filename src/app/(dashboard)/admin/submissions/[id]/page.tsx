import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EvaluationDetails } from "@/components/admin/evaluation-details";

/**
 * Page de détail d'une soumission
 * Affiche les informations détaillées d'une soumission et ses évaluations
 * Cette page est accessible uniquement aux administrateurs
 */
export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Vérifier l'authentification et les permissions
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Récupérer la soumission avec toutes ses relations
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      challenge: {
        include: {
          category: true,
          evaluationCriteria: true,
        },
      },
      evaluations: {
        include: {
          criterion: true,
          evaluator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  // Rediriger si la soumission n'existe pas
  if (!submission) {
    notFound();
  }

  // Calculer le score total et le pourcentage
  let totalScore = 0;
  let maxPossibleScore = 0;

  for (const evaluation of submission.evaluations) {
    totalScore += evaluation.score * evaluation.criterion.weight;
    maxPossibleScore += 10 * evaluation.criterion.weight;
  }

  const scorePercentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 0;

  // Préparer les données pour le composant
  const evaluationData = {
    submission,
    totalScore,
    maxPossibleScore,
    scorePercentage,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Détails de la soumission
        </h1>
        <p className="text-muted-foreground">
          Visualisation des détails et des évaluations pour cette soumission
        </p>
      </div>

      <EvaluationDetails data={evaluationData} />
    </div>
  );
} 