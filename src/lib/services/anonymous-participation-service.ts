import { ValidationService } from './validation-service';
import { StorageService } from './storage-service';

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
    
    // Sauvegarder dans le stockage local
    if (!StorageService.save(STORAGE_KEY, newParticipation)) {
      console.error('Impossible de sauvegarder la participation');
      return newParticipation;
    }
    
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

    // Valider les données si présentes
    if (data) {
      if (!ValidationService.validateParticipationData(data)) {
        console.error('Données de participation invalides');
        return null;
      }
    }
    
    const updatedData: AnonymousParticipationData = {
      ...existingData,
      progress: Math.min(Math.max(progress, 0), 100), // Assurer que la valeur est entre 0 et 100
      lastUpdated: new Date().toISOString(),
      ...(data?.description && { description: data.description }),
      ...(data?.repositoryUrl && { repositoryUrl: data.repositoryUrl })
    };
    
    // Sauvegarder dans le stockage local
    if (!StorageService.save(STORAGE_KEY, updatedData)) {
      console.error('Impossible de sauvegarder la mise à jour');
      return null;
    }
    
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

    // Valider les données de soumission
    if (!ValidationService.validateParticipationData(data)) {
      console.error('Données de soumission invalides');
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
    
    // Sauvegarder dans le stockage local
    if (!StorageService.save(STORAGE_KEY, updatedData)) {
      console.error('Impossible de sauvegarder la soumission');
      return null;
    }
    
    return updatedData;
  },
  
  /**
   * Récupère les données d'une participation anonyme
   * @param challengeId ID du défi
   * @returns Les données de participation ou null si aucune participation trouvée
   */
  getParticipationData: (challengeId: string): AnonymousParticipationData | null => {
    // Vérifier si le stockage local est disponible
    if (!StorageService.isAvailable()) {
      console.error('Stockage local non disponible');
      return null;
    }
    
    try {
      const storedData = StorageService.get(STORAGE_KEY);
      
      if (!storedData) {
        return null;
      }
      
      return storedData.find((p: AnonymousParticipationData) => p.challengeId === challengeId) || null;
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
    // Vérifier si le stockage local est disponible
    if (!StorageService.isAvailable()) {
      console.error('Stockage local non disponible');
      return [];
    }
    
    try {
      const storedData = StorageService.get(STORAGE_KEY);
      return storedData || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
      return [];
    }
  },
  
  /**
   * Supprime une participation anonyme
   * @param challengeId ID du défi
   * @returns true si la suppression a réussi, false sinon
   */
  removeParticipation: (challengeId: string): boolean => {
    // Vérifier si le stockage local est disponible
    if (!StorageService.isAvailable()) {
      console.error('Stockage local non disponible');
      return false;
    }
    
    try {
      const storedData = StorageService.get(STORAGE_KEY);
      
      if (!storedData) {
        return false;
      }
      
      const filteredData = storedData.filter((p: AnonymousParticipationData) => p.challengeId !== challengeId);
      
      // Si aucun changement, retourner false
      if (filteredData.length === storedData.length) {
        return false;
      }
      
      return StorageService.save(STORAGE_KEY, filteredData);
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
    if (StorageService.isAvailable()) {
      StorageService.remove(STORAGE_KEY);
    }
  }
}; 