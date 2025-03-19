/**
 * Worker pour effectuer des calculs intensifs sans bloquer le thread principal
 * Ce worker peut être utilisé pour :
 * - Calculs de progression
 * - Transformations de données complexes
 * - Filtrage de grandes listes
 * - Tri de données
 */

// Typages pour les messages envoyés au worker
type WorkerMessageData = {
  /** Type d'opération à effectuer */
  operation: 'calculate-progression' | 'filter-data' | 'sort-data' | 'transform-data';
  /** Données sur lesquelles effectuer l'opération */
  data: any;
  /** Paramètres supplémentaires pour l'opération */
  params?: any;
  /** Identifiant du message pour associer les réponses aux requêtes */
  id: string;
};

// Typages pour les messages envoyés par le worker
type WorkerResponseData = {
  /** Résultat de l'opération */
  result: any;
  /** Identifiant du message pour associer les réponses aux requêtes */
  id: string;
  /** Durée d'exécution en millisecondes */
  executionTime: number;
  /** Statut de l'opération */
  status: 'success' | 'error';
  /** Message d'erreur en cas d'échec */
  error?: string;
};

// Type pour les filtres
interface FilterValue {
  $gt?: number;
  $lt?: number;
  $eq?: any;
  $ne?: any;
  $in?: any[];
  $contains?: string;
}

// Type pour une transformation
interface Transformation {
  type: string;
  field: string;
  callback?: string;
}

/**
 * Calcule la progression d'un utilisateur en fonction de ses activités
 */
function calculateProgression(data: any, params?: any): number {
  // Simuler un calcul intensif
  const startTime = Date.now();
  
  // Données de base
  const { 
    completedChallenges = [], 
    totalPoints = 0,
    level = 1,
    submissions = []
  } = data;
  
  // Paramètres optionnels
  const {
    weightCompletedChallenges = 0.5,
    weightTotalPoints = 0.3,
    weightSubmissionsQuality = 0.2,
    baseMultiplier = 100
  } = params || {};
  
  // Calcul de la qualité moyenne des soumissions (entre 0 et 1)
  let submissionsQuality = 0;
  if (submissions.length > 0) {
    const totalQuality = submissions.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0);
    submissionsQuality = totalQuality / (submissions.length * 100); // Normaliser entre 0 et 1
  }
  
  // Calcul pondéré de la progression
  const challengesFactor = completedChallenges.length * weightCompletedChallenges;
  const pointsFactor = totalPoints / 1000 * weightTotalPoints; // Normaliser les points
  const qualityFactor = submissionsQuality * weightSubmissionsQuality;
  
  // Appliquer le facteur de niveau et le multiplicateur de base
  const progressionRaw = (challengesFactor + pointsFactor + qualityFactor) * level * baseMultiplier;
  
  // Limiter à 2 décimales et s'assurer que c'est un nombre positif
  const progression = Math.max(0, Math.round(progressionRaw * 100) / 100);
  
  // Simuler un calcul long (à supprimer en production)
  while (Date.now() - startTime < 500) {
    // Boucle vide pour simuler un calcul intensif
  }
  
  return progression;
}

/**
 * Filtre un tableau de données selon des critères complexes
 */
function filterData(data: any[], params?: any): any[] {
  const startTime = Date.now();
  
  // Extraction des paramètres de filtrage
  const { 
    filters = {}, 
    operator = 'AND'
  } = params || {};
  
  // Appliquer les filtres
  const filtered = data.filter(item => {
    // Si aucun filtre, retourner tout
    if (Object.keys(filters).length === 0) return true;
    
    // Vérifier chaque filtre
    const results = Object.entries(filters).map(([key, value]) => {
      // Récupérer la valeur à comparer en supportant les chemins imbriqués (ex: "user.name")
      const itemValue = key.split('.').reduce((obj: any, path: string) => obj && obj[path], item);
      
      // Différents types de comparaisons
      if (typeof value === 'object' && value !== null) {
        const filterValue = value as FilterValue;
        if ('$gt' in filterValue && typeof filterValue.$gt === 'number') return itemValue > filterValue.$gt;
        if ('$lt' in filterValue && typeof filterValue.$lt === 'number') return itemValue < filterValue.$lt;
        if ('$eq' in filterValue) return itemValue === filterValue.$eq;
        if ('$ne' in filterValue) return itemValue !== filterValue.$ne;
        if ('$in' in filterValue && Array.isArray(filterValue.$in)) return filterValue.$in.includes(itemValue);
        if ('$contains' in filterValue && typeof filterValue.$contains === 'string' && typeof itemValue === 'string') {
          return itemValue.includes(filterValue.$contains);
        }
      }
      
      // Comparaison simple par défaut
      return itemValue === value;
    });
    
    // Combiner les résultats selon l'opérateur
    if (operator === 'AND') return results.every(result => result);
    if (operator === 'OR') return results.some(result => result);
    
    return true;
  });
  
  // Simuler un calcul long (à supprimer en production)
  while (Date.now() - startTime < 300) {
    // Boucle vide pour simuler un calcul intensif
  }
  
  return filtered;
}

/**
 * Trie un tableau de données selon des critères complexes
 */
function sortData(data: any[], params?: any): any[] {
  const startTime = Date.now();
  
  // Extraction des paramètres de tri
  const { 
    sortBy = 'id', 
    order = 'asc',
    sortFunction = null
  } = params || {};
  
  // Créer une copie pour ne pas modifier l'original
  const sorted = [...data];
  
  // Si une fonction de tri personnalisée est fournie, l'utiliser
  if (typeof sortFunction === 'function') {
    sorted.sort(sortFunction);
  } else {
    // Tri standard
    sorted.sort((a, b) => {
      // Récupérer les valeurs à comparer en supportant les chemins imbriqués
      const aValue = sortBy.split('.').reduce((obj: any, path: string) => obj && obj[path], a);
      const bValue = sortBy.split('.').reduce((obj: any, path: string) => obj && obj[path], b);
      
      // Comparer selon le type
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return order === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Fallback pour les types incomparables
      return 0;
    });
  }
  
  // Simuler un calcul long (à supprimer en production)
  while (Date.now() - startTime < 200) {
    // Boucle vide pour simuler un calcul intensif
  }
  
  return sorted;
}

/**
 * Transforme des données selon des règles complexes
 */
function transformData(data: any, params?: any): any {
  const startTime = Date.now();
  
  // Extraction des paramètres de transformation
  const { 
    transformations = []
  } = params || {};
  
  // Si pas de transformations, retourner les données telles quelles
  if (!transformations || transformations.length === 0) {
    return data;
  }
  
  // Créer une copie pour ne pas modifier l'original
  let result;
  
  if (Array.isArray(data)) {
    // Transformation de tableau
    result = [...data];
    
    // Appliquer chaque transformation
    for (const transform of transformations as Transformation[]) {
      if (transform.type === 'map' && transform.field && transform.callback) {
        // Transformer chaque élément
        const transformedResult = Array.isArray(result) ? result.map(item => {
          const newItem = { ...item };
          newItem[transform.field] = Function('item', `return ${transform.callback}`)(item);
          return newItem;
        }) : [];
        
        result = transformedResult;
      } else if (transform.type === 'group' && transform.field) {
        // Grouper par champ
        if (Array.isArray(result)) {
          const grouped = result.reduce((groups: Record<string, any[]>, item: any) => {
            const key = item[transform.field];
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {});
          
          result = grouped;
        }
      }
    }
  } else {
    // Transformation d'objet
    result = { ...data };
    
    // Appliquer chaque transformation
    for (const transform of transformations as Transformation[]) {
      if (transform.field && transform.callback) {
        result[transform.field] = Function('data', `return ${transform.callback}`)(data);
      }
    }
  }
  
  // Simuler un calcul long (à supprimer en production)
  while (Date.now() - startTime < 400) {
    // Boucle vide pour simuler un calcul intensif
  }
  
  return result;
}

// Gestionnaire des messages reçus par le worker
self.addEventListener('message', function(e: MessageEvent<WorkerMessageData>) {
  const { operation, data, params, id } = e.data;
  const startTime = Date.now();
  
  try {
    let result;
    
    // Exécuter l'opération demandée
    switch (operation) {
      case 'calculate-progression':
        result = calculateProgression(data, params);
        break;
        
      case 'filter-data':
        result = filterData(data, params);
        break;
        
      case 'sort-data':
        result = sortData(data, params);
        break;
        
      case 'transform-data':
        result = transformData(data, params);
        break;
        
      default:
        throw new Error(`Opération non supportée: ${operation}`);
    }
    
    // Calculer le temps d'exécution
    const executionTime = Date.now() - startTime;
    
    // Envoyer la réponse
    const response: WorkerResponseData = {
      result,
      id,
      executionTime,
      status: 'success'
    };
    
    self.postMessage(response);
  } catch (error) {
    // En cas d'erreur, envoyer une réponse avec l'erreur
    const response: WorkerResponseData = {
      result: null,
      id,
      executionTime: Date.now() - startTime,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
    
    self.postMessage(response);
  }
});

// Nécessaire pour que TypeScript comprenne le contexte de self
export {}; 