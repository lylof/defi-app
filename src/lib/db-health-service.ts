import { prisma } from "@/lib/prisma";

/**
 * Interface pour les statistiques de santé de la base de données
 */
export interface DbHealthStats {
  isConnected: boolean;
  lastCheckTime: Date;
  connectionErrors: number;
  averageQueryTime: number | null;
  status: 'healthy' | 'degraded' | 'critical';
}

/**
 * Service pour surveiller la santé de la base de données
 * Fournit des méthodes pour vérifier l'état de la connexion et obtenir des statistiques
 */
export class DbHealthService {
  private static instance: DbHealthService;
  private isConnected: boolean = true;
  private lastCheckTime: Date = new Date();
  private connectionErrors: number = 0;
  private queryTimes: number[] = [];
  private maxQueryTimesToKeep: number = 100;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly checkIntervalTime: number = 60000; // 1 minute

  /**
   * Constructeur privé pour le singleton
   */
  private constructor() {
    this.startHealthCheck();
  }

  /**
   * Obtenir l'instance unique du service
   */
  public static getInstance(): DbHealthService {
    if (!DbHealthService.instance) {
      DbHealthService.instance = new DbHealthService();
    }
    return DbHealthService.instance;
  }

  /**
   * Démarrer la vérification périodique de la santé de la base de données
   */
  private startHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.checkHealth();
    }, this.checkIntervalTime);

    // Effectuer une vérification immédiate
    this.checkHealth();
  }

  /**
   * Vérifier la santé de la base de données
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Exécuter une requête simple pour vérifier la connexion
      await prisma.$queryRaw`SELECT 1 as health_check`;
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      // Enregistrer le temps de requête
      this.addQueryTime(queryTime);
      
      this.isConnected = true;
      this.lastCheckTime = new Date();
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de la santé de la base de données:", error);
      this.isConnected = false;
      this.lastCheckTime = new Date();
      this.connectionErrors++;
      
      return false;
    }
  }

  /**
   * Ajouter un temps de requête à l'historique
   */
  private addQueryTime(time: number): void {
    this.queryTimes.push(time);
    
    // Limiter le nombre de temps de requête conservés
    if (this.queryTimes.length > this.maxQueryTimesToKeep) {
      this.queryTimes.shift();
    }
  }

  /**
   * Calculer le temps moyen des requêtes
   */
  private getAverageQueryTime(): number | null {
    if (this.queryTimes.length === 0) {
      return null;
    }
    
    const sum = this.queryTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.queryTimes.length;
  }

  /**
   * Déterminer le statut de santé de la base de données
   */
  private getHealthStatus(): 'healthy' | 'degraded' | 'critical' {
    if (!this.isConnected) {
      return 'critical';
    }
    
    const avgTime = this.getAverageQueryTime();
    
    if (avgTime === null) {
      return this.connectionErrors > 0 ? 'degraded' : 'healthy';
    }
    
    if (avgTime > 500 || this.connectionErrors > 5) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Obtenir les statistiques de santé de la base de données
   */
  public getHealthStats(): DbHealthStats {
    return {
      isConnected: this.isConnected,
      lastCheckTime: this.lastCheckTime,
      connectionErrors: this.connectionErrors,
      averageQueryTime: this.getAverageQueryTime(),
      status: this.getHealthStatus()
    };
  }

  /**
   * Réinitialiser les statistiques d'erreur
   */
  public resetErrorStats(): void {
    this.connectionErrors = 0;
    this.queryTimes = [];
  }

  /**
   * Nettoyer les ressources lors de la fermeture de l'application
   */
  public cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Initialiser le service au démarrage de l'application
export const dbHealthService = DbHealthService.getInstance();

// Nettoyer les ressources lors de la fermeture de l'application
if (typeof window === 'undefined') { // Seulement côté serveur
  process.on('beforeExit', () => {
    dbHealthService.cleanup();
  });
} 