"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Users, Star, ArrowRight, Eye } from "lucide-react";

/**
 * Types pour les propriétés du défi quotidien
 */
interface DailyChallengeProps {
  id: string;
  title: string;
  domain: string; // développement, design, community management, etc.
  description: string;
  difficulty: number; // 1-5
  participants: number;
  endTime: Date;
}

/**
 * Composant pour la carte du défi du jour
 * Élément central de la page d'accueil, conçu pour un impact visuel maximal
 * et une incitation à l'action immédiate
 */
export function DailyChallengeCard({
  id,
  title,
  domain,
  description,
  difficulty,
  participants,
  endTime,
}: DailyChallengeProps) {
  // État pour le compte à rebours
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  // Calcul du temps restant
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Terminé");
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);

  // Rendu des étoiles pour la difficulté
  const renderDifficulty = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < difficulty ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  // Détermine la couleur de fond pour le domaine
  const getDomainColor = () => {
    switch (domain.toLowerCase()) {
      case "développement":
      case "developpement":
      case "development":
        return "bg-domain-dev text-white";
      case "design":
        return "bg-domain-design text-white";
      case "community management":
        return "bg-domain-community text-white";
      case "devops":
        return "bg-domain-devops text-white";
      case "ia":
      case "ai":
        return "bg-domain-ai text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Card className="w-full max-w-3xl overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        {/* Bande colorée en haut basée sur le domaine */}
        <div className={`h-2 w-full ${getDomainColor().split(" ")[0]}`}></div>
        
        <div className="p-8">
          {/* En-tête avec badge du domaine et temps restant */}
          <div className="mb-6 flex items-center justify-between">
            <Badge className={getDomainColor()}>{domain}</Badge>
            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-300">
              <Clock className="mr-1 h-4 w-4" />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* Titre du défi */}
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          
          {/* Description concise */}
          <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
          
          {/* Informations sur le défi */}
          <div className="mb-8 flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Users className="mr-1 h-4 w-4" />
              <span>{participants} participants</span>
            </div>
            <div className="flex items-center space-x-1">
              {renderDifficulty()}
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button 
              className="flex-1 bg-primary hover:bg-primary-dark" 
              size="lg"
              onClick={() => window.location.href = `/challenges/${id}/participate`}
            >
              Participer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              className="flex-1 border-primary text-primary hover:bg-primary/10" 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = `/challenges/${id}`}
            >
              Voir le brief <Eye className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 