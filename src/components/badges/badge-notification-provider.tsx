"use client";

import { Badge } from "@prisma/client";
import { createContext, useContext, useState, useCallback } from "react";
import { BadgeNotification } from "./badge-notification";

interface BadgeNotificationContextType {
  showBadgeNotification: (badge: Badge) => void;
}

const BadgeNotificationContext = createContext<BadgeNotificationContextType>({
  showBadgeNotification: () => {},
});

export function useBadgeNotification() {
  return useContext(BadgeNotificationContext);
}

export function BadgeNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Array<{ id: string; badge: Badge }>>([]);

  const showBadgeNotification = useCallback((badge: Badge) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, badge }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <BadgeNotificationContext.Provider value={{ showBadgeNotification }}>
      {children}
      {notifications.map(({ id, badge }) => (
        <BadgeNotification
          key={id}
          badge={badge}
          onClose={() => removeNotification(id)}
        />
      ))}
    </BadgeNotificationContext.Provider>
  );
} 