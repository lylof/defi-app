"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Crown } from "lucide-react";

/**
 * Types pour les participants au classement
 */
interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  position: number;
}

interface LeaderboardCompactProps {
  challengeId: string;
}

/**
 * Composant d'affichage du leaderboard compact pour le défi du jour
 * Affiche les 5 meilleurs participants de manière visuellement engageante
 */
export function LeaderboardCompact({ challengeId }: LeaderboardCompactProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupération des données du leaderboard
  useEffect(() => {
    // Simulation de données pour la démo
    // À remplacer par un appel API réel
    setTimeout(() => {
      setParticipants([
        { id: "1", name: "Marie Dupont", avatarUrl: "", score: 98, position: 1 },
        { id: "2", name: "Thomas Leroy", avatarUrl: "", score: 95, position: 2 },
        { id: "3", name: "Sophie Martin", avatarUrl: "", score: 92, position: 3 },
        { id: "4", name: "Lucas Bernard", avatarUrl: "", score: 88, position: 4 },
        { id: "5", name: "Emma Petit", avatarUrl: "", score: 85, position: 5 },
      ]);
      setIsLoading(isLoading);
    }, 1000);

    // Code pour l'API réelle
    // const fetchLeaderboard = async () => {
    //   try {
    //     const response = await fetch(`/api/challenges/${challengeId}/leaderboard?limit=5`);
    //     const data = await response.json();
    //     setParticipants(data);
    //   } catch (error) {
    //     console.error("Erreur lors de la récupération du leaderboard", error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchLeaderboard();
  }, [challengeId]);

  // Fonction pour obtenir les couleurs selon la position
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1:
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          icon: <Crown className="h-5 w-5 text-yellow-500" />,
        };
      case 2:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          icon: <Trophy className="h-4 w-4 text-gray-500" />,
        };
      case 3:
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          icon: <Trophy className="h-4 w-4 text-amber-500" />,
        };
      default:
        return {
          bgColor: "bg-white",
          textColor: "text-gray-700",
          icon: null,
        };
    }
  };

  return (
    <Card className="w-full max-w-md border shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Top 5 Participants</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {participants.map((participant) => {
              const { bgColor, textColor, icon } = getPositionStyles(participant.position);
              return (
                <li
                  key={participant.id}
                  className={`flex items-center justify-between rounded-lg p-3 ${bgColor} transition-all hover:scale-[1.02] hover:shadow-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center font-bold">
                      {icon ? icon : <span className={textColor}>{participant.position}</span>}
                    </div>
                    <Avatar className="border">
                      <AvatarImage src={participant.avatarUrl} />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{participant.name}</span>
                  </div>
                  <div className="text-right font-semibold text-blue-600">
                    {participant.score} pts
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 