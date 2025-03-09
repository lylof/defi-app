import { cacheService } from '../cache-service';
import { logger } from '../logger';

const cacheLogger = logger.createContextLogger('cache:advanced');

/**
 * Interface pour les options du décorateur de cache
 */
export interface CacheDecoratorOptions {
  ttl?: number;                    // Durée de vie en millisecondes
  staleWhileRevalidate?: boolean;  // Utiliser les données périmées pendant la revalidation
  tags?: string[];                 // Tags pour l'invalidation groupée
  keyGenerator?: (...args: any[]) => string; // Fonction pour générer une clé de cache personnalisée
  condition?: (...args: any[]) => boolean;   // Condition pour utiliser le cache ou non
}

/**
 * Décorateur de méthode pour la mise en cache des résultats
 * 
 * @example
 * class UserService {
 *   @Cacheable('users', { ttl: 5 * 60 * 1000 })
 *   async getUserById(id: string) {
 *     // Méthode coûteuse qui sera mise en cache
 *   }
 * }
 */
export function Cacheable(keyPrefix: string, options: CacheDecoratorOptions = {}) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const {
      ttl = 5 * 60 * 1000, // 5 minutes par défaut
      staleWhileRevalidate = true,
      tags = [],
      keyGenerator,
      condition = () => true
    } = options;

    // Nouvelle implémentation avec cache
    descriptor.value = async function(...args: any[]) {
      // Vérifier si le cache doit être utilisé
      if (!condition.apply(this, args)) {
        return originalMethod.apply(this, args);
      }

      // Générer la clé de cache
      const cacheKey = keyGenerator 
        ? `${keyPrefix}:${keyGenerator.apply(this, args)}`
        : `${keyPrefix}:${JSON.stringify(args)}`;

      try {
        // Récupérer ou définir la valeur en cache
        return await cacheService.getOrSet(
          cacheKey,
          () => originalMethod.apply(this, args),
          { ttl, staleWhileRevalidate, tags: [...tags, keyPrefix] }
        );
      } catch (error) {
        // En cas d'erreur, utiliser la méthode originale et logger l'erreur
        cacheLogger.error(`Erreur lors de l'utilisation du cache pour ${propertyKey}`, 
          error instanceof Error ? error : new Error(String(error)));
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Décorateur de méthode pour invalider le cache après exécution
 * 
 * @example
 * class UserService {
 *   @CacheInvalidate('users', { patterns: ['users:*'] })
 *   async updateUser(id: string, data: any) {
 *     // Méthode qui modifie les données et nécessite une invalidation du cache
 *   }
 * }
 */
export function CacheInvalidate(keyPrefix: string, options: { tags?: string[]; patterns?: string[] } = {}) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const { tags = [], patterns = [] } = options;

    // Nouvelle implémentation avec invalidation de cache
    descriptor.value = async function(...args: any[]) {
      try {
        // Exécuter d'abord la méthode originale
        const result = await originalMethod.apply(this, args);

        // Invalider le cache sur les tags
        if (tags.length > 0) {
          await Promise.all(tags.map(tag => cacheService.invalidateByTag(tag)));
          cacheLogger.debug(`Cache invalidé pour les tags: ${tags.join(', ')}`);
        }

        // Invalider le cache selon les patterns
        if (patterns.length > 0) {
          // Note: Cette fonctionnalité nécessiterait une implémentation supplémentaire
          // dans le CacheService pour supporter l'invalidation par pattern
          cacheLogger.debug(`Patterns d'invalidation: ${patterns.join(', ')}`);
        }

        return result;
      } catch (error) {
        cacheLogger.error(`Erreur lors de l'invalidation du cache pour ${propertyKey}`, 
          error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utilitaire pour créer un gestionnaire de cache pour un domaine spécifique
 * 
 * @example
 * const userCache = createCacheManager('users');
 * 
 * class UserService {
 *   async getUserById(id: string) {
 *     return userCache.getOrSet(`user:${id}`, () => this.fetchUserFromDb(id));
 *   }
 * }
 */
export function createCacheManager(domain: string) {
  return {
    /**
     * Récupère une valeur du cache ou l'y place si elle n'existe pas
     */
    getOrSet: async <T>(key: string, fetchFn: () => Promise<T>, options: Partial<CacheDecoratorOptions> = {}): Promise<T> => {
      const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;
      const cacheKey = `${domain}:${key}`;
      
      try {
        return await cacheService.getOrSet(
          cacheKey,
          fetchFn,
          { ttl, staleWhileRevalidate, tags: [domain] }
        );
      } catch (error) {
        cacheLogger.error(`Erreur lors de l'utilisation du cache pour ${cacheKey}`, 
          error instanceof Error ? error : new Error(String(error)));
        return fetchFn();
      }
    },
    
    /**
     * Invalide toutes les entrées de cache pour ce domaine
     */
    invalidateAll: () => {
      cacheService.invalidateByTag(domain);
      cacheLogger.debug(`Cache invalidé pour le domaine: ${domain}`);
    },
    
    /**
     * Supprime une entrée spécifique du cache
     */
    invalidate: (key: string) => {
      cacheService.delete(`${domain}:${key}`);
      cacheLogger.debug(`Cache invalidé pour la clé: ${domain}:${key}`);
    }
  };
} 