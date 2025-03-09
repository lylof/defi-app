/**
 * Configuration de la base de données PostgreSQL
 * 
 * Ce fichier contient les paramètres pour optimiser les connexions à la base de données,
 * réduire les déconnexions et gérer efficacement le pool de connexions.
 */

// Paramètres standards pour les connexions Postgres
export const DB_CONFIG = {
  // Paramètres de timeout et de connexion
  connectionTimeout: 60000, // 60 secondes pour établir une connexion
  queryTimeout: 30000,      // 30 secondes pour exécuter une requête
  
  // Paramètres pour le pool de connexion
  poolMin: 2,               // Nombre minimum de connexions à maintenir
  poolMax: 10,              // Nombre maximum de connexions dans le pool
  poolIdle: 10000,          // Temps (ms) avant qu'une connexion inutilisée soit fermée
  
  // Paramètres TCP keepalive
  keepalive: true,          // Activer les paquets keepalive TCP
  keepaliveInitialDelay: 30000, // Délai (ms) avant d'envoyer le premier paquet keepalive
  
  // Gestion des erreurs et retentatives
  maxRetryAttempts: 5,      // Nombre maximum de tentatives de reconnexion
  retryInterval: 5000,      // Intervalle initial (ms) entre les tentatives
  backoffFactor: 1.5,       // Facteur multiplicatif pour l'intervalle entre les tentatives
  
  // Temps maximal (ms) entre les pings pour vérifier l'état de la connexion
  pingInterval: 30000,
  
  // Paramètres d'optimisation SSL/TLS
  ssl: process.env.NODE_ENV === "production", // SSL en production uniquement
};

/**
 * Génère une chaîne de connexion avec paramètres optimisés pour réduire les déconnexions
 * 
 * @param url URL de base de la base de données
 * @returns URL avec paramètres optimisés
 */
export function getOptimizedConnectionString(url: string): string {
  // Si l'URL n'existe pas ou est déjà optimisée, la retourner telle quelle
  if (!url || url.includes("connection_limit=")) {
    return url;
  }
  
  try {
    // Ajouter des paramètres pour optimiser PostgreSQL
    const separator = url.includes("?") ? "&" : "?";
    const params = [
      `connect_timeout=${Math.floor(DB_CONFIG.connectionTimeout / 1000)}`,
      `statement_timeout=${Math.floor(DB_CONFIG.queryTimeout / 1000)}`,
      `connection_limit=${DB_CONFIG.poolMax}`,
      `pool_timeout=${Math.floor(DB_CONFIG.queryTimeout / 1000)}`,
      `idle_in_transaction_session_timeout=${Math.floor(DB_CONFIG.poolIdle / 1000)}`,
      "application_name=lpt_defis_app",
      "keepalives=1",
      `keepalives_idle=${Math.floor(DB_CONFIG.keepaliveInitialDelay / 1000)}`,
      "keepalives_interval=10",
      "keepalives_count=5",
      "tcp_user_timeout=30000"
    ];
    
    return `${url}${separator}${params.join("&")}`;
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'URL de connexion:", error);
    return url; // En cas d'erreur, retourner l'URL originale
  }
}

/**
 * Calcule le délai pour une tentative de reconnexion avec backoff exponentiel
 * 
 * @param attempt Numéro de la tentative (commençant à 1)
 * @returns Délai en millisecondes
 */
export function getBackoffDelay(attempt: number): number {
  const baseDelay = DB_CONFIG.retryInterval;
  return baseDelay * Math.pow(DB_CONFIG.backoffFactor, attempt - 1);
} 