"use client";

import React from "react";
import Link from "next/link";
import { format, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import { Trophy, Clock, Tag, Users, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Challenge, Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChallengeCardProps {
  challenge: Challenge & {
    category: Category;
    _count: {
      participations: number;
    };
  };
  className?: string;
}

export function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const isActive = isAfter(new Date(challenge.endDate), new Date());
  
  // Calculer le temps restant ou écoulé
  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const diffTime = Math.abs(endDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return (
    <div 
      className={cn(
        "rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden",
        className
      )}
    >
      {/* Badge de statut (visible en haut à droite) */}
      <div className="relative">
        <div className="absolute top-0 right-0 m-2">
          {isActive ? (
            <Badge className="bg-green-500/80 hover:bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Actif
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-500/80 hover:bg-gray-500 text-white">
              <XCircle className="h-3 w-3 mr-1" />
              Terminé
            </Badge>
          )}
        </div>
        
        {/* Contenu principal */}
        <div className="p-6 pt-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">
                <Link href={`/challenges/${challenge.id}`} className="hover:underline">
                  {challenge.title}
                </Link>
              </h3>
              
              {/* Catégorie et points */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>{challenge.category.name}</span>
                <span className="text-gray-300">•</span>
                <Trophy className="h-4 w-4" />
                <span>{challenge.points} points</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
          
          {/* Informations complémentaires */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground border-t pt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {isActive 
                      ? `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`
                      : `Terminé depuis ${diffDays} jour${diffDays > 1 ? 's' : ''}`
                    }
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {format(endDate, "dd MMMM yyyy", { locale: fr })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{challenge._count.participations} participant{challenge._count.participations > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 