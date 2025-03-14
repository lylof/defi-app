/**
 * Version Edge-compatible de l'initialisation des comptes
 * Ce fichier est utilisé par le middleware pour initialiser les comptes
 * sans utiliser directement Prisma dans l'environnement Edge
 */

/**
 * Initialise les comptes utilisateurs via l'API
 * Cette fonction est compatible avec Edge Runtime car elle utilise fetch
 * au lieu d'appeler directement Prisma
 */
export async function initializeAccountsEdge(): Promise<void> {
  try {
    console.log("🔄 Initialisation des comptes via API (Edge-compatible)...");
    
    // Utiliser l'API pour initialiser les comptes
    const response = await fetch('/api/init-accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de l'initialisation des comptes: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("✅ Initialisation des comptes terminée:", data);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des comptes:", error);
  }
} 