import { useCallback } from "react";
import { BadgeService } from "@/lib/badges/badge-service";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useBadgeNotification } from "@/components/badges/badge-notification-provider";
import { db } from "@/lib/db";

export const useBadgeCheck = () => {
  const { data: session } = useSession();
  const { showBadgeNotification } = useBadgeNotification();

  const checkBadges = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      await BadgeService.checkAndAwardBadges(session.user.id);

      // Récupérer les badges récemment obtenus
      const recentBadges = await db.badge.findMany({
        where: {
          userBadges: {
            some: {
              userId: session.user.id,
              earnedAt: {
                gte: new Date(Date.now() - 5000) // Badges obtenus dans les 5 dernières secondes
              }
            }
          }
        }
      });

      // Afficher une notification pour chaque nouveau badge
      recentBadges.forEach((badge) => {
        showBadgeNotification(badge);
      });
    } catch (error) {
      console.error("Erreur lors de la vérification des badges:", error);
      toast.error("Une erreur est survenue lors de la vérification des badges");
    }
  }, [session?.user?.id, showBadgeNotification]);

  return { checkBadges };
}; 