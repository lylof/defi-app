"use client";

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types pour le hook
type WorkerOperations = 'calculate-progression' | 'filter-data' | 'sort-data' | 'transform-data';

interface UseWorkerOptions {
  /**
   * Opération à exécuter dans le worker
   */
  operation: WorkerOperations;
  /**
   * Données initiales à traiter
   */
  initialData?: any;
  /**
   * Paramètres supplémentaires pour l'opération
   */
  params?: any;
  /**
   * Callback appelé lorsque les données sont prêtes
   */
  onResult?: (result: any) => void;
  /**
   * Callback appelé en cas d'erreur
   */
  onError?: (error: string) => void;
}

interface WorkerResponse {
  result: any;
  id: string;
  executionTime: number;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Hook qui permet d'utiliser un Web Worker pour effectuer des calculs intensifs
 * sans bloquer le thread principal
 *
 * @example
 * const { result, isLoading, error, execute } = useWorker({
 *   operation: 'calculate-progression',
 *   initialData: userData,
 *   params: { weightCompletedChallenges: 0.6 }
 * });
 */
export function useWorker({
  operation,
  initialData = null,
  params = {},
  onResult,
  onError
}: UseWorkerOptions) {
  // État pour les données, le résultat et l'état de chargement
  const [data, setData] = useState<any>(initialData);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  // Référence pour le worker et les callbacks
  const workerRef = useRef<Worker | null>(null);
  const pendingOperations = useRef<Record<string, { resolve: Function; reject: Function }>>({});
  
  // Initialisation du worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Création du worker
      workerRef.current = new Worker(new URL('../workers/calculation.worker.ts', import.meta.url));
      
      // Gestionnaire de messages
      const handleMessage = (e: MessageEvent<WorkerResponse>) => {
        const { result, id, executionTime, status, error } = e.data;
        
        // Récupérer l'opération en attente
        const pendingOp = pendingOperations.current[id];
        
        if (pendingOp) {
          if (status === 'success') {
            pendingOp.resolve(result);
          } else {
            pendingOp.reject(error || 'Erreur inconnue');
          }
          
          // Supprimer l'opération de la liste des opérations en attente
          delete pendingOperations.current[id];
        }
      };
      
      workerRef.current.addEventListener('message', handleMessage);
      
      // Nettoyer le worker lorsque le composant est démonté
      return () => {
        if (workerRef.current) {
          workerRef.current.removeEventListener('message', handleMessage);
          workerRef.current.terminate();
        }
      };
    } catch (err) {
      console.error('Erreur lors de la création du worker:', err);
      setError('Erreur lors de la création du worker: les Web Workers ne sont pas supportés par votre navigateur');
    }
  }, []);
  
  // Fonction pour exécuter une opération dans le worker
  const execute = async (newData?: any, newParams?: any) => {
    if (!workerRef.current) {
      console.error('Worker non initialisé');
      setError('Worker non initialisé');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    if (newData !== undefined) {
      setData(newData);
    }
    
    const operationData = newData !== undefined ? newData : data;
    const operationParams = newParams !== undefined ? newParams : params;
    
    try {
      // Générer un identifiant unique pour cette opération
      const id = uuidv4();
      
      // Créer une promesse qui sera résolue lorsque le worker aura terminé
      const workerPromise = new Promise((resolve, reject) => {
        pendingOperations.current[id] = { resolve, reject };
      });
      
      // Envoyer le message au worker
      workerRef.current.postMessage({
        operation,
        data: operationData,
        params: operationParams,
        id
      });
      
      // Attendre la réponse du worker
      const workerResult = await workerPromise;
      
      setResult(workerResult);
      setIsLoading(false);
      setExecutionTime((pendingOperations.current[id] as any)?.executionTime || null);
      
      // Appeler le callback si défini
      if (onResult) {
        onResult(workerResult);
      }
      
      return workerResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      setError(errorMessage);
      setIsLoading(false);
      
      // Appeler le callback d'erreur si défini
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    }
  };
  
  // Exécuter l'opération initiale si des données sont fournies
  useEffect(() => {
    if (initialData !== null && !isLoading && !result && !error) {
      execute();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    data,
    result,
    isLoading,
    error,
    executionTime,
    execute,
  };
} 