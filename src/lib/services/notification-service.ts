/**
 * Types de notifications disponibles
 */
type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface pour les détails d'une notification
 */
export interface NotificationDetails {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
}

/**
 * Interface pour le service de gestion des notifications
 */
interface NotificationServiceType {
  notifications: NotificationDetails[];
  show: (type: NotificationType, message: string, duration?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  getNotifications: () => NotificationDetails[];
  hasNotifications: () => boolean;
}

/**
 * Service de gestion des notifications
 * Centralise l'affichage des notifications dans l'application
 */
export const NotificationService: NotificationServiceType = {
  /**
   * Liste des notifications actives
   */
  notifications: [],

  /**
   * Afficher une notification
   * @param type Type de notification
   * @param message Message de la notification
   * @param duration Durée d'affichage en millisecondes (optionnel)
   */
  show: (type: NotificationType, message: string, duration?: number): void => {
    const notification: NotificationDetails = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      duration: duration || 5000, // Durée par défaut : 5 secondes
      timestamp: Date.now()
    };

    NotificationService.notifications.push(notification);

    // Supprimer automatiquement après la durée spécifiée
    setTimeout(() => {
      NotificationService.remove(notification.id);
    }, notification.duration);

    // Log pour le débogage
    console.log(`Notification ${type}:`, message);
  },

  /**
   * Supprimer une notification
   * @param id Identifiant de la notification à supprimer
   */
  remove: (id: string): void => {
    NotificationService.notifications = NotificationService.notifications.filter(
      notification => notification.id !== id
    );
  },

  /**
   * Effacer toutes les notifications
   */
  clear: (): void => {
    NotificationService.notifications = [];
  },

  /**
   * Obtenir toutes les notifications
   * @returns Liste des notifications
   */
  getNotifications: (): NotificationDetails[] => {
    return NotificationService.notifications;
  },

  /**
   * Vérifier s'il y a des notifications
   * @returns true si des notifications existent
   */
  hasNotifications: (): boolean => {
    return NotificationService.notifications.length > 0;
  }
}; 