import { prisma } from "./prisma";
import { cacheService } from "./cache-service";
import { dbLogger } from "./logger";

/**
 * Options pour les requêtes Prisma mises en cache
 */
export interface CachedQueryOptions {
  ttl?: number;                // Durée de vie en millisecondes
  staleWhileRevalidate?: boolean; // Renvoyer les données périmées pendant la revalidation
  tags?: string[];             // Tags pour l'invalidation groupée
  bypassCache?: boolean;       // Ignorer le cache et forcer une requête fraîche
  cacheKeyPrefix?: string;     // Préfixe pour la clé de cache
}

/**
 * Classe utilitaire pour exécuter des requêtes Prisma avec mise en cache
 */
export class CachedPrisma {
  /**
   * Exécute une requête Prisma avec mise en cache
   * 
   * @param queryName Nom de la requête (pour la journalisation et la clé de cache)
   * @param queryFn Fonction de requête Prisma à exécuter
   * @param options Options de mise en cache
   * @returns Résultat de la requête
   */
  static async query<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    options: CachedQueryOptions = {}
  ): Promise<T> {
    const {
      ttl,
      staleWhileRevalidate = true,
      tags = [],
      bypassCache = false,
      cacheKeyPrefix = 'prisma'
    } = options;

    // Construire la clé de cache
    const cacheKey = `${cacheKeyPrefix}:${queryName}`;
    
    // Si le cache doit être ignoré, exécuter directement la requête
    if (bypassCache) {
      dbLogger.debug(`Contournement du cache pour la requête "${queryName}"`);
      return queryFn();
    }

    // Utiliser le service de cache pour récupérer ou définir la valeur
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        dbLogger.debug(`Exécution de la requête Prisma "${queryName}"`);
        const startTime = Date.now();
        
        try {
          const result = await queryFn();
          const duration = Date.now() - startTime;
          
          dbLogger.debug(`Requête "${queryName}" exécutée en ${duration}ms`);
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          dbLogger.error(`Erreur lors de l'exécution de la requête "${queryName}" (${duration}ms)`, 
            error instanceof Error ? error : new Error(String(error)));
          throw error;
        }
      },
      {
        ttl,
        staleWhileRevalidate,
        tags: ['prisma', ...tags]
      }
    );
  }

  /**
   * Invalide le cache pour une requête spécifique
   * 
   * @param queryName Nom de la requête à invalider
   * @param cacheKeyPrefix Préfixe pour la clé de cache
   */
  static invalidateQuery(queryName: string, cacheKeyPrefix: string = 'prisma'): void {
    const cacheKey = `${cacheKeyPrefix}:${queryName}`;
    cacheService.delete(cacheKey);
    dbLogger.debug(`Cache invalidé pour la requête "${queryName}"`);
  }

  /**
   * Invalide toutes les requêtes Prisma mises en cache
   */
  static invalidateAll(): void {
    cacheService.invalidateByTag('prisma');
    dbLogger.info('Cache invalidé pour toutes les requêtes Prisma');
  }

  /**
   * Invalide toutes les requêtes Prisma avec un tag spécifique
   * 
   * @param tag Tag à invalider
   */
  static invalidateByTag(tag: string): void {
    cacheService.invalidateByTag(tag);
    dbLogger.info(`Cache invalidé pour les requêtes Prisma avec le tag "${tag}"`);
  }

  /**
   * Obtient des statistiques sur le cache
   */
  static getStats() {
    return cacheService.getStats();
  }
}

/**
 * Client Prisma avec mise en cache
 * Permet d'utiliser facilement le cache pour les requêtes Prisma
 * 
 * Exemple d'utilisation:
 * ```
 * // Requête mise en cache
 * const users = await cachedPrisma.user.findMany({
 *   where: { isActive: true },
 *   cacheOptions: { ttl: 60000, tags: ['users'] }
 * });
 * 
 * // Invalider le cache
 * cachedPrisma.$invalidateQueries('users');
 * ```
 */
export const cachedPrisma = new Proxy(prisma, {
  get(target, prop) {
    // Si la propriété est une méthode d'invalidation spéciale
    if (prop === '$invalidateAll') {
      return () => CachedPrisma.invalidateAll();
    }
    
    if (prop === '$invalidateByTag') {
      return (tag: string) => CachedPrisma.invalidateByTag(tag);
    }
    
    if (prop === '$invalidateQueries') {
      return (queryName: string) => CachedPrisma.invalidateQuery(queryName);
    }
    
    if (prop === '$stats') {
      return () => CachedPrisma.getStats();
    }
    
    // Récupérer la valeur originale (modèle Prisma)
    const value = (target as any)[prop];
    
    // Si ce n'est pas un objet, retourner directement
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    
    // Créer un proxy pour le modèle Prisma
    return new Proxy(value, {
      get(modelTarget, modelProp) {
        const modelMethod = (modelTarget as any)[modelProp];
        
        // Si ce n'est pas une fonction, retourner directement
        if (typeof modelMethod !== 'function') {
          return modelMethod;
        }
        
        // Retourner une fonction qui enveloppe la méthode originale
        return function(...args: any[]) {
          // Extraire les options de cache si présentes
          const lastArg = args[args.length - 1];
          let cacheOptions: CachedQueryOptions = {};
          
          if (lastArg && typeof lastArg === 'object' && 'cacheOptions' in lastArg) {
            cacheOptions = lastArg.cacheOptions || {};
            
            // Créer une copie des arguments sans les options de cache
            const newArgs = [...args];
            const newLastArg = { ...lastArg };
            delete newLastArg.cacheOptions;
            newArgs[newArgs.length - 1] = newLastArg;
            args = newArgs;
          }
          
          // Construire un nom de requête basé sur le modèle et la méthode
          const queryName = `${String(prop)}.${String(modelProp)}`;
          
          // Exécuter la requête avec mise en cache
          return CachedPrisma.query(
            queryName,
            () => modelMethod.apply(modelTarget, args),
            cacheOptions
          );
        };
      }
    });
  }
}); 