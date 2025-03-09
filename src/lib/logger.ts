/**
 * Service de journalisation avancé pour LPT Défis
 * 
 * Ce service fournit des fonctions pour enregistrer des messages de log
 * avec différents niveaux de sévérité, des contextes et des métadonnées.
 * Il permet également de filtrer les logs par niveau et de les formater
 * de manière cohérente.
 */

// Types de niveaux de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Interface pour les métadonnées de log
export interface LogMetadata {
  [key: string]: any;
  error?: Error;
}

// Interface pour les options de log
export interface LogOptions {
  context?: string;
  metadata?: LogMetadata;
  timestamp?: Date;
  userId?: string;
  requestId?: string;
}

// Configuration du logger
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableMetadata: boolean;
  enableTimestamp: boolean;
  enableStackTrace: boolean;
  maxMetadataDepth: number;
}

// Ordre des niveaux de log pour le filtrage
const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

// Configuration par défaut
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableMetadata: true,
  enableTimestamp: true,
  enableStackTrace: true,
  maxMetadataDepth: 3
};

/**
 * Classe principale du logger
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private contextData: Record<string, any> = {};

  /**
   * Constructeur privé pour le singleton
   */
  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Obtenir l'instance unique du logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    } else if (config) {
      // Mettre à jour la configuration si fournie
      Logger.instance.config = { ...Logger.instance.config, ...config };
    }
    return Logger.instance;
  }

  /**
   * Définir des données de contexte globales
   */
  public setContext(key: string, value: any): void {
    this.contextData[key] = value;
  }

  /**
   * Supprimer une donnée de contexte
   */
  public clearContext(key: string): void {
    delete this.contextData[key];
  }

  /**
   * Réinitialiser toutes les données de contexte
   */
  public clearAllContext(): void {
    this.contextData = {};
  }

  /**
   * Vérifier si un niveau de log doit être enregistré
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[this.config.minLevel];
  }

  /**
   * Formater un objet de métadonnées pour l'affichage
   */
  private formatMetadata(metadata: any, depth: number = 0): string {
    if (depth > this.config.maxMetadataDepth) {
      return '[Objet trop profond]';
    }

    if (metadata === null || metadata === undefined) {
      return String(metadata);
    }

    if (typeof metadata !== 'object') {
      return String(metadata);
    }

    try {
      // Formater les objets de manière lisible
      return JSON.stringify(metadata, (key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        }
        return value;
      }, 2);
    } catch (error) {
      return '[Erreur de formatage]';
    }
  }

  /**
   * Enregistrer un message avec le niveau spécifié
   */
  private log(level: LogLevel, message: string, options: LogOptions = {}): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = options.timestamp || new Date();
    const context = options.context || 'app';
    const metadata = {
      ...this.contextData,
      ...(options.metadata || {}),
      ...(options.userId ? { userId: options.userId } : {}),
      ...(options.requestId ? { requestId: options.requestId } : {})
    };

    // Construire le message de log
    let logMessage = '';

    // Ajouter le timestamp si activé
    if (this.config.enableTimestamp) {
      logMessage += `[${timestamp.toISOString()}] `;
    }

    // Ajouter le niveau et le contexte
    logMessage += `${level.toUpperCase()} [${context}] ${message}`;

    // Ajouter les métadonnées si activées
    if (this.config.enableMetadata && Object.keys(metadata).length > 0) {
      logMessage += `\n${this.formatMetadata(metadata)}`;
    }

    // Ajouter la stack trace pour les erreurs si activée
    if (level === 'error' || level === 'fatal') {
      if (this.config.enableStackTrace && metadata.error instanceof Error) {
        logMessage += `\nStack: ${metadata.error.stack || 'Non disponible'}`;
      }
    }

    // Envoyer le log à la console
    if (this.config.enableConsole) {
      switch (level) {
        case 'debug':
          console.debug(logMessage);
          break;
        case 'info':
          console.info(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'error':
        case 'fatal':
          console.error(logMessage);
          break;
      }
    }
  }

  /**
   * Enregistrer un message de niveau debug
   */
  public debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }

  /**
   * Enregistrer un message de niveau info
   */
  public info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  /**
   * Enregistrer un message de niveau warn
   */
  public warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  /**
   * Enregistrer un message de niveau error
   */
  public error(message: string, error?: Error, options?: LogOptions): void {
    const metadata: LogMetadata = { ...(options?.metadata || {}), error };
    this.log('error', message, { ...options, metadata });
  }

  /**
   * Enregistrer un message de niveau fatal
   */
  public fatal(message: string, error?: Error, options?: LogOptions): void {
    const metadata: LogMetadata = { ...(options?.metadata || {}), error };
    this.log('fatal', message, { ...options, metadata });
  }

  /**
   * Créer un logger avec un contexte spécifique
   */
  public createContextLogger(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }
}

/**
 * Logger avec un contexte prédéfini
 */
export class ContextLogger {
  constructor(private logger: Logger, private context: string) {}

  public debug(message: string, options?: Omit<LogOptions, 'context'>): void {
    this.logger.debug(message, { ...options, context: this.context });
  }

  public info(message: string, options?: Omit<LogOptions, 'context'>): void {
    this.logger.info(message, { ...options, context: this.context });
  }

  public warn(message: string, options?: Omit<LogOptions, 'context'>): void {
    this.logger.warn(message, { ...options, context: this.context });
  }

  public error(message: string, error?: Error, options?: Omit<LogOptions, 'context'>): void {
    this.logger.error(message, error, { ...options, context: this.context });
  }

  public fatal(message: string, error?: Error, options?: Omit<LogOptions, 'context'>): void {
    this.logger.fatal(message, error, { ...options, context: this.context });
  }
}

// Exporter une instance par défaut du logger
export const logger = Logger.getInstance();

// Créer des loggers contextuels pour les différentes parties de l'application
export const dbLogger = logger.createContextLogger('database');
export const authLogger = logger.createContextLogger('auth');
export const apiLogger = logger.createContextLogger('api');
export const appLogger = logger.createContextLogger('app'); 