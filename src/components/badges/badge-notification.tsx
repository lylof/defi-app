"use client";

import { Badge } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre la fin de l'animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm flex items-center gap-4"
        >
          <div className="relative w-12 h-12">
            <Image
              src={badge.image}
              alt={badge.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Nouveau badge débloqué !</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {badge.name}
            </p>
          </div>
          <button aria-label="Fermer"
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Fermer la notification"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 