"use client";

import { useLevelProgress } from "@/hooks/use-level-progress";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LevelProgress() {
  const { progress, isLoading, error } = useLevelProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400">
        Une erreur est survenue lors du chargement de la progression
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Niveau {progress.currentLevel}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.currentExperience} / {progress.nextLevelExperience} XP
          </p>
        </div>
        <div className="text-2xl font-bold text-primary">
          {Math.round(progress.progress)}%
        </div>
      </div>

      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-300">
        {progress.nextLevelExperience - progress.currentExperience} XP jusqu'au niveau {progress.currentLevel + 1}
      </div>
    </div>
  );
} 