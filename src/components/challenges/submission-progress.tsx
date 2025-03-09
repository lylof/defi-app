"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubmissionProgressProps {
  currentSubmissions: number;
  maxSubmissions: number | null;
  className?: string;
}

export function SubmissionProgress({ 
  currentSubmissions,
  maxSubmissions,
  className 
}: SubmissionProgressProps) {
  // Si maxSubmissions est null, c'est illimité
  if (!maxSubmissions) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span>Soumissions</span>
          <span className="font-medium">{currentSubmissions} / ∞</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Nombre de soumissions illimité
        </div>
      </div>
    );
  }
  
  // Calculer le pourcentage
  const percentage = Math.min((currentSubmissions / maxSubmissions) * 100, 100);
  
  // Déterminer la couleur de la barre de progression
  const getProgressColor = () => {
    if (currentSubmissions >= maxSubmissions) return "text-red-500";
    if (currentSubmissions >= maxSubmissions * 0.75) return "text-amber-500";
    return "text-emerald-500";
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>Soumissions restantes</span>
        <span className={cn("font-medium", getProgressColor())}>
          {Math.max(maxSubmissions - currentSubmissions, 0)} / {maxSubmissions}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={cn(
          currentSubmissions >= maxSubmissions ? "bg-red-500" :
          currentSubmissions >= maxSubmissions * 0.75 ? "bg-amber-500" :
          "bg-emerald-500"
        )}
      />
      <div className="text-xs text-muted-foreground">
        {currentSubmissions >= maxSubmissions ? (
          <span className="text-red-500">Limite de soumissions atteinte</span>
        ) : (
          <span>
            Il vous reste {maxSubmissions - currentSubmissions} soumission{maxSubmissions - currentSubmissions !== 1 && "s"}
          </span>
        )}
      </div>
    </div>
  );
} 