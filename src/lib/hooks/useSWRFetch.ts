"use client";

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

/**
 * Options pour le hook useSWRFetch
 */
interface UseSWRFetchOptions<T> extends SWRConfiguration {
  /** URL de l'API à appeler */
  url: string;
  /** Méthode HTTP à utiliser (GET par défaut) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Corps de la requête (pour POST, PUT, PATCH) */
  body?: any;
  /** En-têtes de la requête */
  headers?: HeadersInit;
  /** Fonction de transformation des données */
  transform?: (data: any) => T;
}

/**
 * Hook personnalisé pour utiliser SWR avec fetch
 * Gère automatiquement la mise en cache, la revalidation et les erreurs
 * 
 * @example
 * const { data, error, isLoading } = useSWRFetch<User[]>({
 *   url: '/api/users',
 *   transform: (data) => data.users
 * });
 */
export function useSWRFetch<T = any>({
  url,
  method = 'GET',
  body,
  headers,
  transform,
  ...config
}: UseSWRFetchOptions<T>): SWRResponse<T, Error> {
  // Créer une clé unique pour SWR qui inclut l'URL et la méthode
  const key = `${method}:${url}${body ? ':' + JSON.stringify(body) : ''}`;

  // Fonction fetcher personnalisée
  const fetcher = async (): Promise<T> => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Ajouter le corps pour les méthodes non-GET
    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Gérer les erreurs HTTP
    if (!response.ok) {
      const error = new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      error.name = 'HttpError';
      (error as any).status = response.status;
      (error as any).info = await response.json().catch(() => null);
      throw error;
    }

    // Analyser la réponse JSON
    const data = await response.json();

    // Transformer les données si une fonction de transformation est fournie
    return transform ? transform(data) : data;
  };

  // Utiliser SWR avec notre fetcher personnalisé
  return useSWR<T, Error>(key, fetcher, {
    revalidateOnFocus: false, // Désactiver la revalidation au focus par défaut
    ...config,
  });
} 