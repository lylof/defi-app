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

/**
 * Service pour gérer les interactions avec le défi quotidien
 * Fournit des méthodes pour récupérer les informations du défi
 */
export const DailyChallengeService = {
  /**
   * Récupère les informations du défi du jour depuis l'API
   * @returns Les données du défi quotidien actuel
   */
  getDailyChallenge: async (): Promise<DailyChallenge> => {
    try {
      const response = await fetch('/api/challenges/daily');
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du défi: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erreur dans le service de défi quotidien:", error);
      
      // Fallback pour éviter de casser l'UI
      return {
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
      const response = await fetch(`/api/challenges/${challengeId}/leaderboard?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du classement: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération du classement:", error);
      return [];
    }
  },
}; 