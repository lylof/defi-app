/**
 * Service de gestion du stockage local
 * Gère les limites de stockage et les erreurs de quota
 */
export const StorageService = {
  /**
   * Taille maximale autorisée pour le stockage (5MB)
   */
  MAX_STORAGE_SIZE: 5 * 1024 * 1024,

  /**
   * Sauvegarde des données dans le stockage local
   * @param key Clé de stockage
   * @param data Données à sauvegarder
   * @returns true si la sauvegarde a réussi, false sinon
   */
  save: (key: string, data: any): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      // Vérifier la taille des données
      const dataSize = new Blob([JSON.stringify(data)]).size;
      if (dataSize > StorageService.MAX_STORAGE_SIZE) {
        throw new Error('Données trop volumineuses pour le stockage local');
      }

      // Vérifier l'espace disponible
      const availableSpace = StorageService.getAvailableSpace();
      if (dataSize > availableSpace) {
        // Nettoyer l'espace si nécessaire
        if (!StorageService.cleanupSpace(dataSize)) {
          throw new Error('Espace de stockage insuffisant');
        }
      }

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  },

  /**
   * Récupère des données du stockage local
   * @param key Clé de stockage
   * @returns Données stockées ou null si non trouvées
   */
  get: (key: string): any => {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return null;
    }
  },

  /**
   * Supprime des données du stockage local
   * @param key Clé de stockage
   * @returns true si la suppression a réussi, false sinon
   */
  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  },

  /**
   * Calcule l'espace disponible dans le stockage local
   * @returns Espace disponible en octets
   */
  getAvailableSpace: (): number => {
    if (typeof window === 'undefined') return 0;

    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += localStorage.getItem(key)?.length || 0;
        }
      }
      return StorageService.MAX_STORAGE_SIZE - total;
    } catch (error) {
      console.error('Erreur lors du calcul de l\'espace disponible:', error);
      return 0;
    }
  },

  /**
   * Nettoie l'espace de stockage pour libérer de la place
   * @param requiredSpace Espace nécessaire en octets
   * @returns true si le nettoyage a réussi, false sinon
   */
  cleanupSpace: (requiredSpace: number): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      // Trier les clés par date d'accès (si disponible)
      const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
      
      // Supprimer les données les plus anciennes jusqu'à avoir assez d'espace
      while (StorageService.getAvailableSpace() < requiredSpace && keys.length > 0) {
        const key = keys.shift();
        if (key) {
          localStorage.removeItem(key);
        }
      }

      return StorageService.getAvailableSpace() >= requiredSpace;
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return false;
    }
  },

  /**
   * Vérifie si le stockage local est disponible
   * @returns true si le stockage local est disponible, false sinon
   */
  isAvailable: (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (error) {
      return false;
    }
  }
}; 