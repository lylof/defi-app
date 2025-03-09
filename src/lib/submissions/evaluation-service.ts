import { prisma } from "@/lib/prisma";
import { SubmissionStatus } from "@prisma/client";

interface CriterionEvaluation {
  criterionId: string;
  score: number;
  comment?: string;
}

interface SubmissionEvaluationResult {
  submissionId: string;
  totalScore: number;
  maxPossibleScore: number;
  scorePercentage: number;
  approved: boolean;
  criteriaEvaluations: CriterionEvaluation[];
}

export class EvaluationService {
  /**
   * Évalue une soumission selon les critères définis
   * @param submissionId ID de la soumission à évaluer
   * @param evaluatorId ID de l'évaluateur
   * @param criteriaEvaluations Évaluations pour chaque critère
   * @param approvalThreshold Seuil de pourcentage pour l'approbation (par défaut 60%)
   * @returns Résultat de l'évaluation
   */
  static async evaluateSubmission(
    submissionId: string,
    evaluatorId: string,
    criteriaEvaluations: CriterionEvaluation[],
    approvalThreshold: number = 60
  ): Promise<SubmissionEvaluationResult> {
    // Récupérer la soumission avec le défi et les critères d'évaluation
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          include: {
            evaluationCriteria: true
          }
        },
        user: true
      }
    });

    if (!submission) {
      throw new Error("Soumission non trouvée");
    }

    // Vérifier que tous les critères d'évaluation existent pour ce défi
    const challengeCriteriaIds = submission.challenge.evaluationCriteria.map(c => c.id);
    const evaluationCriteriaIds = criteriaEvaluations.map(e => e.criterionId);
    
    for (const criterionId of evaluationCriteriaIds) {
      if (!challengeCriteriaIds.includes(criterionId)) {
        throw new Error(`Le critère d'évaluation ${criterionId} n'appartient pas à ce défi`);
      }
    }

    // Calculer le score total et le score maximum possible
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Utiliser une transaction pour enregistrer toutes les évaluations
    const result = await prisma.$transaction(async (tx) => {
      // Supprimer les évaluations existantes pour cette soumission
      await tx.submissionEvaluation.deleteMany({
        where: { submissionId }
      });

      // Créer les nouvelles évaluations
      for (const evaluation of criteriaEvaluations) {
        const criterion = submission.challenge.evaluationCriteria.find(
          c => c.id === evaluation.criterionId
        );

        if (!criterion) {
          throw new Error(`Critère d'évaluation ${evaluation.criterionId} non trouvé`);
        }

        // Vérifier que le score est entre 0 et 10
        if (evaluation.score < 0 || evaluation.score > 10) {
          throw new Error("Le score doit être compris entre 0 et 10");
        }

        // Créer l'évaluation
        await tx.submissionEvaluation.create({
          data: {
            submissionId,
            criterionId: evaluation.criterionId,
            evaluatorId,
            score: evaluation.score,
            comment: evaluation.comment
          }
        });

        // Calculer le score pondéré
        totalScore += evaluation.score * criterion.weight;
        maxPossibleScore += 10 * criterion.weight; // 10 est le score maximum pour chaque critère
      }

      // Calculer le pourcentage du score
      const scorePercentage = maxPossibleScore > 0 
        ? (totalScore / maxPossibleScore) * 100 
        : 0;

      // Déterminer si la soumission est approuvée
      const approved = scorePercentage >= approvalThreshold;

      // Mettre à jour le statut de la soumission
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: approved ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED
        }
      });

      // Si la soumission est approuvée, attribuer les points à l'utilisateur
      if (approved) {
        await tx.user.update({
          where: { id: submission.userId },
          data: {
            points: {
              increment: submission.challenge.points
            }
          }
        });

        // Mettre à jour le classement
        await tx.leaderboard.upsert({
          where: { userId: submission.userId },
          create: {
            userId: submission.userId,
            points: submission.challenge.points
          },
          update: {
            points: {
              increment: submission.challenge.points
            }
          }
        });
      }

      // Créer un log d'activité
      await tx.activityLog.create({
        data: {
          action: approved ? "SUBMISSION_APPROVED" : "SUBMISSION_REJECTED",
          details: JSON.stringify({
            submissionId,
            challengeId: submission.challengeId,
            scorePercentage: Math.round(scorePercentage),
            totalScore,
            maxPossibleScore
          }),
          targetUserId: submission.userId,
          adminUserId: evaluatorId
        }
      });

      return {
        submissionId,
        totalScore,
        maxPossibleScore,
        scorePercentage,
        approved,
        criteriaEvaluations
      };
    });

    return result;
  }

  /**
   * Récupère les évaluations d'une soumission
   * @param submissionId ID de la soumission
   * @returns Évaluations de la soumission
   */
  static async getSubmissionEvaluations(submissionId: string) {
    const evaluations = await prisma.submissionEvaluation.findMany({
      where: { submissionId },
      include: {
        criterion: true,
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          include: {
            evaluationCriteria: true
          }
        }
      }
    });

    if (!submission) {
      throw new Error("Soumission non trouvée");
    }

    // Calculer le score total et le score maximum possible
    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const evaluation of evaluations) {
      totalScore += evaluation.score * evaluation.criterion.weight;
      maxPossibleScore += 10 * evaluation.criterion.weight;
    }

    // Calculer le pourcentage du score
    const scorePercentage = maxPossibleScore > 0 
      ? (totalScore / maxPossibleScore) * 100 
      : 0;

    return {
      evaluations,
      totalScore,
      maxPossibleScore,
      scorePercentage,
      approved: submission.status === SubmissionStatus.APPROVED
    };
  }
} 