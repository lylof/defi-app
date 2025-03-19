/**
 * Interface pour les données de sauvegarde automatique
 */
interface AutoSaveData {
  timestamp: number;
  data: any;
}

/**
 * Interface pour le service de sauvegarde automatique
 */
interface AutoSaveServiceType {
  DEFAULT_INTERVAL: number;
  SAVE_TTL: number;
  _timers: Map<string, NodeJS.Timeout>;
  startAutoSave: (key: string, data: any, interval?: number) => void;
  stopAutoSave: (key: string) => void;
  save: (key: string, data: any) => void;
  restoreLastSave: (key: string) => any;
  removeSave: (key: string) => void;
  cleanupExpiredSaves: () => void;
  hasValidSave: (key: string) => boolean;
}

/**
 * Service de sauvegarde automatique pour les formulaires
 * Gère la sauvegarde périodique et la restauration des données
 */
export const AutoSaveService: AutoSaveServiceType = {
  /**
   * Intervalle de sauvegarde par défaut (30 secondes)
   */
  DEFAULT_INTERVAL: 30 * 1000,

  /**
   * Durée de vie des sauvegardes (24 heures)
   */
  SAVE_TTL: 24 * 60 * 60 * 1000,

  /**
   * Timers de sauvegarde
   */
  _timers: new Map<string, NodeJS.Timeout>(),

  /**
   * Démarrer la sauvegarde automatique
   * @param key Clé unique pour identifier la sauvegarde
   * @param data Données à sauvegarder
   * @param interval Intervalle de sauvegarde en millisecondes
   */
  startAutoSave: (key: string, data: any, interval: number = AutoSaveService.DEFAULT_INTERVAL): void => {
    // Arrêter la sauvegarde existante si elle existe
    AutoSaveService.stopAutoSave(key);

    // Sauvegarder immédiatement
    AutoSaveService.save(key, data);

    // Démarrer le timer de sauvegarde périodique
    const timer = setInterval(() => {
      AutoSaveService.save(key, data);
    }, interval);

    AutoSaveService._timers.set(key, timer);
  },

  /**
   * Arrêter la sauvegarde automatique
   * @param key Clé de la sauvegarde à arrêter
   */
  stopAutoSave: (key: string): void => {
    const timer = AutoSaveService._timers.get(key);
    if (timer) {
      clearInterval(timer);
      AutoSaveService._timers.delete(key);
    }
  },

  /**
   * Sauvegarder des données
   * @param key Clé unique pour identifier la sauvegarde
   * @param data Données à sauvegarder
   */
  save: (key: string, data: any): void => {
    if (typeof window === 'undefined') return;

    try {
      const saveData: AutoSaveData = {
        timestamp: Date.now(),
        data
      };

      localStorage.setItem(`autosave_${key}`, JSON.stringify(saveData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    }
  },

  /**
   * Restaurer la dernière sauvegarde
   * @param key Clé de la sauvegarde à restaurer
   * @returns Données sauvegardées ou null si aucune sauvegarde valide
   */
  restoreLastSave: (key: string): any => {
    if (typeof window === 'undefined') return null;

    try {
      const savedData = localStorage.getItem(`autosave_${key}`);
      if (!savedData) return null;

      const { timestamp, data }: AutoSaveData = JSON.parse(savedData);

      // Vérifier si la sauvegarde est expirée
      if (Date.now() - timestamp > AutoSaveService.SAVE_TTL) {
        localStorage.removeItem(`autosave_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la restauration de la sauvegarde:', error);
      return null;
    }
  },

  /**
   * Supprimer une sauvegarde
   * @param key Clé de la sauvegarde à supprimer
   */
  removeSave: (key: string): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`autosave_${key}`);
      AutoSaveService.stopAutoSave(key);
    } catch (error) {
      console.error('Erreur lors de la suppression de la sauvegarde:', error);
    }
  },

  /**
   * Nettoyer toutes les sauvegardes expirées
   */
  cleanupExpiredSaves: (): void => {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('autosave_')) {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            const { timestamp }: AutoSaveData = JSON.parse(savedData);
            if (now - timestamp > AutoSaveService.SAVE_TTL) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des sauvegardes:', error);
    }
  },

  /**
   * Vérifier si une sauvegarde existe
   * @param key Clé de la sauvegarde à vérifier
   * @returns true si une sauvegarde valide existe
   */
  hasValidSave: (key: string): boolean => {
    return AutoSaveService.restoreLastSave(key) !== null;
  }
}; 