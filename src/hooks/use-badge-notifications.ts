import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBadgeNotifications = (userId?: string) => {
  const { data: notifications } = useQuery({
    queryKey: ["notifications", userId, "unread"],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 30000, // Vérifier toutes les 30 secondes
  });

  useEffect(() => {
    if (notifications?.length > 0) {
      notifications.forEach((notification: any) => {
        if (notification.type === "BADGE_EARNED") {
          toast.success(notification.title, {
            description: notification.content,
            duration: 5000,
          });
        }
      });

      // Marquer les notifications comme lues
      fetch("/api/notifications/mark-read", {
        method: "POST",
        body: JSON.stringify({
          ids: notifications.map((n: any) => n.id),
        }),
      });
    }
  }, [notifications]);

  return { notifications };
}; 