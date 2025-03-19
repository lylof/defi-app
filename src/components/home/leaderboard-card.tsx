"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trophy, Medal, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Participant = {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  rank: number;
  change?: "up" | "down" | "same";
};

/**
 * Carte de classement avec animations fluides
 * Affiche le top 5 des participants au challenge
 */
interface LeaderboardCardProps {
  challengeId: string;
}

/**
 * Composant de classement avec design Apple-like
 * Animé et réactif pour une expérience utilisateur moderne
 */
export function LeaderboardCard({ challengeId }: LeaderboardCardProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Simuler un délai réseau pour démontrer le squelette de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // TODO: Remplacer par un appel API réel quand disponible
        const mockData: Participant[] = [
          { id: "1", name: "Sophie Martin", points: 120, rank: 1, change: "up", avatar: "/images/avatars/avatar-1.png" },
          { id: "2", name: "Thomas Dubois", points: 105, rank: 2, change: "same", avatar: "/images/avatars/avatar-2.png" },
          { id: "3", name: "Emma Leroy", points: 98, rank: 3, change: "down", avatar: "/images/avatars/avatar-3.png" },
          { id: "4", name: "Lucas Petit", points: 89, rank: 4, avatar: "/images/avatars/avatar-4.png" },
          { id: "5", name: "Chloé Durand", points: 85, rank: 5, avatar: "/images/avatars/avatar-5.png" },
        ];
        
        setParticipants(mockData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement du leaderboard:", err);
        setError("Impossible de charger le classement");
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeId) {
      fetchLeaderboard();
    }
  }, [challengeId]);

  // Animation variants pour les items du classement
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="rounded-full bg-yellow-50 dark:bg-yellow-500/10 p-1.5" aria-hidden="true">
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
        );
      case 2:
        return (
          <div className="rounded-full bg-gray-100 dark:bg-gray-500/10 p-1.5" aria-hidden="true">
            <Medal className="h-4 w-4 text-gray-500" />
          </div>
        );
      case 3:
        return (
          <div className="rounded-full bg-amber-50 dark:bg-amber-500/10 p-1.5" aria-hidden="true">
            <Medal className="h-4 w-4 text-amber-500" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-50 dark:bg-gray-700/40 p-1.5 flex items-center justify-center min-w-8 min-h-8" aria-hidden="true">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {rank}
            </span>
          </div>
        );
    }
  };

  const getChangeIcon = (change?: "up" | "down" | "same") => {
    switch (change) {
      case "up":
        return (
          <span className="flex items-center text-green-500 text-xs" aria-label="Progression">
            <ArrowUp className="h-3 w-3 mr-0.5" aria-hidden="true" />
            <span className="sr-only">En progression</span>
          </span>
        );
      case "down":
        return (
          <span className="flex items-center text-red-500 text-xs" aria-label="Régression">
            <ArrowDown className="h-3 w-3 mr-0.5" aria-hidden="true" />
            <span className="sr-only">En régression</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-400 text-xs" aria-label="Stable">
            <Minus className="h-3 w-3 mr-0.5" aria-hidden="true" />
            <span className="sr-only">Position stable</span>
          </span>
        );
    }
  };

  // Rendu lorsque les données sont en cours de chargement
  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  // Rendu en cas d'erreur
  if (error) {
    return (
      <Card className="w-full h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-gray-900 dark:text-white">Classement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Si participants n'est pas un tableau ou est vide, afficher un message approprié
  if (!Array.isArray(participants) || participants.length === 0) {
    return (
      <Card className="w-full h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-gray-900 dark:text-white">Classement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucun participant pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  // Fonction pour déterminer la couleur de médaille en fonction du rang
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-300 to-yellow-500";
      case 2: return "from-gray-300 to-gray-400";
      case 3: return "from-amber-300 to-amber-600";
      default: return "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600";
    }
  };

  return (
    <Card className="w-full h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Bannière de titre avec dégradé subtil */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
      
      <CardHeader className="pt-6 pb-2">
        <CardTitle className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
          Classement
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {participants.map((participant, index) => (
          <motion.div 
            key={participant.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            whileHover={{ scale: 1.01, x: 2 }}
          >
            <div className="flex items-center gap-3">
              {/* Badge de rang avec dégradé selon la position */}
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(participant.rank)} flex items-center justify-center shadow-sm`}>
              {participant.rank <= 3 ? (
                  participant.rank === 1 ? (
                    <Trophy className="h-4 w-4 text-white" />
                  ) : (
                    <Medal className="h-4 w-4 text-white" />
                  )
                ) : (
                  <span className="text-sm font-bold text-gray-700 dark:text-white">{participant.rank}</span>
                )}
              </div>
              
              {/* Avatar avec anneau coloré pour les 3 premiers */}
              <div className={`relative ${participant.rank <= 3 ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 rounded-full ' + (
                participant.rank === 1 ? 'ring-yellow-500/70' :
                participant.rank === 2 ? 'ring-gray-400/70' :
                'ring-amber-500/70'
              ) : ''}`}>
                <Avatar className="h-8 w-8 border border-gray-100 dark:border-gray-800">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback className="bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
                    {participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Indicateur de changement de position */}
                {participant.change && (
                  <div className={`absolute -bottom-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center ${
                    participant.change === 'up' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : participant.change === 'down' 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {participant.change === 'up' && (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    )}
                    {participant.change === 'down' && (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    {participant.change === 'same' && (
                      <Minus className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 tracking-tight">
                {participant.name}
              </div>
            </div>
            
            {/* Points avec badge pour les 3 premiers */}
            <div className={`text-sm font-medium ${
              participant.rank === 1 
                ? 'text-[var(--primary)]' 
                : participant.rank <= 3 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-400'
            } flex items-center`}>
              {participant.rank <= 3 && (
                <Badge variant={participant.rank === 1 ? "default" : "secondary"} className="mr-2 py-0 px-1.5 h-5">
                  {participant.rank === 1 ? "+20%" : participant.rank === 2 ? "+10%" : "+5%"}
                </Badge>
              )}
              {participant.points} pts
            </div>
          </motion.div>
        ))}
        
        {/* Bouton pour voir le classement complet */}
        <motion.div 
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="ghost" 
            className="w-full text-[var(--primary)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] rounded-lg h-9 text-sm"
            aria-label="Voir classement complet"
          >
            Voir classement complet
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Composant squelette pour le chargement
function LeaderboardSkeleton() {
  return (
    <Card className="w-full h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 