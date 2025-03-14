"use client";

import { useState, useEffect } from "react";
import { DailyChallengeCard } from "./daily-challenge-card";
import { LeaderboardCompact } from "./leaderboard-compact";
import { DailyChallengeService, DailyChallenge } from "@/lib/services/daily-challenge-service";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Conteneur principal pour la page d'accueil
 * Organise les composants et gère la récupération des données
 */
export function HomeContainer() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération du défi du jour au chargement
  useEffect(() => {
    const fetchDailyChallenge = async () => {
      try {
        setIsLoading(true);
        const data = await DailyChallengeService.getDailyChallenge();
        setDailyChallenge(data);
        setError(null);
      } catch (err) {
        setError("Impossible de récupérer le défi du jour");
        console.error("Erreur lors de la récupération du défi du jour:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyChallenge();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 pb-16 pt-8 dark:from-blue-950 dark:to-gray-900">
      {/* En-tête discret */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
          Défi du Jour
        </h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-400">
          Participez sans inscription et montrez vos compétences dans le domaine du numérique
        </p>
      </div>

      {/* Contenu principal: carte de défi et leaderboard côte à côte en desktop */}
      <div className="grid w-full max-w-6xl gap-8 md:grid-cols-3">
        {/* Carte du défi (2/3 de l'espace) */}
        <div className="md:col-span-2">
          {isLoading ? (
            <ChallengeSkeleton />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/30">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          ) : dailyChallenge ? (
            <DailyChallengeCard
              id={dailyChallenge.id}
              title={dailyChallenge.title}
              domain={dailyChallenge.domain}
              description={dailyChallenge.description}
              difficulty={dailyChallenge.difficulty}
              participants={dailyChallenge.participants}
              endTime={new Date(dailyChallenge.endTime)}
            />
          ) : null}
        </div>

        {/* Leaderboard compact (1/3 de l'espace) */}
        <div className="md:col-span-1">
          {isLoading ? (
            <LeaderboardSkeleton />
          ) : dailyChallenge ? (
            <LeaderboardCompact challengeId={dailyChallenge.id} />
          ) : null}
        </div>
      </div>

      {/* Indicateur de participation active */}
      {!isLoading && dailyChallenge && (
        <div className="mt-6 animate-pulse rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
          {dailyChallenge.participants} personnes participent actuellement
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton pour le chargement de la carte de défi
 */
function ChallengeSkeleton() {
  return (
    <div className="rounded-lg border p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="mb-4 h-10 w-3/4" />
      <Skeleton className="mb-6 h-20 w-full" />
      <div className="mb-8 flex items-center space-x-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour le chargement du leaderboard
 */
function LeaderboardSkeleton() {
  return (
    <div className="rounded-lg border p-6 shadow">
      <Skeleton className="mb-6 h-8 w-48" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
} 