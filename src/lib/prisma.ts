import { PrismaClient, Prisma } from "@prisma/client";
import { DB_CONFIG, getOptimizedConnectionString, getBackoffDelay } from "./db-config";
import { dbLogger } from "./logger";

// Type pour le cache global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configuration et options du client Prisma
 * Activation des logs en développement pour faciliter le debugging
 */
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === "development" 
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : undefined,
  
  // Optimiser la chaîne de connexion avec les paramètres de db-config
  datasources: {
    db: {
      url: process.env.DATABASE_URL 
        ? getOptimizedConnectionString(process.env.DATABASE_URL)
        : process.env.DATABASE_URL,
    },
  },
};

// Définition des types d'événements Prisma
type PrismaErrorEvent = {
  message: string;
  target: string;
  timestamp: string;
};

/**
 * Classe étendue de PrismaClient pour gérer les reconnexions automatiques
 * et optimiser les performances de connexion à la base de données
 */
class PrismaClientWithReconnect extends PrismaClient {
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = DB_CONFIG.maxRetryAttempts;
  private readonly reconnectInterval: number = DB_CONFIG.retryInterval;
  private readonly connectionCheckInterval: number = DB_CONFIG.pingInterval;
  private connectionCheckTimer: NodeJS.Timeout | null = null;
  private lastQueryTime: number = Date.now();
  private connectionHealthy: boolean = true;
  private connectionErrors: number = 0;
  private totalQueries: number = 0;
  private successfulQueries: number = 0;

  constructor(options?: Prisma.PrismaClientOptions) {
    super(options);
    this.setupErrorHandlers();
    this.startConnectionHealthCheck();
    this.logConnectionInfo();
  }

  /**
   * Affiche les informations de configuration de connexion
   */
  private logConnectionInfo() {
    dbLogger.info("Initialisation du client Prisma avec reconnexion automatique", {
      metadata: {
        maxRetryAttempts: this.maxReconnectAttempts,
        reconnectInterval: this.reconnectInterval,
        connectionCheckInterval: this.connectionCheckInterval,
        databaseUrl: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.split("@")[0].substring(0, 15)}...` 
          : "Non définie"
      }
    });
  }

  /**
   * Configure les gestionnaires d'événements pour détecter les erreurs de connexion
   */
  private setupErrorHandlers() {
    try {
      // Gérer les événements d'erreur Prisma pour détecter les déconnexions
      this.$on('error' as never, async (e: PrismaErrorEvent) => {
        try {
          // Vérifier que e est un objet valide pour éviter les erreurs null/undefined
          if (!e || typeof e !== 'object') {
            dbLogger.error('Événement d\'erreur Prisma invalide ou null', new Error('Événement d\'erreur invalide'));
            return;
          }

          // S'assurer que les propriétés nécessaires existent
          const message = e.message || 'Erreur inconnue dans Prisma';
          const target = e.target || 'unknown';
          const timestamp = e.timestamp || new Date();

          dbLogger.error(`Erreur Prisma détectée: ${message}`, new Error(message), {
            metadata: {
              target,
              timestamp
            }
          });
          
          this.connectionHealthy = false;
          this.connectionErrors++;
          
          // Détecter les erreurs de connexion courantes
          const isConnectionError = 
            typeof message === 'string' && (
              message.includes('connection') || 
              message.includes('timed out') || 
              message.includes('Closed') ||
              message.includes('timeout') ||
              message.includes('ECONNREFUSED') ||
              message.includes('ETIMEDOUT')
            );
          
          if (isConnectionError) {
            await this.reconnect().catch(reconnectError => {
              // Gestion sécurisée des erreurs potentiellement null ou undefined
              const errorObj = reconnectError instanceof Error 
                ? reconnectError 
                : reconnectError 
                  ? new Error(String(reconnectError))
                  : new Error('Erreur inconnue lors de la reconnexion');
              
              dbLogger.error('Erreur lors de la tentative de reconnexion', errorObj);
            });
          }
        } catch (handlerError) {
          // Gestion sécurisée des erreurs potentiellement null ou undefined
          const errorObj = handlerError instanceof Error 
            ? handlerError 
            : handlerError 
              ? new Error(String(handlerError))
              : new Error('Erreur inconnue dans le gestionnaire d\'erreurs');
          
          dbLogger.error('Erreur dans le gestionnaire d\'erreurs Prisma', errorObj);
        }
      });
      
      // Surveiller les requêtes réussies pour marquer la connexion comme saine
      this.$on('query' as never, (e: any) => {
        try {
          // Vérifier que e est un objet valide pour éviter les erreurs null/undefined
          if (!e || typeof e !== 'object') {
            return; // Ignorer silencieusement les événements de requête invalides
          }

          this.lastQueryTime = Date.now();
          this.connectionHealthy = true;
          this.totalQueries++;
          this.successfulQueries++;
          
          // Log détaillé en mode développement uniquement
          if (process.env.NODE_ENV === "development") {
            const duration = e.duration || 0;
            const query = e.query || 'requête inconnue';
            const params = e.params || [];
            
            dbLogger.debug(`Requête SQL exécutée en ${duration}ms`, {
              metadata: {
                query,
                params,
                duration
              }
            });
          }
        } catch (queryHandlerError) {
          // Gestion sécurisée des erreurs potentiellement null ou undefined
          const errorObj = queryHandlerError instanceof Error 
            ? queryHandlerError 
            : queryHandlerError 
              ? new Error(String(queryHandlerError))
              : new Error('Erreur inconnue dans le gestionnaire de requêtes');
            
          dbLogger.error('Erreur lors du traitement d\'un événement de requête', errorObj);
        }
      });
      
      dbLogger.info('Gestionnaires d\'événements Prisma configurés avec succès');
    } catch (setupError) {
      // Gestion sécurisée des erreurs potentiellement null ou undefined
      const errorObj = setupError instanceof Error 
        ? setupError 
        : setupError 
          ? new Error(String(setupError))
          : new Error('Erreur inconnue lors de la configuration des gestionnaires');
        
      dbLogger.error('Erreur lors de la configuration des gestionnaires d\'événements Prisma', errorObj);
    }
  }

  /**
   * Démarre une vérification périodique de l'état de la connexion
   */
  private startConnectionHealthCheck() {
    // Nettoyer tout timer existant
    if (this.connectionCheckTimer) {
      clearInterval(this.connectionCheckTimer);
    }
    
    // Créer un nouveau timer pour vérifier périodiquement la connexion
    this.connectionCheckTimer = setInterval(async () => {
      try {
        // Si aucune requête n'a été effectuée depuis longtemps, vérifier la connexion
        const timeSinceLastQuery = Date.now() - this.lastQueryTime;
        if (timeSinceLastQuery > this.connectionCheckInterval) {
          dbLogger.info("Vérification de la santé de la connexion à la base de données");
          
          try {
            // Exécuter une requête simple pour vérifier la connexion
            await this.$queryRaw`SELECT 1 as health_check`;
            this.connectionHealthy = true;
            dbLogger.info("Connexion à la base de données vérifiée avec succès");
          } catch (error) {
            // Gestion sécurisée des erreurs potentiellement null ou undefined
            const errorObj = error instanceof Error 
              ? error 
              : error 
                ? new Error(String(error))
                : new Error('Erreur inconnue lors de la vérification de santé');
            
            dbLogger.error("Échec de la vérification de santé de la connexion", errorObj);
            this.connectionHealthy = false;
            this.connectionErrors++;
            
            await this.reconnect().catch(reconnectError => {
              // Gestion sécurisée des erreurs potentiellement null ou undefined
              const reconnectErrorObj = reconnectError instanceof Error 
                ? reconnectError 
                : reconnectError 
                  ? new Error(String(reconnectError))
                  : new Error('Erreur inconnue lors de la reconnexion');
              
              dbLogger.error('Erreur lors de la tentative de reconnexion pendant la vérification de santé', reconnectErrorObj);
            });
          }
        }
      } catch (timerError) {
        dbLogger.error('Erreur dans le timer de vérification de santé', 
          timerError instanceof Error ? timerError : new Error(String(timerError)));
      }
    }, this.connectionCheckInterval);
  }

  /**
   * Tente de se reconnecter à la base de données avec un mécanisme de backoff exponentiel
   */
  async reconnect(): Promise<void> {
    // Protection contre les appels concurrents
    if (this.isConnecting) {
      dbLogger.debug('Tentative de reconnexion déjà en cours, ignorée');
      return;
    }
    
    // Limite des tentatives
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      dbLogger.error(`Échec après ${this.maxReconnectAttempts} tentatives de reconnexion à la base de données.`);
      // Réinitialiser les tentatives après un délai plus long
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.reconnect().catch(retryError => {
          // Gestion sécurisée des erreurs potentiellement null ou undefined
          const errorObj = retryError instanceof Error 
            ? retryError 
            : retryError 
              ? new Error(String(retryError))
              : new Error('Erreur inconnue lors de la reconnexion');
          dbLogger.error('Erreur lors de la nouvelle tentative de reconnexion après délai', errorObj);
        });
      }, this.reconnectInterval * 5);
      return;
    }

    this.isConnecting = true;
    this.reconnectAttempts++;

    try {
      dbLogger.info(`Tentative de reconnexion à la base de données (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Déconnecter proprement
      try {
        await this.$disconnect();
      } catch (disconnectError) {
        // Gestion sécurisée des erreurs potentiellement null ou undefined
        const errorObj = disconnectError instanceof Error 
          ? disconnectError 
          : disconnectError 
            ? new Error(String(disconnectError))
            : new Error('Erreur inconnue lors de la déconnexion');
        
        dbLogger.warn('Erreur lors de la déconnexion avant reconnexion', {
          metadata: { 
            errorMessage: errorObj.message,
          }
        });
        // Continuer malgré l'erreur de déconnexion
      }
      
      // Utiliser le backoff exponentiel de db-config
      const backoffTime = getBackoffDelay(this.reconnectAttempts);
      dbLogger.info(`Attente de ${Math.round(backoffTime / 1000)} secondes avant la prochaine tentative...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Tenter la reconnexion avec timeout
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de connexion dépassé')), 30000);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      dbLogger.info('Reconnexion à la base de données réussie.');
      this.reconnectAttempts = 0;
      this.connectionHealthy = true;
      this.lastQueryTime = Date.now();
    } catch (error) {
      // Gérer l'erreur de façon sécurisée
      try {
        // Gestion sécurisée des erreurs potentiellement null ou undefined
        const errorObj = error instanceof Error 
          ? error 
          : error 
            ? new Error(String(error))
            : new Error('Erreur inconnue lors de la reconnexion');
        
        dbLogger.error('Échec de la tentative de reconnexion', errorObj);
        
        // Programmer une nouvelle tentative après un délai avec backoff exponentiel
        const nextDelay = getBackoffDelay(this.reconnectAttempts + 1);
        setTimeout(() => {
          this.reconnect().catch(retryError => {
            // Gestion sécurisée des erreurs potentiellement null ou undefined
            const retryErrorObj = retryError instanceof Error 
              ? retryError 
              : retryError 
                ? new Error(String(retryError))
                : new Error('Erreur inconnue lors de la reconnexion');
            
            dbLogger.error('Erreur lors de la nouvelle tentative de reconnexion', retryErrorObj);
          });
        }, nextDelay);
      } catch (handlerError) {
        // Gestion sécurisée des erreurs potentiellement null ou undefined
        const handlerErrorObj = handlerError instanceof Error 
          ? handlerError 
          : handlerError 
            ? new Error(String(handlerError))
            : new Error('Erreur critique inconnue dans le gestionnaire d\'erreur');
        
        dbLogger.error('Erreur critique dans le gestionnaire d\'erreur de reconnexion', handlerErrorObj);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Nettoie les ressources lors de la fermeture de l'application
   */
  async cleanup() {
    dbLogger.info('Nettoyage des ressources de la base de données');
    if (this.connectionCheckTimer) {
      clearInterval(this.connectionCheckTimer);
      this.connectionCheckTimer = null;
    }
    
    try {
      await this.$disconnect();
      dbLogger.info('Déconnexion de la base de données effectuée');
    } catch (error) {
      // Gestion sécurisée des erreurs potentiellement null ou undefined
      const errorObj = error instanceof Error 
        ? error 
        : error 
          ? new Error(String(error))
          : new Error('Erreur inconnue lors de la déconnexion');
      
      dbLogger.error('Erreur lors de la déconnexion de la base de données', errorObj);
    }
  }
  
  /**
   * Vérifie si la connexion est actuellement en bon état
   * @returns true si la connexion est saine, false sinon
   */
  isConnectionHealthy() {
    return this.connectionHealthy;
  }
  
  /**
   * Obtient des statistiques sur la connexion à la base de données
   * @returns Statistiques de connexion
   */
  getConnectionStats() {
    return {
      healthy: this.connectionHealthy,
      errors: this.connectionErrors,
      totalQueries: this.totalQueries,
      successRate: this.totalQueries > 0 
        ? Math.round((this.successfulQueries / this.totalQueries) * 100) 
        : 100,
      lastQueryTime: new Date(this.lastQueryTime),
      reconnectAttempts: this.reconnectAttempts
    };
  }
  
  /**
   * Réinitialise les statistiques de connexion
   */
  resetConnectionStats() {
    dbLogger.info('Réinitialisation des statistiques de connexion');
    this.connectionErrors = 0;
    this.totalQueries = 0;
    this.successfulQueries = 0;
  }
}

// Initialisation du client Prisma avec gestion du cache en développement
export const prisma = globalForPrisma.prisma ?? new PrismaClientWithReconnect(prismaClientOptions);

// Assurer qu'en développement, nous n'avons qu'une seule instance
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Gestion initiale de la connexion à la base de données
prisma.$connect()
  .then(() => {
    dbLogger.info('Connexion à la base de données établie avec succès.');
  })
  .catch((error) => {
    // Gestion sécurisée des erreurs potentiellement null ou undefined
    const errorObj = error instanceof Error 
      ? error 
      : error 
        ? new Error(String(error))
        : new Error('Erreur inconnue lors de la connexion initiale');
        
    dbLogger.error("Erreur de connexion initiale à la base de données", errorObj);
    
    // Tentative de reconnexion après l'échec initial
    if (prisma instanceof PrismaClientWithReconnect) {
      prisma.reconnect().catch(reconnectError => {
        // Gestion sécurisée des erreurs potentiellement null ou undefined
        const reconnectErrorObj = reconnectError instanceof Error 
          ? reconnectError 
          : reconnectError 
            ? new Error(String(reconnectError))
            : new Error('Erreur inconnue lors de la reconnexion initiale');
          
        dbLogger.error('Erreur lors de la tentative de reconnexion initiale', reconnectErrorObj);
      });
    }
  });

// Gestion propre de la fermeture de connexion
process.on("beforeExit", async () => {
  try {
    if (prisma instanceof PrismaClientWithReconnect) {
      await prisma.cleanup();
    } else {
      await prisma.$disconnect();
    }
    dbLogger.info('Connexion à la base de données fermée proprement.');
  } catch (error) {
    // Gestion sécurisée des erreurs potentiellement null ou undefined
    const errorObj = error instanceof Error 
      ? error 
      : error 
        ? new Error(String(error))
        : new Error('Erreur inconnue lors de la fermeture de connexion');
        
    dbLogger.error('Erreur lors de la fermeture de la connexion à la base de données', errorObj);
  }
});

// En développement, loguer les requêtes pour le debug
if (process.env.NODE_ENV === "development") {
  // Types pour les événements de requête
  type PrismaQueryEvent = {
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  // Écouter les événements de requête
  prisma.$on('query' as never, (e: PrismaQueryEvent) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  });
} 