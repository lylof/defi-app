import { prisma } from "@/lib/prisma";
import { createCacheManager } from "@/lib/cache/advanced-cache";
import { cacheService } from "@/lib/cache-service";
import { logger } from "@/lib/logger";

// Créer un gestionnaire de cache spécifique aux utilisateurs
const userCache = createCacheManager('users');
const userLogger = logger.createContextLogger('optimized-user-service');

/**
 * Service optimisé pour les utilisateurs avec mise en cache intégrée
 * Réduit considérablement les appels à la base de données pour les informations utilisateur fréquemment consultées
 */
export class OptimizedUserService {
  /**
   * Récupère un utilisateur par son ID avec mise en cache
   * Temps de cache: 10 minutes
   */
  static async getUserById(id: string) {
    const cacheKey = `user:${id}`;
    
    return userCache.getOrSet(cacheKey, async () => {
      userLogger.debug(`Récupération de l'utilisateur ${id} depuis la base de données`);
      return prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          points: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }, { ttl: 10 * 60 * 1000 }); // 10 minutes de cache
  }

  /**
   * Récupère le niveau d'un utilisateur avec mise en cache
   * Temps de cache: 15 minutes
   */
  static async getUserLevel(userId: string) {
    const cacheKey = `level:${userId}`;
    
    return userCache.getOrSet(cacheKey, async () => {
      userLogger.debug(`Récupération du niveau pour l'utilisateur ${userId} depuis la base de données`);
      return prisma.level.findUnique({
        where: { userId }
      });
    }, { ttl: 15 * 60 * 1000 }); // 15 minutes de cache
  }

  /**
   * Récupère le profil complet de l'utilisateur avec mise en cache
   * Cette méthode évite les requêtes multiples en agrégeant toutes les données du profil
   * Temps de cache: 5 minutes
   */
  static async getUserProfile(userId: string) {
    userLogger.debug(`Récupération du profil complet pour l'utilisateur ${userId}`);
    return userCache.getOrSet(`profile:${userId}`, async () => {
      // Effectuer toutes les requêtes en parallèle pour améliorer les performances
      const [user, level, badges, submissions, participations] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            points: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.level.findUnique({
          where: { userId }
        }),
        prisma.userBadge.findMany({
          where: { userId },
          include: {
            badge: true
          },
          take: 10 // Limiter pour des raisons de performance
        }),
        prisma.submission.count({
          where: { userId }
        }),
        prisma.challengeParticipation.count({
          where: { userId }
        })
      ]);

      if (!user) {
        throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`);
      }

      return {
        ...user,
        level,
        badges: badges.map(ub => ub.badge),
        stats: {
          submissionsCount: submissions,
          participationsCount: participations,
          completionRate: submissions > 0 ? Math.round((participations / submissions) * 100) : 0
        }
      };
    }, { ttl: 5 * 60 * 1000 }); // 5 minutes de cache
  }

  /**
   * Met à jour un utilisateur et invalide le cache
   */
  static async updateUser(id: string, data: any) {
    userLogger.debug(`Mise à jour de l'utilisateur ${id} et invalidation du cache`);
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    // Invalider le cache
    await OptimizedUserService.invalidateUserCache(id);

    return updatedUser;
  }

  /**
   * Récupère la session utilisateur optimisée pour les performances
   * Stocke les données de session en cache pour réduire les requêtes répétées
   */
  static async getSessionUser(id: string) {
    userLogger.debug(`Récupération des données de session pour l'utilisateur ${id}`);
    return userCache.getOrSet(`session:${id}`, async () => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        throw new Error(`Utilisateur de session avec l'ID ${id} non trouvé`);
      }

      return user;
    }, { ttl: 15 * 60 * 1000 }); // 15 minutes de cache
  }

  /**
   * Invalide tout le cache lié à un utilisateur spécifique
   */
  static async invalidateUserCache(userId: string) {
    userLogger.debug(`Invalidation de tout le cache pour l'utilisateur ${userId}`);
    
    // Invalider toutes les entrées de cache liées à cet utilisateur
    userCache.invalidate(`profile:${userId}`);
    userCache.invalidate(`session:${userId}`);
    userCache.invalidate(`user:${userId}`);
    userCache.invalidate(`level:${userId}`);
    
    // Invalider également par tag pour être sûr
    await cacheService.invalidateByTag(`user:${userId}`);
  }
} 