"use client";

import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

/**
 * Hook pour gérer le thème de l'application
 * Utilise next-themes sous le capot
 * @returns Objet contenant les fonctions et états liés au thème
 */
export const useTheme = () => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Mettre à jour isDark quand le thème résolu change
    setIsDark(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return {
    theme: theme as 'light' | 'dark' | 'system',
    setTheme,
    isDark,
    toggleTheme
  };
}; 