/**
 * Service de cache optimisé pour les requêtes fréquentes
 * Implémente un cache en mémoire avec expiration et tags pour l'invalidation
 */

// Type pour les entrées du cache
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  tags: string[];
};

// Type pour les statistiques du cache
type CacheStats = {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
};

/**
 * Service de cache en mémoire avec expiration et tags
 */
export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

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
   * Définir une valeur dans le cache
   * @param key Clé du cache
   * @param value Valeur à mettre en cache
   * @param ttl Durée de vie en millisecondes (par défaut 5 minutes)
   * @param tags Tags pour l'invalidation groupée
   */
  public set<T>(key: string, value: T, ttl: number = 300000, tags: string[] = []): void {
    const expiresAt = Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      expiresAt,
      tags
    });
    
    console.debug(`Mise en cache de la clé "${key}"`, {
      ttl,
      tags,
      expiresAt: new Date(expiresAt).toISOString()
    });
  }

  /**
   * Récupérer une valeur du cache
   * @param key Clé du cache
   * @returns La valeur mise en cache ou null si non trouvée ou expirée
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Vérifier si l'entrée existe
    if (!entry) {
      this.misses++;
      console.debug(`Cache miss pour la clé "${key}"`);
      return null;
    }
    
    // Vérifier si l'entrée est expirée
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      console.debug(`Entrée expirée pour la clé "${key}"`);
      return null;
    }
    
    // Entrée valide
    this.hits++;
    console.debug(`Cache hit pour la clé "${key}"`);
    return entry.value as T;
  }

  /**
   * Récupérer une valeur du cache ou l'initialiser si non trouvée
   * @param key Clé du cache
   * @param factory Fonction pour générer la valeur si non trouvée
   * @param ttl Durée de vie en millisecondes
   * @param tags Tags pour l'invalidation groupée
   * @returns La valeur mise en cache
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 300000,
    tags: string[] = []
  ): Promise<T> {
    // Vérifier si la valeur est déjà en cache
    const cachedValue = this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Générer la valeur
    const value = await factory();
    
    // Mettre en cache
    this.set(key, value, ttl, tags);
    
    return value;
  }

  /**
   * Supprimer une entrée du cache
   * @param key Clé du cache
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les entrées avec un tag spécifique
   * @param tag Tag à invalider
   * @returns Nombre d'entrées invalidées
   */
  public invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.debug(`Invalidation de ${count} entrées avec le tag "${tag}"`);
    return count;
  }

  /**
   * Vider complètement le cache
   */
  public clear(): void {
    this.cache.clear();
    console.debug("Cache vidé");
  }

  /**
   * Nettoyer les entrées expirées
   * @returns Nombre d'entrées nettoyées
   */
  public cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.debug(`Nettoyage de ${count} entrées expirées`);
    return count;
  }

  /**
   * Obtenir des statistiques sur le cache
   */
  public getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate
    };
  }
}

// Exporter une instance singleton
export const cacheService = CacheService.getInstance();
