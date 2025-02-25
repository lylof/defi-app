import { db } from "@/lib/db";
import { LEVEL_REQUIREMENTS, LevelProgress, LevelRequirement } from "./types";
import { BadgeService } from "@/lib/badges/badge-service";

export class LevelService {
  /**
   * Calcule la progression d'un utilisateur
   */
  static async getUserProgress(userId: string): Promise<LevelProgress> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { level: true }
    });

    if (!user?.level) {
      return {
        currentLevel: 1,
        currentExperience: 0,
        nextLevelExperience: LEVEL_REQUIREMENTS[1]?.experienceRequired || 100,
        progress: 0,
      };
    }

    const currentLevelReq = LEVEL_REQUIREMENTS.find(
      (req) => req.level === user.level.level
    ) || LEVEL_REQUIREMENTS[0];

    const nextLevelReq = LEVEL_REQUIREMENTS.find(
      (req) => req.level === user.level.level + 1
    );

    if (!nextLevelReq) {
      return {
        currentLevel: user.level.level,
        currentExperience: user.level.experience,
        nextLevelExperience: user.level.nextLevel,
        progress: 100,
      };
    }

    const expDiff = nextLevelReq.experienceRequired - currentLevelReq.experienceRequired;
    const userExpDiff = user.level.experience - currentLevelReq.experienceRequired;
    const progress = (userExpDiff / expDiff) * 100;

    return {
      currentLevel: user.level.level,
      currentExperience: user.level.experience,
      nextLevelExperience: nextLevelReq.experienceRequired,
      progress: Math.min(Math.max(progress, 0), 100),
    };
  }

  /**
   * Ajoute de l'expérience à un utilisateur
   */
  static async addExperience(userId: string, amount: number): Promise<void> {
    if (amount <= 0) return;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { level: true }
    });

    if (!user) return;

    // Créer ou mettre à jour le niveau
    const level = user.level || await db.level.create({
      data: {
        userId,
        level: 1,
        experience: 0,
        nextLevel: LEVEL_REQUIREMENTS[1]?.experienceRequired || 100,
      }
    });

    // Ajouter l'expérience
    const newExperience = level.experience + amount;
    let currentLevel = level.level;
    let leveledUp = false;

    // Vérifier les niveaux supérieurs
    while (true) {
      const nextLevelReq = LEVEL_REQUIREMENTS.find(
        (req) => req.level === currentLevel + 1
      );

      if (!nextLevelReq || newExperience < nextLevelReq.experienceRequired) {
        break;
      }

      currentLevel++;
      leveledUp = true;
    }

    // Mettre à jour le niveau en une seule transaction
    await db.$transaction(async (tx) => {
      await tx.level.update({
        where: { userId },
        data: {
          level: currentLevel,
          experience: newExperience,
          nextLevel: LEVEL_REQUIREMENTS.find(
            (req) => req.level === currentLevel + 1
          )?.experienceRequired || level.nextLevel,
        }
      });

      if (leveledUp) {
        await this.grantLevelRewards(userId, currentLevel, tx);
      }
    });
  }

  /**
   * Attribue les récompenses d'un niveau
   */
  private static async grantLevelRewards(
    userId: string,
    level: number,
    tx?: any
  ): Promise<void> {
    const levelReq = LEVEL_REQUIREMENTS.find((req) => req.level === level);
    if (!levelReq) return;

    const dbClient = tx || db;

    try {
      for (const reward of levelReq.rewards) {
        switch (reward.type) {
          case "BADGE":
            if (reward.id) {
              await BadgeService.checkAndAwardBadges(userId);
            }
            break;

          case "POINTS":
            if (reward.value && reward.value > 0) {
              await dbClient.user.update({
                where: { id: userId },
                data: {
                  points: {
                    increment: reward.value
                  }
                }
              });

              // Mettre à jour le classement
              await dbClient.leaderboard.upsert({
                where: { userId },
                create: { userId, points: reward.value },
                update: { points: { increment: reward.value } }
              });
            }
            break;

          case "FEATURE":
            // Les fonctionnalités sont débloquées automatiquement par le niveau
            break;
        }
      }

      // Créer une notification pour le nouveau niveau
      await dbClient.notification.create({
        data: {
          userId,
          type: "LEVEL_UP",
          title: `Niveau ${level} atteint !`,
          content: `Félicitations ! Vous avez atteint le niveau ${level} et débloqué de nouvelles récompenses.`,
        }
      });
    } catch (error) {
      console.error(`Erreur lors de l'attribution des récompenses du niveau ${level}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a accès à une fonctionnalité
   */
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { level: true }
    });

    if (!user?.level) return false;

    // Trouver tous les niveaux jusqu'au niveau actuel de l'utilisateur
    const unlockedFeatures = LEVEL_REQUIREMENTS
      .filter((req) => req.level <= user.level.level)
      .flatMap((req) => req.rewards)
      .filter((reward) => reward.type === "FEATURE" && reward.description)
      .map((reward) => reward.description!);

    return unlockedFeatures.includes(feature);
  }
}