import { PrismaClient, Prisma } from "@prisma/client";
import { DB_CONFIG, getOptimizedConnectionString, getBackoffDelay } from "./db-config";
import { dbLogger } from "./logger";
import { EventEmitter } from 'events';
import { isEdgeRuntime } from "./prisma-edge";
import { prismaEdge } from "./prisma-edge";

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
  private connectionCreationTime: number = Date.now();
  private connectionPromise: Promise<boolean> | null = null;
  private connectionEmitter: EventEmitter = new EventEmitter();

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
          const errorMessage = e.message || 'Erreur inconnue';
          const target = e.target || 'unknown';
          
          this.connectionErrors++;
          this.connectionHealthy = false;
          
          // Créer un objet Error pour le logging
          const error = new Error(errorMessage);
          dbLogger.error(`Erreur Prisma détectée: ${errorMessage}`, error);
          
          // Détecter les erreurs de connexion
          const isConnectionError = 
            errorMessage.includes("Can't reach database server") ||
            errorMessage.includes("connection") ||
            errorMessage.includes("connect") ||
            errorMessage.includes("timeout") ||
            errorMessage.toLowerCase().includes("database");
            
          if (isConnectionError && !this.isConnecting) {
            await this.handleReconnect();
          }
          
        } catch (handlerError) {
          const error = handlerError instanceof Error ? handlerError : new Error(String(handlerError));
          dbLogger.error('Erreur dans le gestionnaire d\'événements Prisma:', error);
        }
      });
      
      // Surveiller les requêtes réussies
      this.$on('query' as never, () => {
        this.lastQueryTime = Date.now();
        this.totalQueries++;
        this.successfulQueries++;
        
        // Si une requête réussit, considérer la connexion comme saine
        if (!this.connectionHealthy) {
          this.connectionHealthy = true;
          this.connectionEmitter.emit('connected');
          dbLogger.info('Connexion à la base de données rétablie');
        }
      });
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      dbLogger.error('Erreur lors de la configuration des gestionnaires d\'événements:', err);
    }
  }

  /**
   * Vérifie l'état de la connexion en exécutant une requête simple
   * @returns Promise<boolean> - true si la connexion est OK, false sinon
   */
  private async checkConnection(): Promise<boolean> {
    try {
      // Exécuter une requête simple pour vérifier la connexion
      await this.$queryRaw`SELECT 1 as health_check`;
      
      // Si on arrive ici, la connexion est fonctionnelle
      this.connectionHealthy = true;
      dbLogger.info("Connexion à la base de données vérifiée avec succès");
      
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      dbLogger.error("Échec de la vérification de santé de la connexion", err);
      
      this.connectionHealthy = false;
      this.connectionErrors++;
      
      return false;
    }
  }

  /**
   * Gère le processus de reconnexion avec backoff exponentiel
   */
  private async handleReconnect(): Promise<void> {
    // Éviter les tentatives de reconnexion simultanées
    if (this.isConnecting) {
      dbLogger.debug("Tentative de reconnexion déjà en cours, ignorée");
      return;
    }
    
    this.isConnecting = true;
    this.reconnectAttempts++;
    
    try {
      // Log avec le numéro de tentative
      dbLogger.info(`Tentative de reconnexion à la base de données (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Déconnecter d'abord avant de reconnecter
      try {
        await this.$disconnect();
      } catch (disconnectError) {
        // Ignorer les erreurs de déconnexion, continuer avec la reconnexion
        dbLogger.debug("Erreur lors de la déconnexion (ignorée): " + 
          (disconnectError instanceof Error ? disconnectError.message : String(disconnectError)));
      }
      
      // Attendre avant de tenter la reconnexion (backoff exponentiel)
      const delay = getBackoffDelay(this.reconnectAttempts);
      dbLogger.info(`Attente de ${Math.round(delay / 1000)} secondes avant la prochaine tentative...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Tenter la reconnexion
      await this.$connect();
      
      // Réinitialiser les compteurs après une reconnexion réussie
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectionHealthy = true;
      this.lastQueryTime = Date.now();
      this.connectionCreationTime = Date.now();
      
      // Émettre l'événement de connexion
      this.connectionEmitter.emit('connected');
      
      dbLogger.info("Reconnexion à la base de données réussie.");
    } catch (reconnectError) {
      const error = reconnectError instanceof Error ? reconnectError : new Error(String(reconnectError));
      dbLogger.error("Échec de la tentative de reconnexion", error);
      
      this.isConnecting = false;
      
      // Vérifier si nous avons atteint le nombre maximum de tentatives
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        dbLogger.error(`Nombre maximum de tentatives de reconnexion atteint (${this.maxReconnectAttempts}). Abandon.`);
        this.reconnectAttempts = 0; // réinitialiser pour les tentatives futures
        return;
      }
      
      // Tenter à nouveau si nous n'avons pas atteint le maximum
      this.handleReconnect().catch(e => {
        dbLogger.error("Erreur dans la tentative de reconnexion récursive", 
          e instanceof Error ? e : new Error(String(e)));
      });
    }
  }

  /**
   * Attend que la connexion à la base de données soit établie
   * Utile pour les opérations qui nécessitent une connexion active
   * @param timeout Délai maximum d'attente en ms (par défaut: 30000ms)
   * @returns Promise<boolean> qui indique si la connexion est établie
   */
  public async waitForConnection(timeout: number = 30000): Promise<boolean> {
    // Si la connexion est déjà saine, retourner immédiatement
    if (this.connectionHealthy) {
      return true;
    }
    
    // Si une vérification est déjà en cours, attendre son résultat
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    // Créer une nouvelle promesse de connexion
    this.connectionPromise = new Promise<boolean>((resolve) => {
      // Fonction pour résoudre la promesse quand la connexion est établie
      const onConnected = () => {
        cleanup();
        resolve(true);
      };
      
      // Fonction pour résoudre la promesse en cas de timeout
      const onTimeout = () => {
        cleanup();
        resolve(false);
      };
      
      // Nettoyer les écouteurs
      const cleanup = () => {
        this.connectionEmitter.removeListener('connected', onConnected);
        clearTimeout(timeoutId);
      };
      
      // Configurer le timeout
      const timeoutId = setTimeout(onTimeout, timeout);
      
      // Écouter l'événement de connexion
      this.connectionEmitter.once('connected', onConnected);
      
      // Vérifier immédiatement l'état de la connexion
      this.checkConnection().then(isConnected => {
        if (isConnected) {
          cleanup();
          resolve(true);
        }
      }).catch(() => {}); // Ignorer les erreurs, elles seront gérées par les écouteurs
    });
    
    const result = await this.connectionPromise;
    this.connectionPromise = null;
    return result;
  }

  /**
   * Vérifie périodiquement l'état de la connexion et tente de se reconnecter si nécessaire
   */
  private startConnectionHealthCheck() {
    // Nettoyer tout timer existant pour éviter les fuites mémoire
    if (this.connectionCheckTimer) {
      clearInterval(this.connectionCheckTimer);
    }
    
    // Vérifier la connexion périodiquement
    this.connectionCheckTimer = setInterval(async () => {
      try {
        // Vérifier si la dernière requête est trop ancienne (connexion peut-être inactive)
        const timeSinceLastQuery = Date.now() - this.lastQueryTime;
        
        if (timeSinceLastQuery > this.connectionCheckInterval * 2) {
          dbLogger.info("Vérification de la santé de la connexion à la base de données");
          await this.checkConnection();
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dbLogger.error("Erreur lors de la vérification de santé de la connexion", err);
      }
    }, this.connectionCheckInterval);
    
    // S'assurer que le timer ne bloque pas la fermeture du processus Node
    if (this.connectionCheckTimer.unref) {
      this.connectionCheckTimer.unref();
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
    
    // Nettoyer les écouteurs d'événements process pour éviter les fuites mémoire
    // Note: PrismaClient n'est pas un EventEmitter, donc nous ne pouvons pas utiliser removeAllListeners
    // Mais nous pouvons nettoyer les écouteurs process qui pourraient avoir été ajoutés
    try {
      // Réduire le nombre d'écouteurs beforeExit
      const beforeExitListenersCount = process.listenerCount('beforeExit');
      if (beforeExitListenersCount > 10) {
        dbLogger.warn(`Nombre élevé d'écouteurs beforeExit détecté: ${beforeExitListenersCount}`);
      }
    } catch (listenerError) {
      // Formater l'erreur selon le format attendu par le logger
      const errorMessage = listenerError instanceof Error 
        ? listenerError.message 
        : listenerError 
          ? String(listenerError)
          : 'Erreur inconnue lors de la vérification des écouteurs';
      
      dbLogger.warn(`Erreur lors de la vérification des écouteurs process: ${errorMessage}`);
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

  /**
   * Méthode pour reconnecter manuellement à la base de données
   */
  async reconnect(): Promise<void> {
    await this.handleReconnect();
  }
}

/**
 * Factory pour créer l'instance Prisma appropriée selon l'environnement
 */
function createPrismaClient() {
  // Vérifier si nous sommes dans un environnement Edge
  if (isEdgeRuntime()) {
    console.warn("Utilisation de PrismaClient factice pour Edge Runtime");
    return prismaEdge;
  }

  // Vérifier si nous sommes côté serveur avant d'appeler setMaxListeners
  if (typeof process !== 'undefined' && typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(20);
  }

  // Utiliser l'instance existante en cache ou en créer une nouvelle
  const client = globalForPrisma.prisma ?? new PrismaClientWithReconnect(prismaClientOptions);

  // Assurer qu'en développement, nous n'avons qu'une seule instance
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  // Configurer la gestion de la connexion
  if (client instanceof PrismaClientWithReconnect) {
    // Gestion initiale de la connexion à la base de données
    client.$connect()
      .then(() => {
        dbLogger.info('Connexion à la base de données établie avec succès.');
      })
      .catch((error) => {
        const errorObj = error instanceof Error 
          ? error 
          : error 
            ? new Error(String(error))
            : new Error('Erreur inconnue lors de la connexion initiale');
            
        dbLogger.error("Erreur de connexion initiale à la base de données", errorObj);
        
        // Tentative de reconnexion après l'échec initial
        client.reconnect().catch((reconnectError: Error) => {
          const reconnectErrorObj = reconnectError instanceof Error 
            ? reconnectError 
            : reconnectError 
              ? new Error(String(reconnectError))
              : new Error('Erreur inconnue lors de la reconnexion initiale');
              
          dbLogger.error('Erreur lors de la tentative de reconnexion initiale', reconnectErrorObj);
        });
      });

    // Gestion propre de la fermeture de connexion
    if (typeof process !== 'undefined') {
      process.on("beforeExit", async () => {
        try {
          await client.cleanup();
          dbLogger.info('Connexion à la base de données fermée proprement.');
        } catch (error) {
          const errorObj = error instanceof Error 
            ? error 
            : error 
              ? new Error(String(error))
              : new Error('Erreur inconnue lors de la fermeture de connexion');
              
          dbLogger.error('Erreur lors de la fermeture de la connexion à la base de données', errorObj);
        }
      });
    }

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
      client.$on('query' as never, (e: PrismaQueryEvent) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }
  }

  return client;
}

// Export de l'instance Prisma au niveau du module (pas dans un bloc conditionnel)
export const prisma = createPrismaClient(); 