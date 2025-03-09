"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TimeRemainingProps {
  endDate: Date;
  className?: string;
}

export function TimeRemaining({ endDate, className }: TimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(isPast(endDate));
  
  useEffect(() => {
    // Fonction pour calculer et formater le temps restant
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(endDate);
      
      if (isPast(end)) {
        setIsExpired(true);
        setTimeRemaining("Défi terminé");
        return;
      }
      
      const days = differenceInDays(end, now);
      const hours = differenceInHours(end, now) % 24;
      const minutes = differenceInMinutes(end, now) % 60;
      
      // Marquer comme urgent s'il reste moins de 24h
      setIsUrgent(days === 0 && hours < 24);
      
      if (days > 0) {
        setTimeRemaining(`${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''} restantes`);
      } else {
        setTimeRemaining(`${minutes} minute${minutes > 1 ? 's' : ''} restantes`);
      }
    };
    
    // Calculer immédiatement
    calculateTimeRemaining();
    
    // Puis mettre à jour toutes les minutes
    const interval = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [endDate]);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isExpired ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-500 font-medium">{timeRemaining}</span>
        </>
      ) : (
        <>
          <Clock className={cn("h-4 w-4", isUrgent ? "text-amber-500" : "text-muted-foreground")} />
          <span className={cn(isUrgent ? "text-amber-500 font-medium" : "text-muted-foreground")}>
            {timeRemaining}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            (jusqu'au {format(new Date(endDate), "d MMMM yyyy", { locale: fr })})
          </span>
        </>
      )}
    </div>
  );
} 