/**
 * Helper d'initialisation pour le mode serveur
 * Ce module est chargé uniquement côté serveur et permet de réaliser
 * des actions d'initialisation lors du démarrage du serveur
 */

import { initializeAccounts } from "./initialize-accounts";

// Variable pour suivre si l'initialisation a déjà été effectuée
let serverInitialized = false;

/**
 * Méthode d'initialisation du serveur
 * Cette méthode est appelée dans les composants serveur lors du démarrage
 */
export async function initializeServer() {
  // Éviter les initialisations multiples
  if (serverInitialized) {
    return;
  }

  try {
    // Initialiser les comptes uniquement en développement ou si configuré
    if (process.env.NODE_ENV === 'development' || process.env.INITIALIZE_ACCOUNTS === 'true') {
      console.log("🚀 Initialisation du serveur en cours...");
      
      // Initialiser les comptes utilisateurs
      await initializeAccounts();
      
      console.log("✅ Initialisation du serveur terminée");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du serveur:", error);
  } finally {
    // Marquer comme initialisé même en cas d'erreur pour éviter des tentatives répétées
    serverInitialized = true;
  }
} 