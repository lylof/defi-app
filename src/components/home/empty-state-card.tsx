"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

/**
 * État vide repensé avec illustrations minimalistes
 * Composant pour afficher un état vide avec style Apple 
 * Design épuré, animations subtiles et illustrations élégantes
 */
export function EmptyStateCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full border-0 bg-white/90 dark:bg-gray-950/90 shadow-sm backdrop-blur-sm transition-all duration-300">
        <CardContent className="flex flex-col items-center justify-center text-center p-8 h-full">
          <motion.div 
            className="mb-5 text-gray-400/90"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-2.5">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
} 