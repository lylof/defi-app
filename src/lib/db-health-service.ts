import { prisma } from "./prisma";

// Cache des health checks pour éviter les requêtes inutiles
type HealthCache = {
  timestamp: number;
  status: boolean;
  stats: DatabaseStats;
};

// Interface pour les statistiques de base de données
interface DatabaseStats {
  connectionErrors: number;
  averageQueryTime: number | null;
  queriesPerMinute: number;
  lastCheckTime: string;
}

// Durée de vie du cache en millisecondes (10 secondes)
const HEALTH_CACHE_TTL = 10000;

let healthCache: HealthCache | null = null;

/**
 * Service optimisé pour les vérifications de santé de la base de données
 * Utilise un mécanisme de cache pour réduire le nombre de requêtes
 */
export class DbHealthService {
  /**
   * Vérifie la santé de la connexion à la base de données avec mise en cache
   * pour éviter les requêtes trop fréquentes et améliorer les performances
   */
  static async checkHealth(): Promise<{
    isConnected: boolean;
    stats: DatabaseStats;
  }> {
    try {
      // Vérifier si nous avons un cache valide
      const now = Date.now();
      if (healthCache && now - healthCache.timestamp < HEALTH_CACHE_TTL) {
        console.debug("Utilisation du cache pour le health check de la base de données");
        return {
          isConnected: healthCache.status,
          stats: healthCache.stats
        };
      }

      // Exécuter une requête simple pour vérifier la connexion
      const startTime = performance.now();
      
      // @ts-ignore - Accéder aux propriétés internes de notre class PrismaClientWithReconnect
      const connectionErrors = (prisma as any).connectionErrors || 0;
      // @ts-ignore - Accéder aux propriétés internes de notre class PrismaClientWithReconnect
      const totalQueries = (prisma as any).totalQueries || 0;
      // @ts-ignore - Accéder aux propriétés internes de notre class PrismaClientWithReconnect
      const connectionCreationTime = (prisma as any).connectionCreationTime || Date.now();
      
      await prisma.$queryRaw`SELECT 1 as health_check`;
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;

      // Calculer les statistiques
      const stats: DatabaseStats = {
        connectionErrors,
        averageQueryTime: queryTime,
        queriesPerMinute: totalQueries / ((Date.now() - connectionCreationTime) / 60000 || 1),
        lastCheckTime: new Date().toISOString()
      };

      // Mettre à jour le cache
      healthCache = {
        timestamp: now,
        status: true,
        stats
      };

      return {
        isConnected: true,
        stats
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de santé de la base de données", error);

      // Mettre à jour le cache avec l'état d'erreur
      const stats: DatabaseStats = {
        // @ts-ignore - Accéder aux propriétés internes de notre class PrismaClientWithReconnect
        connectionErrors: ((prisma as any).connectionErrors || 0) + 1,
        averageQueryTime: null,
        queriesPerMinute: 0,
        lastCheckTime: new Date().toISOString()
      };

      healthCache = {
        timestamp: Date.now(),
        status: false,
        stats
      };

      return {
        isConnected: false,
        stats
      };
    }
  }

  /**
   * Récupère les statistiques basiques de la base de données
   * Nombre d'utilisateurs, défis, soumissions, etc.
   */
  static async getBasicStats(): Promise<{
    users: number;
    challenges: number;
    submissions: number;
  }> {
    try {
      // Utiliser Promise.all pour paralléliser les requêtes et améliorer les performances
      const [users, challenges, submissions] = await Promise.all([
        prisma.user.count(),
        prisma.challenge.count(),
        prisma.submission.count()
      ]);

      return {
        users,
        challenges,
        submissions
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de base de données", error);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        users: 0,
        challenges: 0,
        submissions: 0
      };
    }
  }
}
