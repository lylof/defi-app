"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DailyChallenge } from "@/lib/services/daily-challenge-service";
import { Clock, CheckCircle, Award, Users, ArrowRight, Eye, Target } from "lucide-react";

/**
 * Carte principale du défi dans un style bento raffiné
 * Inspiré des designs modernes d'Apple avec des bordures légères,
 * espaces négatifs savamment dosés, et micro-interactions élégantes
 * Optimisé pour l'accessibilité avec une structure sémantique et des attributs ARIA appropriés
 */
export function BentoMainCard({ 
  challenge, 
  timeLeft, 
  timePercentage, 
  timeColor 
}: { 
  challenge: DailyChallenge; 
  timeLeft: string; 
  timePercentage: number; 
  timeColor: string;
}) {
  // Arrondi pour garantir une valeur entière pour l'attribut aria-valuenow
  const progressValue = Math.round(timePercentage);
  
  return (
    <Card 
      className="overflow-hidden h-full border-0 bg-white/80 dark:bg-gray-950/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md"
      role="region"
      aria-label={`Défi du jour: ${challenge.title}`}
    >
      <CardContent className="p-0">
        {/* Bannière supérieure avec dégradé subtil */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary-light)] to-[var(--primary)]"></div>
        
        {/* En-tête avec info temps et domaine */}
        <div className="p-8 pb-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-md bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10"
                aria-hidden="true"
              >
                <Target className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {challenge.domain}
              </span>
              <div 
                className="h-1 w-1 rounded-full bg-gray-300/80 dark:bg-gray-700/80"
                aria-hidden="true"
              ></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Intermédiaire
              </span>
            </div>
            
            <motion.div 
              className="flex items-center px-3.5 py-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/60 text-sm font-medium group"
              whileHover={{ 
                scale: 1.03,
                backgroundColor: "rgba(var(--card-rgb), 0.95)" 
              }}
              transition={{ duration: 0.2 }}
              role="timer"
              aria-label="Temps restant pour ce défi"
            >
              <Clock className="h-3.5 w-3.5 mr-2 text-[var(--primary)] group-hover:rotate-12 transition-transform" aria-hidden="true" />
              <span className="font-mono text-gray-800 dark:text-gray-200 tracking-tight">{timeLeft}</span>
            </motion.div>
          </div>
          
          <h2 
            className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4 tracking-tight leading-tight"
            id="challenge-title"
          >
            {challenge.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base max-w-3xl">
            {challenge.description}
          </p>
        </div>

        <div className="px-8">
          {/* Barre de progression avec animation fluide et attributs d'accessibilité */}
          <div 
            className="mb-8"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressValue}
            aria-label={`${progressValue}% du temps restant`}
          >
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Temps restant</span>
              <span>{progressValue}%</span>
            </div>
            <div className="h-[4px] w-full bg-gray-100/80 dark:bg-gray-800/60 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  width: `${timePercentage}%`,
                  background: `linear-gradient(to right, ${timeColor}, ${timeColor}80)`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${timePercentage}%` }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            </div>
          </div>
          
          {/* Section des objectifs avec espacement parfait et effet de profondeur */}
          <section 
            className="mb-8 bg-gradient-to-br from-gray-50/90 to-gray-50/70 dark:from-gray-900/70 dark:to-gray-900/50 rounded-xl p-7 shadow-sm"
            aria-labelledby="objectives-heading"
          >
            <h3 
              className="font-medium text-gray-900 dark:text-white mb-4 flex items-center"
              id="objectives-heading"
            >
              <Target className="h-4 w-4 mr-2 text-[var(--primary)]" aria-hidden="true" />
              Objectifs du défi
            </h3>
            <ul className="space-y-3.5" aria-label="Liste des objectifs du défi">
              <motion.li 
                className="flex gap-3"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="rounded-full h-5 w-5 bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Créer un design responsive qui s'adapte à toutes les tailles d'écran
                </span>
              </motion.li>
              <motion.li 
                className="flex gap-3"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="rounded-full h-5 w-5 bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Implémenter les principes UI modernes pour une meilleure expérience utilisateur
                </span>
              </motion.li>
              <motion.li 
                className="flex gap-3"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="rounded-full h-5 w-5 bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Optimiser les performances pour une fluidité maximale sur tous les appareils
                </span>
              </motion.li>
            </ul>
          </section>
        </div>
        
        {/* Section inférieure avec distribution spatiale harmonieuse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-8 pb-8">
          {/* Statistiques avec effet de légère élévation au survol */}
          <div className="flex items-center justify-start gap-6">
            <motion.div 
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-full h-9 w-9 bg-[var(--primary)]/10 flex items-center justify-center" aria-hidden="true">
                <Award className="h-4.5 w-4.5 text-[var(--primary)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Récompense</span>
                <span className="font-medium text-gray-900 dark:text-white">20 points</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-full h-9 w-9 bg-gray-100/80 dark:bg-gray-800/60 flex items-center justify-center" aria-hidden="true">
                <Users className="h-4.5 w-4.5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Participants</span>
                <span className="font-medium text-gray-900 dark:text-white">{challenge.participants} actifs</span>
              </div>
            </motion.div>
          </div>
          
          {/* Boutons d'action avec transitions élégantes et effet 3D subtil */}
          <div className="flex gap-3 mt-auto">
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button 
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg h-11 font-medium shadow-sm hover:shadow-md transition-all"
                aria-label="Participer à ce défi"
              >
                <span>Participer</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button 
                variant="outline" 
                className="w-full border-gray-200 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/60 rounded-lg h-11 font-medium"
                aria-label="Voir les détails du défi"
              >
                <span>Détails</span>
                <Eye className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 