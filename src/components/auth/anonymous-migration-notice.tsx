"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnonymousMigrationService } from "@/lib/services/anonymous-migration-service";

/**
 * Composant qui affiche une notification si des participations anonymes sont détectées
 * et permet à l'utilisateur de les migrer vers son compte
 */
export function AnonymousMigrationNotice() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier s'il existe des participations anonymes à migrer
    if (typeof window !== "undefined") {
      AnonymousMigrationService.notifyIfParticipationsExist();
    }
  }, []);

  const handleMigrate = async () => {
    try {
      const migratedCount = await AnonymousMigrationService.migrateAnonymousParticipations();
      if (migratedCount > 0) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la migration:", error);
    }
  };

  return null; // Ce composant ne rend rien car il utilise uniquement les toasts
} 