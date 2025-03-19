import { SWRConfiguration } from 'swr';

/**
 * Configuration globale pour SWR
 * Ces options seront appliquées à toutes les requêtes SWR de l'application
 */
export const globalSWRConfig: SWRConfiguration = {
  // Désactiver la revalidation automatique au focus par défaut
  revalidateOnFocus: false,
  
  // Désactiver la revalidation automatique à la reconnexion par défaut
  revalidateOnReconnect: true,
  
  // Durée de mise en cache par défaut (en millisecondes)
  // 0 signifie que les données ne sont jamais périmées
  dedupingInterval: 2000,
  
  // Stratégie de nouvelle tentative en cas d'erreur
  // 3 signifie que SWR réessaiera 3 fois avec un délai exponentiel
  errorRetryCount: 3,
  
  // Fonction pour déterminer si une erreur doit être réessayée
  // Par défaut, toutes les erreurs sont réessayées
  shouldRetryOnError: (err) => {
    // Ne pas réessayer pour les erreurs 404 ou 403
    if (err && (err as any).status === 404 || (err as any).status === 403) {
      return false;
    }
    return true;
  },
  
  // Fonction pour déterminer le délai entre les tentatives (en millisecondes)
  // Par défaut, le délai est exponentiel: 1000, 3000, 7000, etc.
  // Note: SWR accepte un nombre ou une fonction qui retourne un nombre
  errorRetryInterval: 5000,
  
  // Fonction pour déterminer si une mise à jour est nécessaire
  // Par défaut, toutes les mises à jour sont appliquées
  compare: (a, b) => {
    // Si les deux valeurs sont des objets ou des tableaux, comparer leur JSON
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    // Sinon, comparer directement
    return a === b;
  },
};

/**
 * Fonction utilitaire pour calculer le délai entre les tentatives
 * @param retryCount - Nombre de tentatives déjà effectuées
 * @returns Délai en millisecondes
 */
export function calculateRetryDelay(retryCount: number): number {
  return Math.min(1000 * 2 ** retryCount, 30000);
}

/**
 * Classe utilitaire pour gérer les clés SWR
 * Permet de générer des clés cohérentes pour les requêtes SWR
 */
export class SWRKeyBuilder {
  /**
   * Génère une clé SWR pour une requête API
   * @param endpoint - Point de terminaison de l'API
   * @param params - Paramètres de la requête
   * @returns Clé SWR formatée
   */
  static buildAPIKey(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return `api:${endpoint}`;
    }
    
    // Trier les paramètres par clé pour assurer la cohérence des clés
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    
    return `api:${endpoint}:${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Génère une clé SWR pour une requête avec méthode HTTP
   * @param method - Méthode HTTP (GET, POST, etc.)
   * @param url - URL de la requête
   * @param body - Corps de la requête (pour POST, PUT, etc.)
   * @returns Clé SWR formatée
   */
  static buildRequestKey(method: string, url: string, body?: any): string {
    if (!body) {
      return `${method}:${url}`;
    }
    return `${method}:${url}:${JSON.stringify(body)}`;
  }
}

/**
 * Classe utilitaire pour gérer les erreurs SWR
 */
export class SWRErrorHandler {
  /**
   * Analyse une erreur SWR et retourne un message d'erreur convivial
   * @param error - Erreur SWR
   * @returns Message d'erreur formaté
   */
  static getErrorMessage(error: any): string {
    if (!error) return 'Une erreur inconnue est survenue';
    
    // Si l'erreur a un message, l'utiliser
    if (error.message) return error.message;
    
    // Si l'erreur a un statut HTTP, formater un message en fonction du statut
    if (error.status) {
      switch (error.status) {
        case 400: return 'Requête invalide';
        case 401: return 'Non autorisé - Veuillez vous connecter';
        case 403: return 'Accès refusé';
        case 404: return 'Ressource non trouvée';
        case 500: return 'Erreur serveur interne';
        default: return `Erreur HTTP ${error.status}`;
      }
    }
    
    // Fallback pour les erreurs inconnues
    return 'Une erreur est survenue lors de la récupération des données';
  }
} 