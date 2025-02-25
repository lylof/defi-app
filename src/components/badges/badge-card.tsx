"use client";

import { Badge } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";

interface BadgeCardProps {
  badge: Badge;
  isNew?: boolean;
  earnedAt?: Date;
}

export function BadgeCard({ badge, isNew, earnedAt }: BadgeCardProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={badge.image}
          alt={badge.name}
          fill
          className="object-contain"
        />
      </div>
      
      <h3 className="text-lg font-semibold text-center mb-2">{badge.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
        {badge.description}
      </p>
      
      {earnedAt && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Obtenu le {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}

      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
        >
          Nouveau !
        </motion.div>
      )}
    </motion.div>
  );
} 