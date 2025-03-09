"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Award, 
  Star, 
  Clock, 
  Calendar, 
  BarChart4, 
  CircleCheck, 
  TimerOff, 
  Target,
  ListChecks
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface UserStatsProps {
  stats: {
    points: number;
    level: number;
    experience: number;
    nextLevelAt: number;
    rank: number | null;
    totalParticipants: number;
    challengesCompleted: number;
    challengesInProgress: number;
    badgesCount: number;
    successRate: number;
    memberSince: string;
  };
  recentChallenges?: {
    id: string;
    title: string;
    status: "completed" | "in_progress" | "abandoned";
    submittedAt?: string;
    evaluationScore?: number;
  }[];
}

export function UserStatsDashboard({ stats, recentChallenges = [] }: UserStatsProps) {
  const router = useRouter();
  
  // Calcul du pourcentage d'expérience pour le niveau suivant
  const experiencePercentage = Math.min(
    Math.round((stats.experience / stats.nextLevelAt) * 100),
    100
  );
  
  // Formatter la date de membre depuis
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Obtenir la couleur adaptée pour le taux de réussite
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-blue-600";
    if (rate >= 40) return "text-amber-600";
    return "text-red-600";
  };
  
  // Obtenir l'icône et la couleur pour le statut d'un défi
  const getChallengeStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CircleCheck, color: "text-green-600", text: "Terminé" };
      case "in_progress":
        return { icon: Clock, color: "text-blue-600", text: "En cours" };
      case "abandoned":
        return { icon: TimerOff, color: "text-red-600", text: "Abandonné" };
      default:
        return { icon: Target, color: "text-gray-600", text: "Inconnu" };
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Section des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Niveau et Expérience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">Niveau {stats.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.experience}/{stats.nextLevelAt} XP
              </span>
            </div>
            <Progress value={experiencePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.nextLevelAt - stats.experience} points pour le niveau suivant
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">
                  {stats.rank ? `#${stats.rank}` : "Non classé"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.points} points
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sur {stats.totalParticipants} participants
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de réussite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BarChart4 className="h-5 w-5 text-blue-500 mr-2" />
                <span className={`text-2xl font-bold ${getSuccessRateColor(stats.successRate)}`}>
                  {stats.successRate}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.challengesCompleted} défis terminés avec succès
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Aperçu des activités */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Défis récents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentChallenges.length > 0 ? (
                <div className="space-y-4">
                  {recentChallenges.map((challenge) => {
                    const { icon: StatusIcon, color, text } = getChallengeStatusInfo(challenge.status);
                    return (
                      <Link
                        href={`/challenges/${challenge.id}`}
                        key={challenge.id}
                        className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{challenge.title}</h3>
                            <div className="flex items-center mt-1">
                              <StatusIcon className={`h-4 w-4 ${color} mr-1`} />
                              <span className="text-sm text-muted-foreground">{text}</span>
                              {challenge.submittedAt && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  • Soumis le {new Date(challenge.submittedAt).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </div>
                          </div>
                          {challenge.evaluationScore !== undefined && (
                            <div className="font-semibold text-sm">
                              Score: {challenge.evaluationScore}/100
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <div className="text-center mt-4">
                    <Link 
                      href="/challenges" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir tous les défis
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Vous n'avez pas encore participé à des défis</p>
                  <Link
                    href="/challenges"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
                  >
                    Découvrir les défis
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CircleCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Défis terminés</span>
                  </div>
                  <span className="font-semibold">{stats.challengesCompleted}</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Défis en cours</span>
                  </div>
                  <span className="font-semibold">{stats.challengesInProgress}</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-purple-500 mr-2" />
                    <span>Badges gagnés</span>
                  </div>
                  <span className="font-semibold">{stats.badgesCount}</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Membre depuis</span>
                  </div>
                  <span className="font-semibold">{formatMemberSince(stats.memberSince)}</span>
                </li>
              </ul>
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => router.push('/badges')}
                  className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-medium text-sm flex items-center justify-center"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Voir mes badges
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 