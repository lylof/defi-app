"use client";

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { globalSWRConfig } from '@/lib/services/SWRService';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * Fournisseur SWR pour configurer SWR globalement dans l'application
 * Applique la configuration globale à toutes les requêtes SWR
 * 
 * @example
 * <SWRProvider>
 *   <App />
 * </SWRProvider>
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={globalSWRConfig}>
      {children}
    </SWRConfig>
  );
} 