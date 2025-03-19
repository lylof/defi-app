/**
 * Interface définissant la structure du service de cache
 */
interface CacheServiceType {
  DEFAULT_TTL: number;
  _cache: Map<string, { value: any; expiry: number }>;
  set: (key: string, value: any, ttl?: number) => void;
  get: (key: string) => any;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  cleanup: () => void;
  size: () => number;
  keys: () => string[];
}

/**
 * Service de cache pour optimiser les performances
 * Gère le cache en mémoire avec une stratégie d'invalidation
 */
export const CacheService: CacheServiceType = {
  /**
   * Durée de vie par défaut du cache (5 minutes)
   */
  DEFAULT_TTL: 5 * 60 * 1000,

  /**
   * Cache en mémoire
   */
  _cache: new Map<string, { value: any; expiry: number }>(),

  /**
   * Stocke une valeur dans le cache
   * @param key Clé du cache
   * @param value Valeur à stocker
   * @param ttl Durée de vie en millisecondes
   */
  set: (key: string, value: any, ttl: number = CacheService.DEFAULT_TTL): void => {
    const expiry = Date.now() + ttl;
    CacheService._cache.set(key, { value, expiry });
  },

  /**
   * Récupère une valeur du cache
   * @param key Clé du cache
   * @returns Valeur stockée ou null si expirée/inexistante
   */
  get: (key: string): any => {
    const cached = CacheService._cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Vérifier si le cache est expiré
    if (Date.now() > cached.expiry) {
      CacheService._cache.delete(key);
      return null;
    }

    return cached.value;
  },

  /**
   * Supprime une valeur du cache
   * @param key Clé du cache
   */
  remove: (key: string): void => {
    CacheService._cache.delete(key);
  },

  /**
   * Vide tout le cache
   */
  clear: (): void => {
    CacheService._cache.clear();
  },

  /**
   * Vérifie si une clé existe dans le cache
   * @param key Clé du cache
   * @returns true si la clé existe et n'est pas expirée
   */
  has: (key: string): boolean => {
    return CacheService.get(key) !== null;
  },

  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup: (): void => {
    const now = Date.now();
    
    for (const [key, { expiry }] of CacheService._cache.entries()) {
      if (now > expiry) {
        CacheService._cache.delete(key);
      }
    }
  },

  /**
   * Récupère la taille du cache
   * @returns Nombre d'entrées dans le cache
   */
  size: (): number => {
    return CacheService._cache.size;
  },

  /**
   * Récupère toutes les clés du cache
   * @returns Liste des clés
   */
  keys: (): string[] => {
    return Array.from(CacheService._cache.keys());
  }
}; 