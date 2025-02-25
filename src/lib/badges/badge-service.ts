import { db } from "@/lib/db";
import { defaultBadges } from "./default-badges";
import { cache } from "react";
import { BadgeCondition, BadgeConditionType } from "./types";
import { User } from "@prisma/client";

export class BadgeService {
  private static instance: BadgeService;
  private conditionCache: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Vérifie si un utilisateur remplit les conditions pour obtenir un badge
   */
  static async checkBadgeCondition(
    userId: string,
    conditionType: BadgeConditionType,
    requiredValue: number
  ): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        participations: true,
        comments: true,
      }
    });

    if (!user) return false;

    switch (conditionType) {
      case "PARTICIPATION_COUNT":
        return user.participations.length >= requiredValue;
      
      case "SUCCESS_COUNT":
        const successCount = await db.challengeParticipation.count({
          where: {
            userId,
            status: "COMPLETED",
            approved: true
          }
        });
        return successCount >= requiredValue;
      
      case "POINTS_THRESHOLD":
        return user.points >= requiredValue;
      
      case "COMMENT_COUNT":
        return user.comments.length >= requiredValue;
      
      case "STREAK_DAYS":
        return this.checkStreakDays(user, requiredValue);
      
      default:
        return false;
    }
  }

  /**
   * Vérifie la série de jours consécutifs de participation
   */
  private static async checkStreakDays(user: User, requiredDays: number): Promise<boolean> {
    const participations = await db.challengeParticipation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (participations.length < requiredDays) return false;

    let currentStreak = 1;
    let maxStreak = 1;

    // Convertir les dates en UTC pour éviter les problèmes de fuseau horaire
    const dates = participations.map(p => {
      const date = new Date(p.createdAt);
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    });

    for (let i = 1; i < dates.length; i++) {
      const diffDays = Math.floor((dates[i-1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays === 0) {
        // Ignorer les participations multiples le même jour
        continue;
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak >= requiredDays;
  }

  /**
   * Vérifie et attribue les badges à un utilisateur
   */
  static async checkAndAwardBadges(userId: string): Promise<string[]> {
    const [userBadges, availableBadges] = await Promise.all([
      db.userBadge.findMany({
        where: { userId },
        select: { badgeId: true }
      }),
      db.badge.findMany({
        where: {
          users: {
            none: {
              userId: userId
            }
          }
        }
      })
    ]);

    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    const newBadges: string[] = [];
    let totalPoints = 0;

    // Vérifier les badges de la base de données
    for (const badge of availableBadges) {
      const condition = JSON.parse(badge.condition);
      const isEligible = await BadgeService.checkBadgeCondition(
        userId,
        condition.type,
        condition.value
      );

      if (isEligible) {
        await db.userBadge.create({
          data: {
            userId: userId,
            badgeId: badge.id,
            earnedAt: new Date()
          }
        });
        newBadges.push(badge.name);
        totalPoints += badge.points;
      }
    }

    // Vérifier les badges par défaut
    for (const badge of defaultBadges) {
      if (!earnedBadgeIds.includes(badge.name) && 
          await this.checkBadgeCondition(userId, badge.condition.type, badge.condition.value)) {
        await db.userBadge.create({
          data: {
            userId,
            badgeId: badge.name,
            earnedAt: new Date()
          }
        });
        newBadges.push(badge.name);
      }
    }

    if (newBadges.length > 0) {
      // Mettre à jour les points de l'utilisateur
      if (totalPoints > 0) {
        await Promise.all([
          db.user.update({
            where: { id: userId },
            data: { points: { increment: totalPoints } }
          }),
          db.leaderboard.upsert({
            where: { userId },
            create: { userId, points: totalPoints },
            update: { points: { increment: totalPoints } }
          })
        ]);
      }

      // Créer les notifications
      const notifications = newBadges.map(badgeName => ({
        userId,
        type: "BADGE_EARNED",
        title: "Nouveau badge débloqué !",
        content: `Félicitations ! Vous avez obtenu le badge "${badgeName}" !`,
        badgeId: badgeName
      }));

      await db.notification.createMany({ data: notifications });
    }

    return newBadges;
  }

  // Méthode pour invalider le cache pour un utilisateur
  invalidateUserCache(userId: string) {
    for (const key of this.conditionCache.keys()) {
      if (key.startsWith(userId)) {
        this.conditionCache.delete(key);
      }
    }
  }
}

// Export d'une instance unique
export const badgeService = BadgeService.getInstance();

// Export d'une version mise en cache de la méthode de vérification
export const getCachedUserBadges = cache(async (userId: string) => {
  return db.userBadge.findMany({
    where: { userId },
    include: { badge: true }
  });
});