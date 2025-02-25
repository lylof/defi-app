"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useBadgeCheck } from "@/hooks/use-badge-check";
import { toast } from "sonner";

interface ParticipateButtonProps {
  challengeId: string;
}

export function ParticipateButton({ challengeId }: ParticipateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkBadges } = useBadgeCheck();

  const handleParticipate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/challenges/${challengeId}/participate`, {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Une erreur est survenue");
      }

      // Vérifier les badges après une participation réussie
      await checkBadges();
      
      toast.success("Vous êtes maintenant inscrit au défi !");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleParticipate}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Participer au défi"
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 