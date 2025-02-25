import { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Badge, UserBadge } from "@/lib/badges/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useBadges = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: badges, isLoading } = useQuery<UserBadge[]>({
    queryKey: ["badges", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const res = await fetch("/api/badges");
      if (!res.ok) throw new Error("Failed to fetch badges");
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const checkBadges = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch("/api/badges/check", {
        method: "POST",
      });
      
      if (!res.ok) throw new Error("Failed to check badges");
      
      const newBadges = await res.json();
      
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["badges"] });
        newBadges.forEach((badge: Badge) => {
          toast.success(`🏆 Nouveau badge débloqué : ${badge.name}`, {
            description: badge.description,
          });
        });
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  }, [session?.user?.id, queryClient]);

  // Vérifier les badges après chaque action importante
  useEffect(() => {
    if (session?.user?.id) {
      checkBadges();
    }
  }, [session?.user?.id, checkBadges]);

  return {
    badges: badges || [],
    isLoading,
    checkBadges,
  };
}; 