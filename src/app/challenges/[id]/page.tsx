"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trophy, Tag, Users, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/challenges/difficulty-badge";
import { TimeRemaining } from "@/components/challenges/time-remaining";
import { AnonymousParticipateButton } from "@/components/challenges/anonymous-participate-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyChallengeService } from "@/lib/services/daily-challenge-service";

interface ChallengePageProps {
  params: {
    id: string;
  };
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rediriger vers la version authentifiée si l'utilisateur est connecté
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(`/(dashboard)/challenges/${id}`);
    }
  }, [id, router, session, status]);

  // Récupérer les informations du défi
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoading(true);
      try {
        // Pour la démo, on récupère le défi du jour
        // Dans une implémentation complète, on récupérerait le défi spécifique
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

  // Pendant la vérification de session ou le chargement
  if (status === "loading" || (isLoading && !challenge)) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <div className="rounded-lg border shadow-sm p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="rounded-lg border shadow-sm p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne rien afficher (redirection en cours)
  if (status === "authenticated") {
    return null;
  }

  // Simuler un challenge actif pour la démo
  const isActive = true;

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/challenges" className="hover:underline">
              Défis
            </Link>
            <span>/</span>
            <span>{challenge?.title || "Défi"}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {challenge?.title || "Chargement..."}
            </h1>
            <div className="flex items-center gap-2">
              {challenge && (
                <>
                  <DifficultyBadge points={challenge.points} />
                  <div className="flex items-center gap-1 ml-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold">{challenge.points} points</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
            {challenge && (
              <>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{challenge.category?.name || "Non catégorisé"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participationsCount || 0} participants</span>
                </div>
                {challenge.endDate && (
                  <TimeRemaining endDate={new Date(challenge.endDate)} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">
                    {challenge?.description || "Chargement de la description..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Brief */}
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Brief</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">
                    {challenge?.brief || "Chargement du brief..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Ressources */}
            {challenge?.files && challenge.files.length > 0 && (
              <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Ressources</h2>
                  <div className="space-y-2">
                    {challenge.files.map((file: any) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut et participation */}
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="font-semibold mb-4">Statut</h2>
                {isActive ? (
                  <div className="space-y-4">
                    {/* Message pour les utilisateurs non connectés */}
                    <div className="text-sm space-y-2">
                      <p className="text-blue-600 dark:text-blue-300 font-medium">
                        Ce défi est ouvert à tous
                      </p>
                      <p className="text-muted-foreground">
                        Participez sans créer de compte ou 
                        <Link href="/login" className="text-primary hover:underline ml-1">
                          connectez-vous
                        </Link> pour suivre vos progrès.
                      </p>
                    </div>
                    
                    {/* Bouton de participation anonyme */}
                    <AnonymousParticipateButton 
                      challengeId={id} 
                      className="mt-4"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600">
                    Ce défi n'est plus disponible
                  </p>
                )}
              </div>
            </div>

            {/* Dates importantes */}
            {challenge && (
              <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                  <h2 className="font-semibold mb-4">Dates importantes</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">Début</p>
                      <p className="text-muted-foreground">
                        {new Date(challenge.startDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Fin</p>
                      <p className="text-muted-foreground">
                        {new Date(challenge.endDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appel à l'action pour créer un compte */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
              <h3 className="font-medium text-primary mb-2">Créez un compte pour plus de fonctionnalités</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Avec un compte, vous pouvez suivre votre progression, participer à des classements et gagner des badges.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={() => router.push("/register")}
              >
                Créer un compte gratuitement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 