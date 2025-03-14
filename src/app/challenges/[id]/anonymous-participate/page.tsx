"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnonymousSubmissionForm } from "@/components/challenges/anonymous-submission-form";
import { DailyChallengeService } from "@/lib/services/daily-challenge-service";
import { AnonymousParticipationService } from "@/lib/services/anonymous-participation-service";

interface AnonymousParticipatePageProps {
  params: {
    id: string;
  };
}

/**
 * Page permettant aux utilisateurs non connectés de participer à un défi
 * Inclut le formulaire de soumission anonyme et des informations sur le défi
 */
export default function AnonymousParticipatePage({ params }: AnonymousParticipatePageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasParticipation, setHasParticipation] = useState(false);

  // Récupération des informations du défi
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoading(true);
      try {
        // Pour la démo, on récupère le défi du jour
        // Dans une implémentation complète, on récupérerait les détails du défi spécifique
        const data = await DailyChallengeService.getDailyChallenge();
        setChallenge(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du défi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  // Vérifier si l'utilisateur a déjà une participation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const participation = AnonymousParticipationService.getParticipationData(id);
      setHasParticipation(!!participation);
    }
  }, [id]);

  // Rediriger les utilisateurs connectés vers la page de participation normale
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(`/challenges/${id}/participate`);
    }
  }, [status, session, id, router]);

  // Ne rien afficher pendant la vérification de session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, on ne devrait pas voir cette page (redirection en cours)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {isLoading ? "Chargement..." : challenge?.title || "Participer au défi"}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300">
          {isLoading
            ? "Chargement des informations du défi..."
            : challenge?.description || "Relevez ce défi et montrez vos compétences !"}
        </p>

        {/* Avertissement sur le mode anonyme */}
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
          <h3 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
            Mode participation anonyme
          </h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-300">
            Vous participez sans compte utilisateur. Vos progrès sont sauvegardés uniquement 
            sur cet appareil et pourraient être perdus si vous effacez votre historique. 
            Pour une expérience complète avec suivi de progression et badges, 
            <Button 
              variant="link" 
              className="p-0 text-sm font-medium text-primary"
              onClick={() => router.push(`/login?callbackUrl=/challenges/${id}/participate`)}
            >
              créez un compte ou connectez-vous
            </Button>.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Instructions du défi
        </h2>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isLoading ? (
            <p>Chargement des instructions...</p>
          ) : (
            <>
              <p>
                {challenge?.description || "Description du défi non disponible."}
              </p>
              <h3>Objectifs</h3>
              <ul>
                <li>Comprendre les besoins et exigences du projet</li>
                <li>Proposer une solution technique adaptée</li>
                <li>Documenter votre approche et vos choix</li>
              </ul>
              <h3>Critères d'évaluation</h3>
              <ul>
                <li>Qualité de la solution proposée</li>
                <li>Clarté de l'explication</li>
                <li>Respect des bonnes pratiques</li>
              </ul>
            </>
          )}
        </div>
      </div>

      <AnonymousSubmissionForm challengeId={id} />
    </div>
  );
} 