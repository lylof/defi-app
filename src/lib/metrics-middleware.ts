import { NextRequest, NextResponse } from "next/server";
import { metricsService } from "./metrics-service";
import { apiLogger } from "./logger";

/**
 * Options pour le middleware de métriques
 */
export interface MetricsMiddlewareOptions {
  /**
   * Préfixe pour le nom des métriques
   */
  metricPrefix?: string;
  
  /**
   * Liste des chemins à exclure des métriques
   */
  excludePaths?: string[];
  
  /**
   * Liste des méthodes HTTP à surveiller (par défaut toutes)
   */
  methods?: string[];
  
  /**
   * Fonction pour extraire les labels des métriques
   */
  extractLabels?: (req: NextRequest) => Record<string, string>;
  
  /**
   * Si vrai, enregistre les détails des requêtes dans les logs
   */
  logRequests?: boolean;
}

/**
 * Crée un middleware pour mesurer les performances des requêtes API
 * 
 * @param options Options du middleware
 * @returns Fonction middleware pour Next.js
 */
export function createMetricsMiddleware(options: MetricsMiddlewareOptions = {}) {
  const {
    metricPrefix = 'http',
    excludePaths = ['/api/health', '/_next', '/favicon.ico'],
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    extractLabels = defaultLabelExtractor,
    logRequests = true
  } = options;
  
  return async function metricsMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    // Vérifier si la requête doit être surveillée
    const { pathname } = request.nextUrl;
    const method = request.method;
    
    // Ignorer les chemins exclus
    if (excludePaths.some(path => pathname.startsWith(path))) {
      return next();
    }
    
    // Ignorer les méthodes non surveillées
    if (!methods.includes(method)) {
      return next();
    }
    
    // Extraire les labels
    const labels = extractLabels(request);
    
    // Enregistrer le début de la requête
    const requestStartTime = Date.now();
    
    if (logRequests) {
      apiLogger.info(`Requête ${method} ${pathname}`, {
        metadata: {
          method,
          path: pathname,
          query: Object.fromEntries(request.nextUrl.searchParams.entries()),
          userAgent: request.headers.get('user-agent'),
          ...labels
        }
      });
    }
    
    try {
      // Incrémenter le compteur de requêtes
      metricsService.incrementCounter(
        `${metricPrefix}_requests_total`,
        1,
        "Nombre total de requêtes HTTP",
        { method, path: getPathTemplate(pathname), ...labels }
      );
      
      // Incrémenter le compteur de requêtes actives
      metricsService.incrementGauge(
        `${metricPrefix}_requests_active`,
        1,
        "Nombre de requêtes HTTP actives",
        { method, path: getPathTemplate(pathname), ...labels }
      );
      
      // Exécuter le middleware suivant
      const response = await next();
      
      // Calculer la durée de la requête
      const duration = Date.now() - requestStartTime;
      
      // Enregistrer la durée de la requête
      metricsService.observeHistogram(
        `${metricPrefix}_request_duration_seconds`,
        duration / 1000,
        "Durée des requêtes HTTP en secondes",
        {
          method,
          path: getPathTemplate(pathname),
          status: response.status.toString(),
          ...labels
        }
      );
      
      // Incrémenter le compteur de requêtes par statut
      metricsService.incrementCounter(
        `${metricPrefix}_requests_by_status`,
        1,
        "Nombre de requêtes HTTP par code de statut",
        {
          method,
          path: getPathTemplate(pathname),
          status: response.status.toString(),
          ...labels
        }
      );
      
      if (logRequests) {
        apiLogger.info(`Réponse ${method} ${pathname}: ${response.status} en ${duration}ms`, {
          metadata: {
            method,
            path: pathname,
            status: response.status,
            duration: `${duration}ms`,
            ...labels
          }
        });
      }
      
      return response;
    } catch (error) {
      // Calculer la durée de la requête en erreur
      const duration = Date.now() - requestStartTime;
      
      // Déterminer si l'erreur est une instance d'Error
      const errorObj = error instanceof Error ? error : undefined;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Enregistrer l'erreur
      metricsService.incrementCounter(
        `${metricPrefix}_request_errors_total`,
        1,
        "Nombre total d'erreurs HTTP",
        {
          method,
          path: getPathTemplate(pathname),
          error_type: errorObj?.name || 'unknown',
          ...labels
        }
      );
      
      // Enregistrer la durée de la requête en erreur
      metricsService.observeHistogram(
        `${metricPrefix}_request_error_duration_seconds`,
        duration / 1000,
        "Durée des requêtes HTTP en erreur en secondes",
        {
          method,
          path: getPathTemplate(pathname),
          ...labels
        }
      );
      
      if (logRequests) {
        apiLogger.error(
          `Erreur ${method} ${pathname} après ${duration}ms`, 
          errorObj, 
          {
            metadata: {
              method,
              path: pathname,
              duration: `${duration}ms`,
              errorMessage,
              ...labels
            }
          }
        );
      }
      
      throw error;
    } finally {
      // Décrémenter le compteur de requêtes actives
      metricsService.decrementGauge(
        `${metricPrefix}_requests_active`,
        1,
        "Nombre de requêtes HTTP actives",
        { method, path: getPathTemplate(pathname), ...labels }
      );
    }
  };
}

/**
 * Extrait des labels standard à partir de la requête
 * @param req Requête Next.js
 * @returns Labels extraits
 */
function defaultLabelExtractor(req: NextRequest): Record<string, string> {
  return {
    host: req.headers.get('host') || 'unknown',
    referer: req.headers.get('referer') || 'unknown',
  };
}

/**
 * Convertit un chemin avec des IDs en un template
 * Exemple: /api/users/123 -> /api/users/:id
 * 
 * @param path Chemin d'URL
 * @returns Template de chemin
 */
function getPathTemplate(path: string): string {
  // Remplacer les IDs numériques
  const numericPattern = /\/[0-9a-f]{8,}(?=-|$)|\/\d+/g;
  let template = path.replace(numericPattern, '/:id');
  
  // Remplacer les IDs alphanumériques longs (probablement des UUIDs)
  const uuidPattern = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
  template = template.replace(uuidPattern, '/:uuid');
  
  return template;
}

/**
 * Middleware de métriques avec configuration par défaut
 */
export const metricsMiddleware = createMetricsMiddleware(); 