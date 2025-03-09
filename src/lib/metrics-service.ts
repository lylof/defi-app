import { logger } from "./logger";

/**
 * Types de métriques supportées
 */
export type MetricType = 
  | "counter"     // Valeur qui ne peut qu'augmenter (ex: nombre de requêtes)
  | "gauge"       // Valeur qui peut augmenter ou diminuer (ex: mémoire utilisée)
  | "histogram"   // Distribution de valeurs (ex: temps de réponse)
  | "summary";    // Résumé statistique (moyenne, percentiles, etc.)

/**
 * Interface pour les métriques
 */
export interface Metric {
  name: string;         // Nom de la métrique
  type: MetricType;     // Type de métrique
  description: string;  // Description de la métrique
  value: number;        // Valeur actuelle (pour counter et gauge)
  values?: number[];    // Valeurs pour histogram et summary
  labels?: Record<string, string>; // Labels pour segmenter les métriques
  timestamp: number;    // Timestamp de la dernière mise à jour
}

/**
 * Classe pour une métrique de type histogramme
 * Permet de suivre la distribution des valeurs
 */
class Histogram {
  private buckets: Map<number, number> = new Map();
  private values: number[] = [];
  private sum: number = 0;
  private count: number = 0;

  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly bucketBoundaries: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ) {
    // Initialiser les buckets
    for (const bound of bucketBoundaries) {
      this.buckets.set(bound, 0);
    }
    this.buckets.set(Infinity, 0);
  }

  /**
   * Ajouter une observation à l'histogramme
   * @param value Valeur à ajouter
   * @param labels Labels optionnels
   */
  observe(value: number, labels?: Record<string, string>): void {
    this.values.push(value);
    this.sum += value;
    this.count++;

    // Incrémenter les buckets appropriés
    for (const bound of Array.from(this.buckets.keys()).sort((a, b) => a - b)) {
      if (value <= bound) {
        this.buckets.set(bound, (this.buckets.get(bound) || 0) + 1);
      }
    }
  }

  /**
   * Obtenir les percentiles de l'histogramme
   * @param percentiles Percentiles à calculer (0-1)
   * @returns Objet avec les percentiles demandés
   */
  percentiles(percentiles: number[] = [0.5, 0.9, 0.95, 0.99]): Record<string, number> {
    const result: Record<string, number> = {};
    const sortedValues = [...this.values].sort((a, b) => a - b);

    if (sortedValues.length === 0) {
      for (const p of percentiles) {
        result[`p${p * 100}`] = 0;
      }
      return result;
    }

    for (const p of percentiles) {
      const index = Math.max(0, Math.ceil(p * sortedValues.length) - 1);
      result[`p${p * 100}`] = sortedValues[index];
    }

    return result;
  }

  /**
   * Obtenir la moyenne des valeurs
   */
  mean(): number {
    return this.count > 0 ? this.sum / this.count : 0;
  }

  /**
   * Obtenir une représentation de l'histogramme
   */
  toJSON(): any {
    return {
      name: this.name,
      description: this.description,
      type: "histogram",
      count: this.count,
      sum: this.sum,
      mean: this.mean(),
      percentiles: this.percentiles(),
      buckets: Object.fromEntries(this.buckets.entries())
    };
  }
}

/**
 * Service de métriques pour suivre les performances de l'application
 */
export class MetricsService {
  private static instance: MetricsService;
  private metrics: Map<string, Metric> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private metricsLogger = logger.createContextLogger('metrics');

  /**
   * Constructeur privé pour le singleton
   */
  private constructor() {}

  /**
   * Obtenir l'instance unique du service de métriques
   */
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Incrémenter un compteur
   * @param name Nom du compteur
   * @param value Valeur à ajouter (par défaut 1)
   * @param description Description du compteur
   * @param labels Labels optionnels
   */
  public incrementCounter(
    name: string,
    value: number = 1,
    description: string = "",
    labels?: Record<string, string>
  ): void {
    const metricName = this.formatMetricName(name, labels);
    const metric = this.getOrCreateMetric(metricName, "counter", description, labels);
    metric.value += value;
    metric.timestamp = Date.now();

    this.metricsLogger.debug(`Compteur ${metricName} incrémenté de ${value}`, {
      metadata: {
        value: metric.value,
        type: "counter",
        labels
      }
    });
  }

  /**
   * Définir une jauge
   * @param name Nom de la jauge
   * @param value Valeur à définir
   * @param description Description de la jauge
   * @param labels Labels optionnels
   */
  public setGauge(
    name: string,
    value: number,
    description: string = "",
    labels?: Record<string, string>
  ): void {
    const metricName = this.formatMetricName(name, labels);
    const metric = this.getOrCreateMetric(metricName, "gauge", description, labels);
    metric.value = value;
    metric.timestamp = Date.now();

    this.metricsLogger.debug(`Jauge ${metricName} définie à ${value}`, {
      metadata: {
        value,
        type: "gauge",
        labels
      }
    });
  }

  /**
   * Incrémenter une jauge
   * @param name Nom de la jauge
   * @param value Valeur à ajouter
   * @param description Description de la jauge
   * @param labels Labels optionnels
   */
  public incrementGauge(
    name: string,
    value: number,
    description: string = "",
    labels?: Record<string, string>
  ): void {
    const metricName = this.formatMetricName(name, labels);
    const metric = this.getOrCreateMetric(metricName, "gauge", description, labels);
    metric.value += value;
    metric.timestamp = Date.now();

    this.metricsLogger.debug(`Jauge ${metricName} incrémentée de ${value}`, {
      metadata: {
        value: metric.value,
        type: "gauge",
        labels
      }
    });
  }

  /**
   * Décrémenter une jauge
   * @param name Nom de la jauge
   * @param value Valeur à soustraire
   * @param description Description de la jauge
   * @param labels Labels optionnels
   */
  public decrementGauge(
    name: string,
    value: number,
    description: string = "",
    labels?: Record<string, string>
  ): void {
    this.incrementGauge(name, -value, description, labels);
  }

  /**
   * Observer une valeur dans un histogramme
   * @param name Nom de l'histogramme
   * @param value Valeur à observer
   * @param description Description de l'histogramme
   * @param labels Labels optionnels
   */
  public observeHistogram(
    name: string,
    value: number,
    description: string = "",
    labels?: Record<string, string>
  ): void {
    const metricName = this.formatMetricName(name, labels);
    
    // Créer l'histogramme s'il n'existe pas
    if (!this.histograms.has(metricName)) {
      this.histograms.set(metricName, new Histogram(metricName, description));
    }
    
    const histogram = this.histograms.get(metricName)!;
    histogram.observe(value, labels);

    this.metricsLogger.debug(`Histogramme ${metricName} observation: ${value}`, {
      metadata: {
        value,
        type: "histogram",
        labels
      }
    });
  }

  /**
   * Mesurer le temps d'exécution d'une fonction
   * @param name Nom de la métrique
   * @param fn Fonction à mesurer
   * @param description Description de la métrique
   * @param labels Labels optionnels
   * @returns Résultat de la fonction
   */
  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    description: string = "",
    labels?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.observeHistogram(name, duration / 1000, description, labels); // Convertir en secondes
    }
  }

  /**
   * Mesurer le temps d'exécution d'une fonction synchrone
   * @param name Nom de la métrique
   * @param fn Fonction à mesurer
   * @param description Description de la métrique
   * @param labels Labels optionnels
   * @returns Résultat de la fonction
   */
  public measure<T>(
    name: string,
    fn: () => T,
    description: string = "",
    labels?: Record<string, string>
  ): T {
    const start = performance.now();
    
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.observeHistogram(name, duration / 1000, description, labels); // Convertir en secondes
    }
  }

  /**
   * Créer un décorateur de fonction pour mesurer le temps d'exécution
   * Utilisation: 
   * @metricTimings("api_call", "Temps d'exécution de l'API", { endpoint: "/api/users" })
   * async function fetchUsers() { ... }
   * 
   * @param name Nom de la métrique
   * @param description Description de la métrique
   * @param labels Labels optionnels
   * @returns Décorateur de fonction
   */
  public metricTimings(
    name: string,
    description: string = "",
    labels?: Record<string, string>
  ): MethodDecorator {
    const service = this;
    
    return function(
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args: any[]) {
        const start = performance.now();
        
        try {
          const result = originalMethod.apply(this, args);
          
          // Si c'est une promesse, mesurer le temps d'exécution asynchrone
          if (result && result instanceof Promise) {
            return result.finally(() => {
              const duration = performance.now() - start;
              service.observeHistogram(name, duration / 1000, description, labels);
            });
          }
          
          // Sinon, mesurer le temps d'exécution synchrone
          const duration = performance.now() - start;
          service.observeHistogram(name, duration / 1000, description, labels);
          
          return result;
        } catch (error) {
          const duration = performance.now() - start;
          service.observeHistogram(name, duration / 1000, description, {
            ...labels,
            error: 'true'
          });
          
          throw error;
        }
      };
      
      return descriptor;
    };
  }

  /**
   * Réinitialiser toutes les métriques
   */
  public reset(): void {
    this.metrics.clear();
    this.histograms.clear();
    this.metricsLogger.info("Métriques réinitialisées");
  }

  /**
   * Obtenir toutes les métriques
   */
  public getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    // Métriques simples
    for (const [name, metric] of this.metrics.entries()) {
      metrics[name] = {
        name: metric.name,
        type: metric.type,
        description: metric.description,
        value: metric.value,
        labels: metric.labels,
        timestamp: new Date(metric.timestamp).toISOString()
      };
    }
    
    // Histogrammes
    for (const [name, histogram] of this.histograms.entries()) {
      metrics[name] = histogram.toJSON();
    }
    
    return metrics;
  }

  /**
   * Obtenir une métrique par son nom
   * @param name Nom de la métrique
   * @returns Métrique ou undefined si non trouvée
   */
  public getMetric(name: string): any {
    const metric = this.metrics.get(name);
    if (metric) {
      return {
        name: metric.name,
        type: metric.type,
        description: metric.description,
        value: metric.value,
        labels: metric.labels,
        timestamp: new Date(metric.timestamp).toISOString()
      };
    }
    
    const histogram = this.histograms.get(name);
    if (histogram) {
      return histogram.toJSON();
    }
    
    return undefined;
  }

  /**
   * Formater le nom d'une métrique avec ses labels
   * @param name Nom de la métrique
   * @param labels Labels optionnels
   * @returns Nom formaté
   */
  private formatMetricName(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    
    const labelString = Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(",");
      
    return `${name}{${labelString}}`;
  }

  /**
   * Obtenir ou créer une métrique
   * @param name Nom de la métrique
   * @param type Type de métrique
   * @param description Description de la métrique
   * @param labels Labels optionnels
   * @returns Métrique
   */
  private getOrCreateMetric(
    name: string,
    type: MetricType,
    description: string,
    labels?: Record<string, string>
  ): Metric {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        type,
        description,
        value: 0,
        labels,
        timestamp: Date.now()
      });
    }
    
    return this.metrics.get(name)!;
  }
}

// Exporter une instance par défaut du service de métriques
export const metricsService = MetricsService.getInstance(); 