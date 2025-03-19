"use client";

import { useEffect, useState } from 'react';
import { NotificationService, NotificationDetails } from '@/lib/services/notification-service';
import { cn } from '@/lib/utils';

/**
 * Composant pour afficher les notifications
 */
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationDetails[]>([]);

  useEffect(() => {
    // Mettre à jour les notifications quand elles changent
    const updateNotifications = () => {
      setNotifications(NotificationService.getNotifications());
    };

    // Écouter les changements de notifications
    window.addEventListener('notifications-updated', updateNotifications);

    // Nettoyer l'écouteur d'événements
    return () => {
      window.removeEventListener('notifications-updated', updateNotifications);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'rounded-lg p-4 shadow-lg transition-all duration-300',
            {
              'bg-green-500 text-white': notification.type === 'success',
              'bg-red-500 text-white': notification.type === 'error',
              'bg-yellow-500 text-white': notification.type === 'warning',
              'bg-blue-500 text-white': notification.type === 'info',
            }
          )}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => NotificationService.remove(notification.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 