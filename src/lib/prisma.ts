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
      const result = await this.$queryRaw`SELECT 1 as health_check`;
      
      // Vérifier que la réponse est correcte
      if (Array.isArray(result) && result.length > 0 && result[0].health_check === 1) {
        // Si on arrive ici, la connexion est fonctionnelle
        this.connectionHealthy = true;
        
        // Ne pas logger à chaque vérification réussie pour éviter trop de logs
        if (this.connectionErrors > 0) {
          dbLogger.info("Connexion à la base de données rétablie après erreurs");
          this.connectionErrors = 0;
        }
        
        return true;
      } else {
        throw new Error("Résultat de vérification de santé invalide");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      dbLogger.error("Échec de la vérification de santé de la connexion", err);
      
      this.connectionHealthy = false;
      this.connectionErrors++;
      
      // Si plusieurs erreurs consécutives, tenter une reconnexion
      if (this.connectionErrors >= 3 && !this.isConnecting) {
        dbLogger.warn(`${this.connectionErrors} erreurs consécutives détectées, tentative de reconnexion automatique`);
        this.handleReconnect().catch(e => {
          dbLogger.error("Erreur lors de la tentative de reconnexion suite à échec de vérification", 
            e instanceof Error ? e : new Error(String(e)));
        });
      }
      
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
        // Attendre un court délai après la déconnexion pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (disconnectError) {
        // Ignorer les erreurs de déconnexion, continuer avec la reconnexion
        dbLogger.debug("Erreur lors de la déconnexion (ignorée): " + 
          (disconnectError instanceof Error ? disconnectError.message : String(disconnectError)));
      }
      
      // Attendre avant de tenter la reconnexion (backoff exponentiel)
      const delay = getBackoffDelay(this.reconnectAttempts);
      dbLogger.info(`Attente de ${Math.round(delay / 1000)} secondes avant la prochaine tentative...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Utiliser un timeout pour éviter des tentatives de connexion qui traînent
      const connectionPromise = this.$connect();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("Délai de connexion dépassé")), DB_CONFIG.reconnectTimeoutMs);
      });

      // Attendre la connexion ou le timeout, selon ce qui arrive en premier
      await Promise.race([connectionPromise, timeoutPromise]);
      
      // Réinitialiser les compteurs après une reconnexion réussie
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectionHealthy = true;
      this.lastQueryTime = Date.now();
      this.connectionCreationTime = Date.now();
      
      // Émettre l'événement de connexion
      this.connectionEmitter.emit('connected');
      
      dbLogger.info("Reconnexion à la base de données réussie.");
      
      // Vérifier immédiatement la connexion pour confirmer qu'elle fonctionne
      setTimeout(() => this.checkConnection(), 1000);
    } catch (reconnectError) {
      const error = reconnectError instanceof Error ? reconnectError : new Error(String(reconnectError));
      dbLogger.error("Échec de la tentative de reconnexion", error);
      
      this.isConnecting = false;
      
      // Vérifier si nous avons atteint le nombre maximum de tentatives
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        dbLogger.error(`Nombre maximum de tentatives de reconnexion atteint (${this.maxReconnectAttempts}). Pause temporaire.`);
        // Réinitialiser après une pause plus longue pour permettre au serveur de récupérer
        setTimeout(() => {
          dbLogger.info("Reprise des tentatives de reconnexion après pause");
          this.reconnectAttempts = 0;
          this.handleReconnect().catch(e => {
            dbLogger.error("Erreur dans la reprise de tentative de reconnexion", 
              e instanceof Error ? e : new Error(String(e)));
          });
        }, 60000); // Pause d'une minute
        return;
      }
      
      // Tenter à nouveau si nous n'avons pas atteint le maximum
      setTimeout(() => {
        this.handleReconnect().catch(e => {
          dbLogger.error("Erreur dans la tentative de reconnexion après délai", 
            e instanceof Error ? e : new Error(String(e)));
        });
      }, Math.min(1000 * this.reconnectAttempts, 15000)); // Délai progressif, max 15 secondes
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
   * Démarre la vérification périodique de la santé de la connexion
   */
  private startConnectionHealthCheck() {
    // Nettoyer tout timer existant
    if (this.connectionCheckTimer) {
      clearInterval(this.connectionCheckTimer);
    }
    
    // Créer un nouveau timer pour la vérification périodique
    this.connectionCheckTimer = setInterval(async () => {
      try {
        dbLogger.info("Vérification de la santé de la connexion à la base de données");
        
        // Calculer le temps depuis la dernière requête
        const timeSinceLastQuery = Date.now() - this.lastQueryTime;
        
        // Si aucune activité récente ou si des erreurs ont été détectées, vérifier la connexion
        if (timeSinceLastQuery > DB_CONFIG.pingInterval || this.connectionErrors > 0) {
          await this.checkConnection();
        } else {
          dbLogger.debug(`Vérification de connexion ignorée, dernière requête il y a ${Math.round(timeSinceLastQuery/1000)}s`);
        }
        
        // Vérifier l'âge de la connexion pour la recycler si nécessaire
        const connectionAge = Date.now() - this.connectionCreationTime;
        if (connectionAge > DB_CONFIG.maxConnectionAge && this.connectionHealthy && !this.isConnecting) {
          dbLogger.info(`La connexion a atteint l'âge maximum (${Math.round(connectionAge/60000)} minutes), recyclage en cours...`);
          await this.reconnect().catch(e => {
            dbLogger.error("Erreur lors du recyclage de la connexion", 
              e instanceof Error ? e : new Error(String(e)));
          });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dbLogger.error("Erreur lors de la vérification de santé de la connexion", err);
      }
    }, DB_CONFIG.healthCheckInterval);
    
    // S'assurer que le timer ne bloque pas la fin du programme
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