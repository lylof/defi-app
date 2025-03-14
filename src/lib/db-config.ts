/**
 * Configuration de la base de données PostgreSQL
 * 
 * Ce fichier contient les paramètres pour optimiser les connexions à la base de données,
 * réduire les déconnexions et gérer efficacement le pool de connexions.
 */

// Paramètres standards pour les connexions Postgres
export const DB_CONFIG = {
  // Paramètres de timeout et de connexion
  connectionTimeout: 120000,    // 120 secondes pour établir une connexion (augmenté)
  queryTimeout: 60000,          // 60 secondes pour exécuter une requête (augmenté)
  
  // Paramètres pour le pool de connexion
  poolMin: 3,                   // Nombre minimum de connexions à maintenir (augmenté)
  poolMax: 15,                  // Nombre maximum de connexions dans le pool (augmenté)
  poolIdle: 30000,              // Temps (ms) avant qu'une connexion inutilisée soit fermée (augmenté)
  
  // Paramètres TCP keepalive
  keepalive: true,              // Activer les paquets keepalive TCP
  keepaliveInitialDelay: 15000, // Délai (ms) avant d'envoyer le premier paquet keepalive (réduit)
  
  // Gestion des erreurs et retentatives
  maxRetryAttempts: 8,          // Nombre maximum de tentatives de reconnexion (augmenté)
  retryInterval: 3000,          // Intervalle initial (ms) entre les tentatives (réduit)
  backoffFactor: 1.3,           // Facteur multiplicatif pour l'intervalle entre les tentatives (ajusté)
  
  // Temps maximal (ms) entre les pings pour vérifier l'état de la connexion
  pingInterval: 20000,          // Réduit pour détecter les problèmes plus rapidement
  
  // Paramètres d'optimisation SSL/TLS
  ssl: process.env.NODE_ENV === "production", // SSL en production uniquement
  
  // Nouveaux paramètres pour améliorer la stabilité
  connectionLifetime: 3600000,  // Durée de vie maximale d'une connexion (1 heure)
  healthCheckInterval: 15000,   // Intervalle entre les vérifications de santé (15 secondes)
  maxConnectionAge: 1800000,    // Âge maximum d'une connexion avant recyclage (30 minutes)
  connectionReuseLimit: 1000,   // Nombre maximum de requêtes par connexion avant recyclage
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
      "keepalives_interval=5",  // Réduit à 5 secondes
      "keepalives_count=10",    // Augmenté à 10 tentatives
      "tcp_user_timeout=60000", // Augmenté à 60 secondes
      
      // Nouveaux paramètres pour améliorer la stabilité
      "sslmode=prefer",         // Préférer SSL mais accepter non-SSL si nécessaire
      "target_session_attrs=read-write", // S'assurer que la connexion est en lecture-écriture
      "client_encoding=UTF8",   // Définir l'encodage explicitement
      "options=-c timezone=UTC" // Définir le fuseau horaire explicitement
    ];
    
    return `${url}${separator}${params.join("&")}`;
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'URL de connexion:", error);
    return url; // En cas d'erreur, retourner l'URL originale
  }
}

/**
 * Calcule le délai de backoff exponentiel pour les tentatives de reconnexion
 * @param attempts Nombre de tentatives déjà effectuées
 * @param baseInterval Intervalle de base en ms (optionnel, par défaut selon DB_CONFIG)
 * @returns Délai en millisecondes à attendre avant la prochaine tentative
 */
export function getBackoffDelay(attempts: number, baseInterval?: number): number {
  // Utiliser l'intervalle fourni ou celui de la configuration
  const baseDelay = baseInterval || DB_CONFIG.retryInterval;
  const maxDelay = 60000; // 60 secondes maximum
  
  // Ajouter un jitter pour éviter les tempêtes de reconnexion
  const jitter = Math.random() * 0.2 - 0.1; // Jitter entre -10% et +10%
  
  // Calculer le délai de base avec backoff exponentiel
  let delay = Math.min(
    baseDelay * Math.pow(DB_CONFIG.backoffFactor, attempts),
    maxDelay
  );
  
  // Appliquer le jitter
  delay = delay * (1 + jitter);
  
  return Math.floor(delay);
} 