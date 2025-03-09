import { prisma } from "@/lib/prisma";

/**
 * Types de statut pour les défis récents
 */
export type ChallengeStatus = "completed" | "in_progress" | "abandoned";

/**
 * Interface pour les défis récents de l'utilisateur
 * Utilisée pour afficher les défis récents dans le tableau de bord utilisateur
 */
export interface RecentChallenge {
  id: string;
  title: string;
  status: ChallengeStatus;
  submittedAt?: string;
  evaluationScore?: number;
}

/**
 * Service pour gérer les statistiques utilisateur
 * Fournit des méthodes pour récupérer les statistiques et les défis récents
 */
export class UserStatsService {
  /**
   * Récupère les statistiques détaillées d'un utilisateur
   * @param userId Identifiant de l'utilisateur
   * @returns Objet contenant les statistiques de l'utilisateur
   */
  static async getUserStats(userId: string) {
    // Vérifier que l'ID est valide
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      throw new Error("ID utilisateur non valide");
    }

    try {
      // Récupérer les informations de base de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          points: true,
          _count: {
            select: {
              badges: true,
              participations: true
            }
          }
        }
      });

      if (!user) {
        throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`);
      }

      // Compter les défis complétés et en cours
      const [completedChallenges, inProgressChallenges] = await Promise.all([
        prisma.submission.count({
          where: {
            userId,
            status: "APPROVED"
          }
        }),
        prisma.challengeParticipation.count({
          where: {
            userId,
            submitted: false
          }
        })
      ]);

      // Récupérer le classement si disponible
      const leaderboard = await prisma.leaderboard.findUnique({
        where: { userId },
        select: {
          rank: true
        }
      });

      const totalParticipants = await prisma.leaderboard.count();

      // Calcul du taux de réussite
      const totalEvaluatedSubmissions = await prisma.submission.count({
        where: {
          userId,
          status: {
            in: ["APPROVED", "REJECTED"]
          }
        }
      });
      
      const successRate = totalEvaluatedSubmissions > 0
        ? Math.round((completedChallenges / totalEvaluatedSubmissions) * 100)
        : 0;

      // Récupérer le niveau si disponible
      const level = await prisma.level.findUnique({
        where: { userId },
        select: {
          level: true,
          experience: true,
          nextLevel: true
        }
      });

      return {
        points: user.points,
        level: level?.level || 1,
        experience: level?.experience || 0,
        nextLevelAt: level?.nextLevel || 100,
        rank: leaderboard?.rank || null,
        totalParticipants,
        challengesCompleted: completedChallenges,
        challengesInProgress: inProgressChallenges,
        badgesCount: user._count.badges,
        successRate,
        memberSince: user.createdAt.toISOString()
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques pour l'utilisateur ${userId}:`, error);
      
      // Gérer spécifiquement les erreurs de connexion
      if (error instanceof Error && 
          (error.message.includes('connection') || 
          error.message.includes('database') ||
          error.message.includes('timeout') ||
          error.message.includes('Closed'))) {
        throw new Error("Erreur de connexion à la base de données. Veuillez réessayer ultérieurement.");
      }
      
      // Valeurs par défaut en cas d'erreur
      return {
        points: 0,
        level: 1,
        experience: 0,
        nextLevelAt: 100,
        rank: null,
        totalParticipants: 0,
        challengesCompleted: 0,
        challengesInProgress: 0,
        badgesCount: 0,
        successRate: 0,
        memberSince: new Date().toISOString()
      };
    }
  }

  /**
   * Récupère les défis récents d'un utilisateur
   * @param userId Identifiant de l'utilisateur
   * @param limit Nombre maximum de défis à récupérer
   * @returns Liste des défis récents
   */
  static async getRecentChallenges(userId: string, limit: number = 5): Promise<RecentChallenge[]> {
    // Vérifier que l'ID est valide
    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      console.error("Tentative de récupération des défis avec un ID utilisateur invalide");
      return [];
    }

    try {
      // Récupérer les soumissions récentes avec leur évaluation
      const submissions = await prisma.submission.findMany({
        where: { userId },
        select: {
          challengeId: true,
          status: true,
          createdAt: true,
          challenge: {
            select: {
              id: true,
              title: true
            }
          },
          evaluations: {
            select: {
              score: true,
              criterion: {
                select: {
                  weight: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      // Récupérer les participations sans soumission (défis en cours)
      const inProgressChallenges = await prisma.challengeParticipation.findMany({
        where: {
          userId,
          submitted: false
        },
        select: {
          challengeId: true,
          createdAt: true,
          challenge: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      });

      // Transformer les soumissions en format attendu
      const completedChallenges: RecentChallenge[] = submissions.map(submission => {
        // Calculer le score moyen si des évaluations existent
        let evaluationScore;
        if (submission.evaluations.length > 0) {
          let totalScore = 0;
          let totalWeight = 0;
          
          for (const item of submission.evaluations) {
            totalScore += item.score * item.criterion.weight;
            totalWeight += item.criterion.weight;
          }
          
          evaluationScore = totalWeight > 0
            ? Math.round((totalScore / totalWeight) * 10) // Score sur 100
            : undefined;
        }

        // Convertir le statut Prisma en type ChallengeStatus
        let status: ChallengeStatus;
        if (submission.status === "APPROVED") {
          status = "completed";
        } else if (submission.status === "REJECTED") {
          status = "abandoned";
        } else {
          status = "in_progress";
        }
        
        return {
          id: submission.challenge.id,
          title: submission.challenge.title,
          status,
          submittedAt: submission.createdAt.toISOString(),
          evaluationScore
        };
      });

      // Transformer les défis en cours avec le type approprié
      const inProgressChallengeMapped: RecentChallenge[] = inProgressChallenges.map(participation => ({
        id: participation.challenge.id,
        title: participation.challenge.title,
        status: "in_progress",
        submittedAt: undefined
      }));

      // Fusionner et trier les deux listes
      const allChallenges = [...completedChallenges, ...inProgressChallengeMapped]
        .sort((a, b) => {
          // Trier d'abord par date (les plus récents en premier)
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);

      return allChallenges;
    } catch (error) {
      console.error(`Erreur lors de la récupération des défis récents pour l'utilisateur ${userId}:`, error);
      
      // Gérer spécifiquement les erreurs de connexion
      if (error instanceof Error && 
          (error.message.includes('connection') || 
          error.message.includes('database') ||
          error.message.includes('timeout') ||
          error.message.includes('Closed'))) {
        console.warn("Erreur de connexion à la base de données lors de la récupération des défis récents");
      }
      
      // Retourner un tableau vide en cas d'erreur pour éviter de bloquer l'affichage
      return [];
    }
  }
} 