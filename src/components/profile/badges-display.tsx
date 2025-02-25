"use client";

import { useBadges } from "@/hooks/use-badges";
import Image from "next/image";
import { Badge } from "@/lib/badges/types";

export const BadgesDisplay = () => {
  const { badges, isLoading } = useBadges();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 h-32"
          />
        ))}
      </div>
    );
  }

  if (!badges.length) {
    return (
      <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">
          Vous n&apos;avez pas encore de badges. Participez aux défis pour en gagner !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map(({ badge, earnedAt }) => (
        <div
          key={badge.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-16 h-16">
              <Image
                src={badge.image}
                alt={badge.name}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-semibold text-center">{badge.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {badge.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Obtenu le {new Date(earnedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}; 