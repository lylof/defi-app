import { useCallback } from 'react';
import { NotificationService } from '@/lib/services/notification-service';

/**
 * Hook personnalisé pour utiliser le service de notifications
 */
export function useNotifications() {
  /**
   * Afficher une notification de succès
   * @param message Message de la notification
   * @param duration Durée d'affichage en millisecondes (optionnel)
   */
  const showSuccess = useCallback((message: string, duration?: number) => {
    NotificationService.show('success', message, duration);
  }, []);

  /**
   * Afficher une notification d'erreur
   * @param message Message de la notification
   * @param duration Durée d'affichage en millisecondes (optionnel)
   */
  const showError = useCallback((message: string, duration?: number) => {
    NotificationService.show('error', message, duration);
  }, []);

  /**
   * Afficher une notification d'avertissement
   * @param message Message de la notification
   * @param duration Durée d'affichage en millisecondes (optionnel)
   */
  const showWarning = useCallback((message: string, duration?: number) => {
    NotificationService.show('warning', message, duration);
  }, []);

  /**
   * Afficher une notification d'information
   * @param message Message de la notification
   * @param duration Durée d'affichage en millisecondes (optionnel)
   */
  const showInfo = useCallback((message: string, duration?: number) => {
    NotificationService.show('info', message, duration);
  }, []);

  /**
   * Effacer toutes les notifications
   */
  const clearNotifications = useCallback(() => {
    NotificationService.clear();
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotifications
  };
} 