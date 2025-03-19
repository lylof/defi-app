"use client";

import { useEffect, useState } from "react";

/**
 * Composant SkipLink pour l'accessibilité au clavier
 * Permet aux utilisateurs de clavier de sauter directement vers le contenu principal
 * Le lien reste caché visuellement jusqu'à ce qu'il reçoive le focus
 */
export function SkipLink() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white 
                focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-[var(--primary)]"
    >
      Aller au contenu principal
    </a>
  );
} 