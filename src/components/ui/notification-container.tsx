"use client";

import { useEffect, useState } from 'react';
import { NotificationService, NotificationDetails } from '@/lib/services/notification-service';
import { cn } from '@/lib/utils';
import React from "react";
import { Notification } from "@/lib/services/notification-service";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AccessibleIcon } from "@/lib/utils/accessibility";

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
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-start max-w-sm"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{notification.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {notification.message}
              </p>
            </div>
            <button aria-label="Fermer"
              onClick={() => NotificationService.remove(notification.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Fermer la notification"
            >
              <AccessibleIcon>
                <X className="h-5 w-5" />
              </AccessibleIcon>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 