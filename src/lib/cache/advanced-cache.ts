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
          ttl,
          [...tags, keyPrefix]
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
          ttl,
          [domain]
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

/**
 * Clé de cache typée pour assurer la cohérence des données
 */
export type CacheKey = string;

/**
 * Interface pour les options de mise en cache
 */
export interface CacheOptions {
  /** Durée de validité du cache en ms (défaut: 5 minutes) */
  ttl?: number;
  /** Groupe de cache pour l'invalidation groupée */
  group?: string;
  /** Priorité du cache (plus élevé = plus important à conserver) */
  priority?: number;
  /** Taille estimée de l'élément (pour la gestion de la mémoire) */
  size?: number;
}

/**
 * Interface d'un élément en cache
 */
interface CacheItem<T> {
  /** Données stockées */
  data: T;
  /** Timestamp d'expiration */
  expiresAt: number;
  /** Timestamp de création */
  createdAt: number;
  /** Timestamp de dernière utilisation */
  lastUsed: number;
  /** Groupe de cache */
  group?: string;
  /** Priorité (plus élevé = plus important) */
  priority: number;
  /** Taille estimée en octets */
  size: number;
}

/**
 * Options par défaut pour le cache
 */
const DEFAULT_OPTIONS: Required<CacheOptions> = {
  ttl: 5 * 60 * 1000, // 5 minutes
  group: 'default',
  priority: 1,
  size: 1,
};

/**
 * Configuration du gestionnaire de cache
 */
export interface CacheManagerConfig {
  /** Taille maximale du cache en nombre d'éléments (défaut: 1000) */
  maxItems: number;
  /** Taille maximale estimée du cache en octets (défaut: 50Mo) */
  maxSize: number;
  /** Intervalle de nettoyage automatique en ms (défaut: 60 secondes) */
  cleanupInterval: number;
  /** Seuil de nettoyage, pourcentage de maxSize à partir duquel nettoyer (défaut: 0.8) */
  cleanupThreshold: number;
  /** Activer les logs détaillés */
  verbose: boolean;
}

/**
 * Gestionnaire de cache avancé avec invalidation intelligente et gestion optimisée de la mémoire
 */
export class AdvancedCacheManager {
  private static instance: AdvancedCacheManager;
  private cache: Map<CacheKey, CacheItem<any>> = new Map();
  private config: CacheManagerConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private currentSize = 0;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  private constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = {
      maxItems: config.maxItems ?? 1000,
      maxSize: config.maxSize ?? 50 * 1024 * 1024, // 50MB
      cleanupInterval: config.cleanupInterval ?? 60 * 1000, // 60 secondes
      cleanupThreshold: config.cleanupThreshold ?? 0.8, // 80%
      verbose: config.verbose ?? false,
    };

    this.startCleanupTimer();
  }

  /**
   * Obtenir l'instance unique du gestionnaire de cache
   */
  public static getInstance(config?: Partial<CacheManagerConfig>): AdvancedCacheManager {
    if (!AdvancedCacheManager.instance) {
      AdvancedCacheManager.instance = new AdvancedCacheManager(config);
    } else if (config) {
      // Mettre à jour la configuration
      AdvancedCacheManager.instance.config = {
        ...AdvancedCacheManager.instance.config,
        ...config,
      };
    }
    return AdvancedCacheManager.instance;
  }

  /**
   * Démarrer le timer de nettoyage automatique
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Mettre un élément en cache
   */
  public set<T>(key: CacheKey, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Vérifier si la clé existe déjà
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }

    const item: CacheItem<T> = {
      data,
      expiresAt: now + opts.ttl,
      createdAt: now,
      lastUsed: now,
      group: opts.group,
      priority: opts.priority,
      size: opts.size,
    };

    // Vérifier si on dépasse la capacité maximale
    if (this.cache.size >= this.config.maxItems || 
        this.currentSize + item.size > this.config.maxSize * this.config.cleanupThreshold) {
      this.cleanup();
    }

    // Stocker l'élément
    this.cache.set(key, item);
    this.currentSize += item.size;

    if (this.config.verbose) {
      logger.debug(`[Cache] Élément mis en cache: ${key}`, {
        metadata: {
          cacheSize: this.cache.size,
          currentSizeBytes: this.currentSize,
          ttl: opts.ttl,
          group: opts.group,
        }
      });
    }
  }

  /**
   * Récupérer un élément du cache
   */
  public get<T>(key: CacheKey): T | null {
    const item = this.cache.get(key);
    
    // Vérifier si l'élément existe et n'est pas expiré
    if (item && item.expiresAt > Date.now()) {
      // Mettre à jour le timestamp de dernière utilisation
      item.lastUsed = Date.now();
      
      // Incrémenter le compteur de hits
      this.hits++;
      
      if (this.config.verbose) {
        logger.debug(`[Cache] Hit: ${key}`);
      }
      
      return item.data as T;
    }
    
    // Si l'élément est expiré, le supprimer
    if (item) {
      this.delete(key);
    }
    
    // Incrémenter le compteur de miss
    this.misses++;
    
    if (this.config.verbose) {
      logger.debug(`[Cache] Miss: ${key}`);
    }
    
    return null;
  }

  /**
   * Récupérer un élément du cache avec gestion intelligente des expirations
   * Retourne les données expirées si elles existent et demande une revalidation
   */
  public getWithStale<T>(
    key: CacheKey, 
    revalidate: () => Promise<T>
  ): Promise<{ data: T, isStale: boolean }> {
    return new Promise(async (resolve, reject) => {
      const item = this.cache.get(key);
      const now = Date.now();
      
      // Cas 1: Données fraîches disponibles
      if (item && item.expiresAt > now) {
        item.lastUsed = now;
        this.hits++;
        
        if (this.config.verbose) {
          logger.debug(`[Cache] Fresh hit: ${key}`);
        }
        
        resolve({ data: item.data as T, isStale: false });
        return;
      }
      
      // Cas 2: Données périmées mais disponibles (stale-while-revalidate)
      if (item) {
        // Mettre à jour le dernier accès
        item.lastUsed = now;
        
        // On retourne les données périmées immédiatement
        const staleData = item.data as T;
        
        if (this.config.verbose) {
          logger.debug(`[Cache] Stale hit: ${key}, expiré depuis ${(now - item.expiresAt) / 1000}s`);
        }
        
        // Lancer la revalidation en arrière-plan
        try {
          const freshData = await revalidate();
          // Mettre à jour le cache avec les nouvelles données
          this.set(key, freshData, {
            group: item.group,
            priority: item.priority,
            size: item.size,
          });
        } catch (error) {
          logger.warn(`[Cache] Échec de revalidation pour ${key}`, {
            metadata: { 
              errorMessage: String(error) 
            }
          });
        }
        
        // Retourner les données périmées pendant la revalidation
        resolve({ data: staleData, isStale: true });
        return;
      }
      
      // Cas 3: Aucune donnée disponible, il faut tout récupérer
      this.misses++;
      
      if (this.config.verbose) {
        logger.debug(`[Cache] Complete miss: ${key}`);
      }
      
      try {
        const freshData = await revalidate();
        this.set(key, freshData);
        resolve({ data: freshData, isStale: false });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Supprimer un élément du cache
   */
  public delete(key: CacheKey): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Invalider tous les éléments d'un groupe spécifique
   */
  public invalidateGroup(group: string): number {
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.group === group) {
        this.currentSize -= item.size;
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.verbose && count > 0) {
      logger.debug(`[Cache] Groupe invalidé: ${group}, ${count} éléments supprimés`);
    }
    
    return count;
  }

  /**
   * Nettoyer le cache en supprimant les éléments expirés et les moins prioritaires si nécessaire
   */
  public cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;
    
    // 1. Supprimer tous les éléments expirés
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt <= now) {
        this.currentSize -= item.size;
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    // 2. Si on est toujours au-dessus du seuil, supprimer les éléments les moins prioritaires
    if (this.cache.size > this.config.maxItems * 0.9 || 
        this.currentSize > this.config.maxSize * 0.9) {
      
      // Trier les éléments par priorité et dernier accès
      const items = Array.from(this.cache.entries())
        .map(([key, item]) => ({ key, item }))
        .sort((a, b) => {
          // D'abord par priorité (ascendant)
          if (a.item.priority !== b.item.priority) {
            return a.item.priority - b.item.priority;
          }
          // Ensuite par dernier accès (le plus ancien d'abord)
          return a.item.lastUsed - b.item.lastUsed;
        });
      
      // Supprimer jusqu'à 20% des éléments les moins prioritaires
      const toDelete = Math.ceil(items.length * 0.2);
      
      for (let i = 0; i < toDelete && i < items.length; i++) {
        const { key, item } = items[i];
        this.currentSize -= item.size;
        this.cache.delete(key);
        deletedCount++;
        this.evictions++;
      }
    }
    
    if (this.config.verbose && deletedCount > 0) {
      logger.debug(`[Cache] Nettoyage: ${deletedCount} éléments supprimés`, {
        metadata: {
          cacheSize: this.cache.size,
          currentSizeBytes: this.currentSize,
          maxItems: this.config.maxItems,
          maxSize: this.config.maxSize,
        }
      });
    }
  }

  /**
   * Vider entièrement le cache
   */
  public clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    
    if (this.config.verbose) {
      logger.debug('[Cache] Cache entièrement vidé');
    }
  }
  
  /**
   * Obtenir les statistiques du cache
   */
  public getStats() {
    return {
      size: this.cache.size,
      sizeBytes: this.currentSize,
      maxItems: this.config.maxItems,
      maxSizeBytes: this.config.maxSize,
      utilization: this.cache.size / this.config.maxItems,
      memoryUtilization: this.currentSize / this.config.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatio: this.hits / (this.hits + this.misses || 1),
    };
  }
}

// Exporter une instance par défaut pour faciliter l'utilisation
export const advancedCache = AdvancedCacheManager.getInstance(); 