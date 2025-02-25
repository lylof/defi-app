"use client";

import { LEVEL_REQUIREMENTS } from "@/lib/levels/types";
import { useLevelProgress } from "@/hooks/use-level-progress";
import { Award, Lock, Star, Unlock } from "lucide-react";

export function LevelRewards() {
  const { progress } = useLevelProgress();

  if (!progress) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Récompenses de niveau</h3>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {LEVEL_REQUIREMENTS.map((levelReq) => {
          const isUnlocked = progress.currentLevel >= levelReq.level;
          
          return (
            <div
              key={levelReq.level}
              className={`
                p-4 rounded-lg border transition-colors
                ${isUnlocked
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Niveau {levelReq.level}</h4>
                {isUnlocked ? (
                  <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                {levelReq.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm gap-2"
                  >
                    {reward.type === "BADGE" && (
                      <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                    {reward.type === "POINTS" && (
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                    {reward.type === "FEATURE" && (
                      <Unlock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                    <span className={isUnlocked ? "" : "text-gray-500 dark:text-gray-400"}>
                      {reward.description}
                      {reward.value ? ` (${reward.value} points)` : ""}
                    </span>
                  </div>
                ))}
              </div>

              {!isUnlocked && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {levelReq.experienceRequired - progress.currentExperience} XP restants
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 