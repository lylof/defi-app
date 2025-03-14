/**
 * Types pour la participation anonyme aux défis
 */
export interface AnonymousParticipationData {
  challengeId: string;
  startedAt: string;
  progress: number; // 0-100
  lastUpdated: string;
  description?: string;
  repositoryUrl?: string;
  isSubmitted: boolean;
}

/**
 * Clé de stockage pour localStorage
 */
const STORAGE_KEY = 'lpt-anonymous-participation';

/**
 * Service pour gérer la participation anonyme aux défis
 * Permet aux utilisateurs non connectés de participer et sauvegarder localement leur progression
 */
export const AnonymousParticipationService = {
  /**
   * Commence une nouvelle participation anonyme à un défi
   * @param challengeId ID du défi
   * @returns Les données de participation créées
   */
  startParticipation: (challengeId: string): AnonymousParticipationData => {
    const existingData = AnonymousParticipationService.getParticipationData(challengeId);
    
    // Si une participation existe déjà, la retourner
    if (existingData) {
      return existingData;
    }
    
    // Sinon, créer une nouvelle participation
    const newParticipation: AnonymousParticipationData = {
      challengeId,
      startedAt: new Date().toISOString(),
      progress: 0,
      lastUpdated: new Date().toISOString(),
      isSubmitted: false
    };
    
    // Sauvegarder dans localStorage
    AnonymousParticipationService._saveParticipation(newParticipation);
    
    return newParticipation;
  },
  
  /**
   * Met à jour la progression d'une participation anonyme
   * @param challengeId ID du défi
   * @param progress Progression (0-100)
   * @param data Données additionnelles (description, URL, etc.)
   * @returns Les données mises à jour ou null si aucune participation existante
   */
  updateProgress: (
    challengeId: string, 
    progress: number,
    data?: { description?: string; repositoryUrl?: string }
  ): AnonymousParticipationData | null => {
    const existingData = AnonymousParticipationService.getParticipationData(challengeId);
    
    if (!existingData) {
      return null;
    }
    
    const updatedData: AnonymousParticipationData = {
      ...existingData,
      progress: Math.min(Math.max(progress, 0), 100), // Assurer que la valeur est entre 0 et 100
      lastUpdated: new Date().toISOString(),
      ...(data?.description && { description: data.description }),
      ...(data?.repositoryUrl && { repositoryUrl: data.repositoryUrl })
    };
    
    // Sauvegarder dans localStorage
    AnonymousParticipationService._saveParticipation(updatedData);
    
    return updatedData;
  },
  
  /**
   * Marque une participation comme soumise
   * @param challengeId ID du défi
   * @param data Données de soumission
   * @returns Les données mises à jour ou null si aucune participation existante
   */
  submitSolution: (
    challengeId: string,
    data: { description: string; repositoryUrl?: string }
  ): AnonymousParticipationData | null => {
    const existingData = AnonymousParticipationService.getParticipationData(challengeId);
    
    if (!existingData) {
      return null;
    }
    
    const updatedData: AnonymousParticipationData = {
      ...existingData,
      progress: 100,
      lastUpdated: new Date().toISOString(),
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      isSubmitted: true
    };
    
    // Sauvegarder dans localStorage
    AnonymousParticipationService._saveParticipation(updatedData);
    
    return updatedData;
  },
  
  /**
   * Récupère les données d'une participation anonyme
   * @param challengeId ID du défi
   * @returns Les données de participation ou null si aucune participation trouvée
   */
  getParticipationData: (challengeId: string): AnonymousParticipationData | null => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (!storedData) {
        return null;
      }
      
      const participations: AnonymousParticipationData[] = JSON.parse(storedData);
      return participations.find(p => p.challengeId === challengeId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de participation:', error);
      return null;
    }
  },
  
  /**
   * Récupère toutes les participations anonymes
   * @returns Liste des participations anonymes
   */
  getAllParticipations: (): AnonymousParticipationData[] => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return [];
    }
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (!storedData) {
        return [];
      }
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
      return [];
    }
  },
  
  /**
   * Sauvegarde une participation dans localStorage
   * @param participation Données de participation à sauvegarder
   * @internal
   */
  _saveParticipation: (participation: AnonymousParticipationData): void => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Récupérer les participations existantes
      const existingParticipations = AnonymousParticipationService.getAllParticipations();
      
      // Filtrer pour retirer l'ancienne version si elle existe
      const filteredParticipations = existingParticipations.filter(
        p => p.challengeId !== participation.challengeId
      );
      
      // Ajouter la nouvelle participation
      const updatedParticipations = [...filteredParticipations, participation];
      
      // Enregistrer dans localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedParticipations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la participation:', error);
    }
  },
  
  /**
   * Supprime une participation anonyme
   * @param challengeId ID du défi
   * @returns true si la suppression a réussi, false sinon
   */
  removeParticipation: (challengeId: string): boolean => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      // Récupérer les participations existantes
      const existingParticipations = AnonymousParticipationService.getAllParticipations();
      
      // Filtrer pour retirer la participation
      const filteredParticipations = existingParticipations.filter(
        p => p.challengeId !== challengeId
      );
      
      // Si aucun changement, retourner false
      if (filteredParticipations.length === existingParticipations.length) {
        return false;
      }
      
      // Enregistrer dans localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredParticipations));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la participation:', error);
      return false;
    }
  },
  
  /**
   * Détermine si l'utilisateur a déjà des participations anonymes
   * @returns true si des participations anonymes existent, false sinon
   */
  hasAnonymousParticipations: (): boolean => {
    return AnonymousParticipationService.getAllParticipations().length > 0;
  },
  
  /**
   * Efface toutes les participations anonymes (utile après une connexion)
   */
  clearAllParticipations: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.removeItem(STORAGE_KEY);
  }
}; 