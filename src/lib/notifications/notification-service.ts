import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { cacheService } from "@/lib/cache-service";
import { createCacheManager } from "@/lib/cache/advanced-cache";

// Gestionnaire de cache spécifique pour les notifications
const notificationCache = createCacheManager('notifications');
const notificationLogger = logger.createContextLogger('notification-service');

/**
 * Types de notifications supportés par le système
 */
export enum NotificationType {
  BADGE_EARNED = 'BADGE_EARNED',
  LEVEL_UP = 'LEVEL_UP',
  POINTS_EARNED = 'POINTS_EARNED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  SUBMISSION_EVALUATED = 'SUBMISSION_EVALUATED',
  COMMENT_RECEIVED = 'COMMENT_RECEIVED',
  WELCOME = 'WELCOME',
  SYSTEM = 'SYSTEM'
}

/**
 * Priorités des notifications
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Interface pour la création d'une notification
 */
export interface CreateNotificationDto {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  priority?: NotificationPriority;
  linkUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  relatedId?: string;
  relatedType?: string;
}

/**
 * Service de gestion des notifications
 * Permet de créer, récupérer et gérer les notifications des utilisateurs
 */
export class NotificationService {
  /**
   * Crée une nouvelle notification
   * @param data Données de la notification à créer
   * @returns La notification créée
   */
  static async createNotification(data: CreateNotificationDto) {
    try {
      notificationLogger.debug(`Création d'une notification de type ${data.type} pour l'utilisateur ${data.userId}`);
      
      // Valider les données
      if (!data.userId || !data.title || !data.content || !data.type) {
        throw new Error('Données de notification incomplètes');
      }

      // Créer la notification
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          content: data.content,
          type: data.type,
          priority: data.priority || NotificationPriority.MEDIUM,
          read: false,
          linkUrl: data.linkUrl,
          imageUrl: data.imageUrl,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          relatedId: data.relatedId,
          relatedType: data.relatedType,
        }
      });

      // Invalider le cache des notifications pour cet utilisateur
      await this.invalidateUserNotificationsCache(data.userId);

      // Émettre un événement pour la notification en temps réel (cette partie sera implémentée avec WebSockets)
      this.emitNotificationEvent(notification);

      return notification;
    } catch (error) {
      notificationLogger.error('Erreur lors de la création d\'une notification', 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Émetteur temporaire de notification (à remplacer par WebSockets)
   * @param notification La notification à émettre
   */
  private static emitNotificationEvent(notification: any) {
    // Cette méthode sera implémentée avec WebSockets ou SSE plus tard
    notificationLogger.debug(`Émission d'un événement de notification: ${notification.id}`);
  }

  /**
   * Récupère les notifications non lues d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param limit Nombre maximum de notifications à récupérer
   * @returns Liste des notifications non lues
   */
  static async getUnreadNotifications(userId: string, limit: number = 10) {
    try {
      return await notificationCache.getOrSet(`unread:${userId}:${limit}`, async () => {
        notificationLogger.debug(`Récupération des ${limit} notifications non lues pour l'utilisateur ${userId}`);
        
        return prisma.notification.findMany({
          where: {
            userId,
            read: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit
        });
      }, { ttl: 60 * 1000 }); // Cache d'une minute seulement pour les non lues
    } catch (error) {
      notificationLogger.error(`Erreur lors de la récupération des notifications non lues pour l'utilisateur ${userId}`, 
        error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Récupère toutes les notifications d'un utilisateur avec pagination
   * @param userId ID de l'utilisateur
   * @param page Numéro de page
   * @param limit Nombre d'éléments par page
   * @returns Notifications paginées
   */
  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    try {
      return await notificationCache.getOrSet(`all:${userId}:${page}:${limit}`, async () => {
        notificationLogger.debug(`Récupération des notifications pour l'utilisateur ${userId} (page ${page}, limit ${limit})`);
        
        const skip = (page - 1) * limit;
        
        const [notifications, total] = await Promise.all([
          prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
          }),
          prisma.notification.count({
            where: { userId }
          })
        ]);
        
        return {
          data: notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      }, { ttl: 5 * 60 * 1000 }); // Cache de 5 minutes pour toutes les notifications
    } catch (error) {
      notificationLogger.error(`Erreur lors de la récupération des notifications pour l'utilisateur ${userId}`, 
        error instanceof Error ? error : new Error(String(error)));
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }

  /**
   * Marque une notification comme lue
   * @param notificationId ID de la notification
   * @param userId ID de l'utilisateur (pour vérification)
   * @returns La notification mise à jour
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      notificationLogger.debug(`Marquage de la notification ${notificationId} comme lue pour l'utilisateur ${userId}`);
      
      // Vérifier d'abord que la notification appartient bien à l'utilisateur
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      });
      
      if (!notification) {
        throw new Error(`Notification ${notificationId} non trouvée ou n'appartenant pas à l'utilisateur ${userId}`);
      }
      
      // Marquer comme lue
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });
      
      // Invalider le cache
      await this.invalidateUserNotificationsCache(userId);
      
      return updated;
    } catch (error) {
      notificationLogger.error(`Erreur lors du marquage de la notification ${notificationId} comme lue`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications mises à jour
   */
  static async markAllAsRead(userId: string) {
    try {
      notificationLogger.debug(`Marquage de toutes les notifications comme lues pour l'utilisateur ${userId}`);
      
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: {
          read: true
        }
      });
      
      // Invalider le cache
      await this.invalidateUserNotificationsCache(userId);
      
      return result.count;
    } catch (error) {
      notificationLogger.error(`Erreur lors du marquage de toutes les notifications comme lues pour ${userId}`, 
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Supprime une notification
   * @param notificationId ID de la notification
   * @param userId ID de l'utilisateur (pour vérification)
   * @returns true si la suppression a réussi, false sinon
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      notificationLogger.debug(`Suppression de la notification ${notificationId} pour l'utilisateur ${userId}`);
      
      // Vérifier d'abord que la notification appartient bien à l'utilisateur
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      });
      
      if (!notification) {
        notificationLogger.warn(`Tentative de suppression d'une notification inexistante ou non autorisée: ${notificationId} par l'utilisateur ${userId}`);
        return false;
      }
      
      // Supprimer la notification
      await prisma.notification.delete({
        where: { id: notificationId }
      });
      
      // Invalider le cache
      await this.invalidateUserNotificationsCache(userId);
      
      return true;
    } catch (error) {
      notificationLogger.error(`Erreur lors de la suppression de la notification ${notificationId}`, 
        error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Compte les notifications non lues d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications non lues
   */
  static async countUnread(userId: string) {
    try {
      return await notificationCache.getOrSet(`count:${userId}`, async () => {
        notificationLogger.debug(`Comptage des notifications non lues pour l'utilisateur ${userId}`);
        
        return prisma.notification.count({
          where: {
            userId,
            read: false
          }
        });
      }, { ttl: 30 * 1000 }); // Cache de 30 secondes pour le comptage
    } catch (error) {
      notificationLogger.error(`Erreur lors du comptage des notifications non lues pour ${userId}`, 
        error instanceof Error ? error : new Error(String(error)));
      return 0;
    }
  }

  /**
   * Invalide le cache des notifications d'un utilisateur
   * @param userId ID de l'utilisateur
   */
  private static async invalidateUserNotificationsCache(userId: string) {
    try {
      // Supprimer tous les caches liés à cet utilisateur
      await notificationCache.invalidate(`unread:${userId}:10`); // Format standard pour getUnreadNotifications
      
      // Invalider les caches de pagination (pages 1-5 par défaut)
      for (let i = 1; i <= 5; i++) {
        await notificationCache.invalidate(`all:${userId}:${i}:20`); // Format standard pour getUserNotifications
      }
      
      // Invalider également le compteur de notifications non lues
      await cacheService.delete(`unread-count:${userId}`);
    } catch (error) {
      notificationLogger.error(`Erreur lors de l'invalidation du cache pour l'utilisateur ${userId}`, 
        error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Crée une notification pour un badge obtenu
   * @param userId ID de l'utilisateur
   * @param badgeId ID du badge
   * @param badgeName Nom du badge
   * @returns La notification créée
   */
  static async createBadgeNotification(userId: string, badgeId: string, badgeName: string) {
    return this.createNotification({
      userId,
      title: 'Nouveau badge obtenu !',
      content: `Félicitations ! Vous avez obtenu le badge "${badgeName}".`,
      type: NotificationType.BADGE_EARNED,
      priority: NotificationPriority.HIGH,
      relatedId: badgeId,
      relatedType: 'BADGE',
      linkUrl: `/profil/badges`,
      metadata: { badgeId, badgeName }
    });
  }

  /**
   * Crée une notification pour un niveau supérieur
   * @param userId ID de l'utilisateur
   * @param level Nouveau niveau
   * @returns La notification créée
   */
  static async createLevelUpNotification(userId: string, level: number) {
    return this.createNotification({
      userId,
      title: 'Niveau supérieur !',
      content: `Félicitations ! Vous êtes maintenant niveau ${level}.`,
      type: NotificationType.LEVEL_UP,
      priority: NotificationPriority.HIGH,
      linkUrl: `/progression`,
      metadata: { level }
    });
  }

  /**
   * Crée une notification pour des points gagnés
   * @param userId ID de l'utilisateur
   * @param points Nombre de points gagnés
   * @param source Source des points (défi, badge, etc.)
   * @returns La notification créée
   */
  static async createPointsNotification(userId: string, points: number, source: string, sourceId?: string) {
    return this.createNotification({
      userId,
      title: 'Points gagnés !',
      content: `Vous avez gagné ${points} points${source ? ` pour ${source}` : ''}.`,
      type: NotificationType.POINTS_EARNED,
      priority: NotificationPriority.MEDIUM,
      linkUrl: `/progression`,
      relatedId: sourceId,
      relatedType: sourceId ? 'CHALLENGE' : undefined,
      metadata: { points, source }
    });
  }
} 