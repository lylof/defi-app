"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AnonymousParticipationService } from "@/lib/services/anonymous-participation-service";

interface AnonymousParticipateButtonProps {
  challengeId: string;
  className?: string;
}

/**
 * Bouton permettant la participation anonyme aux défis
 * Permet aux utilisateurs non connectés de participer et gère la transition vers l'inscription
 */
export function AnonymousParticipateButton({ 
  challengeId, 
  className = "" 
}: AnonymousParticipateButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasParticipation, setHasParticipation] = useState(false);
  const [progress, setProgress] = useState(0);

  // Vérifier si l'utilisateur participe déjà au défi
  useEffect(() => {
    if (typeof window !== "undefined") {
      const participation = AnonymousParticipationService.getParticipationData(challengeId);
      setHasParticipation(!!participation);
      setProgress(participation?.progress || 0);
    }
  }, [challengeId]);

  // Si l'utilisateur est connecté, on n'affiche pas ce bouton
  if (session) {
    return null;
  }

  const handleParticipate = async () => {
    try {
      setIsLoading(true);
      
      // Commencer une nouvelle participation ou récupérer celle existante
      const participation = AnonymousParticipationService.startParticipation(challengeId);
      
      setHasParticipation(true);
      setProgress(participation.progress);
      
      // Rediriger vers la page de participation
      router.push(`/challenges/${challengeId}/anonymous-participate`);
      toast.success("Vous participez maintenant au défi !");
    } catch (err) {
      console.error("Erreur lors de la participation anonyme:", err);
      toast.error("Une erreur est survenue lors de la participation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/challenges/${challengeId}/anonymous-participate`);
  };

  return (
    <div className={className}>
      {hasParticipation ? (
        <div className="space-y-2">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div 
              className="absolute h-full bg-primary" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progress}% complété</span>
          </div>
          <Button 
            onClick={handleContinue}
            className="mt-2 w-full bg-primary hover:bg-primary-dark"
          >
            Continuer votre participation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleParticipate}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Préparation...
            </>
          ) : (
            <>
              Participer sans inscription <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
      <div className="mt-2 text-center text-xs text-gray-500">
        <p>Aucune inscription requise. Vos progrès seront sauvegardés localement sur cet appareil.</p>
      </div>
    </div>
  );
} 