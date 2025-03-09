import { logger } from "./logger";

/**
 * Interface pour les options de mise en cache
 */
export interface CacheOptions {
  ttl: number;          // Durée de vie en millisecondes
  staleWhileRevalidate: boolean; // Renvoyer les données périmées pendant la revalidation
  tags?: string[];      // Tags pour l'invalidation groupée
}

/**
 * Interface pour une entrée de cache
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  isRevalidating?: boolean;
}

/**
 * Service de mise en cache en mémoire
 * Permet de mettre en cache des données pour réduire les appels à la base de données
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60 * 1000; // 1 minute par défaut
  private cacheLogger = logger.createContextLogger('cache');

  /**
   * Constructeur privé pour le singleton
   */
  private constructor() {}

  /**
   * Obtenir l'instance unique du service de cache
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Définir la durée de vie par défaut du cache
   * @param ttl Durée de vie en millisecondes
   */
  public setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * Mettre en cache une valeur
   * @param key Clé de cache
   * @param value Valeur à mettre en cache
   * @param options Options de mise en cache
   */
  public set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
    const ttl = options?.ttl ?? this.defaultTTL;
    const tags = options?.tags ?? [];
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      tags
    });
    
    this.cacheLogger.debug(`Mise en cache de la clé "${key}"`, {
      metadata: {
        ttl,
        tags,
        expiresAt: new Date(Date.now() + ttl).toISOString()
      }
    });
  }

  /**
   * Récupérer une valeur du cache
   * @param key Clé de cache
   * @returns Valeur mise en cache ou undefined si non trouvée ou expirée
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cacheLogger.debug(`Cache miss pour la clé "${key}"`);
      return undefined;
    }
    
    const now = Date.now();
    
    // Si l'entrée est expirée
    if (now > entry.expiresAt) {
      this.cacheLogger.debug(`Entrée expirée pour la clé "${key}"`);
      return undefined;
    }
    
    this.cacheLogger.debug(`Cache hit pour la clé "${key}"`);
    return entry.value as T;
  }

  /**
   * Récupérer une valeur du cache avec gestion des données périmées
   * @param key Clé de cache
   * @param fetchFn Fonction pour récupérer les données fraîches
   * @param options Options de mise en cache
   * @returns Valeur mise en cache ou résultat de fetchFn
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheOptions>
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();
    const staleWhileRevalidate = options?.staleWhileRevalidate ?? false;
    
    // Si l'entrée existe et n'est pas expirée
    if (entry && now <= entry.expiresAt) {
      this.cacheLogger.debug(`Cache hit pour la clé "${key}"`);
      return entry.value as T;
    }
    
    // Si l'entrée existe, est expirée, mais staleWhileRevalidate est activé
    if (entry && staleWhileRevalidate && !entry.isRevalidating) {
      // Marquer l'entrée comme en cours de revalidation
      entry.isRevalidating = true;
      
      // Revalider en arrière-plan
      this.revalidateEntry(key, fetchFn, options).catch(error => {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        this.cacheLogger.error(`Erreur lors de la revalidation de la clé "${key}"`, errorObj);
      });
      
      this.cacheLogger.debug(`Renvoi de données périmées pour la clé "${key}" pendant la revalidation`);
      return entry.value as T;
    }
    
    // Sinon, récupérer les données fraîches
    try {
      this.cacheLogger.debug(`Récupération de données fraîches pour la clé "${key}"`);
      const freshValue = await fetchFn();
      
      // Mettre en cache les nouvelles données
      this.set(key, freshValue, options);
      
      return freshValue;
    } catch (error) {
      // En cas d'erreur, renvoyer les données périmées si disponibles
      if (entry && staleWhileRevalidate) {
        this.cacheLogger.warn(`Erreur lors de la récupération de données fraîches pour la clé "${key}", renvoi des données périmées`, {
          metadata: { errorMessage: error instanceof Error ? error.message : String(error) }
        });
        return entry.value as T;
      }
      
      // Sinon, propager l'erreur
      throw error;
    }
  }

  /**
   * Revalider une entrée de cache en arrière-plan
   */
  private async revalidateEntry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: Partial<CacheOptions>
  ): Promise<void> {
    try {
      const freshValue = await fetchFn();
      
      // Mettre à jour l'entrée de cache
      this.set(key, freshValue, options);
      
      this.cacheLogger.debug(`Revalidation réussie pour la clé "${key}"`);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.cacheLogger.error(`Échec de la revalidation pour la clé "${key}"`, errorObj);
    } finally {
      // Réinitialiser le flag de revalidation
      const entry = this.cache.get(key);
      if (entry) {
        entry.isRevalidating = false;
      }
    }
  }

  /**
   * Supprimer une entrée du cache
   * @param key Clé de cache
   */
  public delete(key: string): void {
    this.cache.delete(key);
    this.cacheLogger.debug(`Suppression de la clé "${key}" du cache`);
  }

  /**
   * Invalider toutes les entrées de cache avec un tag spécifique
   * @param tag Tag à invalider
   */
  public invalidateByTag(tag: string): void {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.cacheLogger.info(`Invalidation de ${count} entrées avec le tag "${tag}"`);
  }

  /**
   * Vider complètement le cache
   */
  public clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.cacheLogger.info(`Cache vidé (${count} entrées supprimées)`);
  }

  /**
   * Obtenir des statistiques sur le cache
   */
  public getStats(): {
    size: number;
    activeEntries: number;
    expiredEntries: number;
    tags: Record<string, number>;
  } {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    const tagCounts: Record<string, number> = {};
    
    for (const entry of this.cache.values()) {
      if (now <= entry.expiresAt) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
      
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    
    return {
      size: this.cache.size,
      activeEntries,
      expiredEntries,
      tags: tagCounts
    };
  }
}

// Exporter une instance par défaut du service de cache
export const cacheService = CacheService.getInstance(); 