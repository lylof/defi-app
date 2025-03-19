/**
 * Types pour le défi du jour
 */
export interface DailyChallenge {
  id: string;
  title: string;
  domain: string;
  description: string;
  difficulty: number;
  participants: number;
  endTime: string;
  briefUrl: string;
  participateUrl: string;
}

// Cache en mémoire pour le défi du jour
let dailyChallengeCache: {
  data: DailyChallenge | null;
  timestamp: number;
  expiresAt: number;
} = {
  data: null,
  timestamp: 0,
  expiresAt: 0
};

// Défi par défaut en cas d'erreur
const DEFAULT_CHALLENGE: DailyChallenge = {
  id: "error",
  title: "Défi du jour",
  domain: "Développement",
  description: "Les détails du défi ne sont pas disponibles actuellement. Veuillez réessayer plus tard.",
  difficulty: 3,
  participants: 0,
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  briefUrl: "#",
  participateUrl: "#",
};

/**
 * Service pour gérer les interactions avec le défi quotidien
 * Fournit des méthodes pour récupérer les informations du défi
 * Version optimisée avec mise en cache et gestion d'erreurs améliorée
 */
export const DailyChallengeService = {
  /**
   * Récupère les informations du défi du jour depuis l'API
   * Utilise un cache en mémoire pour éviter les requêtes inutiles
   * @param forceRefresh Force le rafraîchissement du cache
   * @returns Les données du défi quotidien actuel
   */
  getDailyChallenge: async (forceRefresh = false): Promise<DailyChallenge> => {
    const now = Date.now();
    
    // Vérifier si les données en cache sont valides
    if (
      !forceRefresh && 
      dailyChallengeCache.data && 
      now < dailyChallengeCache.expiresAt
    ) {
      return dailyChallengeCache.data;
    }
    
    try {
      // Options de la requête avec cache optimisé
      const options: RequestInit = {
        // Utiliser le cache du navigateur mais vérifier la fraîcheur
        cache: 'default',
        // Timeout de 3 secondes pour éviter les attentes trop longues
        signal: AbortSignal.timeout(3000)
      };
      
      const response = await fetch('/api/challenges/daily', options);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du défi: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour le cache
      dailyChallengeCache = {
        data,
        timestamp: now,
        // Expiration dans 5 minutes
        expiresAt: now + 5 * 60 * 1000
      };
      
      return data;
    } catch (error) {
      console.error("Erreur dans le service de défi quotidien:", error);
      
      // Si nous avons des données en cache, même expirées, les utiliser en fallback
      if (dailyChallengeCache.data) {
        return dailyChallengeCache.data;
      }
      
      // Sinon, utiliser le défi par défaut
      return DEFAULT_CHALLENGE;
    }
  },
  
  /**
   * Récupère le top des participants au défi du jour
   * @param challengeId Identifiant du défi
   * @param limit Nombre maximum de participants à récupérer
   * @returns Liste des meilleurs participants
   */
  getTopParticipants: async (challengeId: string, limit: number = 5) => {
    try {
      // Options de la requête avec cache optimisé
      const options: RequestInit = {
        cache: 'default',
        signal: AbortSignal.timeout(3000)
      };
      
      const response = await fetch(
        `/api/challenges/${challengeId}/leaderboard?limit=${limit}`,
        options
      );
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du classement: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du classement:", error);
      return [];
    }
  }
}; 