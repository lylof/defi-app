import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LevelProgress } from "@/lib/levels/types";

export function useLevelProgress() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/levels/progress`);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la progression");
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error("Erreur lors du chargement de la progression:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
} 