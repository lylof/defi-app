"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Carte de défi compacte style bento avec micro-interactions élégantes
 * Inspirée des UI cards d'Apple avec espacement parfait et hiérarchie visuelle claire
 */
export function CompactChallengeCard({
  title,
  domain,
  difficulty,
  timeLeft,
  participants,
  points,
  icon
}: {
  title: string;
  domain: string;
  difficulty: string;
  timeLeft: string;
  participants: number;
  points: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="h-full border-0 bg-white/80 dark:bg-gray-950/80 shadow-sm backdrop-blur-sm transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gray-100/80 dark:bg-gray-800/60 flex items-center justify-center">
              {icon}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{domain}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">{title}</h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-5">
          <span>{participants} participants</span>
          <span>{points} points</span>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-between py-2 px-3 h-auto text-sm border border-gray-200/80 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/60 rounded-lg group"
            size="sm"
          >
            <span>Voir le défi</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
} 