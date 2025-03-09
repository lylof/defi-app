"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Bot, Brain, Star } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface DifficultyBadgeProps {
  points: number;
  className?: string;
  showLabel?: boolean;
}

// Fonction pour déterminer la difficulté en fonction des points
const getDifficultyLevel = (points: number): {
  level: "débutant" | "intermédiaire" | "avancé" | "expert" | "élite";
  icon: React.ElementType;
  color: string;
} => {
  if (points < 100) {
    return { 
      level: "débutant", 
      icon: Bot, 
      color: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/20 dark:text-green-400"
    };
  } else if (points < 250) {
    return { 
      level: "intermédiaire", 
      icon: Zap, 
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/20 dark:text-blue-400"
    };
  } else if (points < 500) {
    return { 
      level: "avancé", 
      icon: Brain, 
      color: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-800/20 dark:text-purple-400"
    };
  } else if (points < 1000) {
    return { 
      level: "expert", 
      icon: Sparkles, 
      color: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-800/20 dark:text-amber-400"
    };
  } else {
    return { 
      level: "élite", 
      icon: Star, 
      color: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/20 dark:text-red-400"
    };
  }
};

export function DifficultyBadge({ points, className, showLabel = true }: DifficultyBadgeProps) {
  const { level, icon: Icon, color } = getDifficultyLevel(points);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "px-2 py-1 capitalize flex items-center gap-1", 
              color, 
              className
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {showLabel && <span>{level}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          Difficulté : <span className="font-medium capitalize">{level}</span>
          <div className="mt-1 text-muted-foreground">
            {points} points à gagner
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 