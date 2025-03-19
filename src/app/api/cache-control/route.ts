import { NextResponse } from 'next/server';

/**
 * Types de stratégies de cache disponibles
 */
type CacheStrategy = 'no-store' | 'force-cache' | 'only-if-cached' | 'no-cache' | 'reload';

/**
 * API Route démontrant différentes stratégies de mise en cache
 * @param request La requête HTTP
 * @returns Réponse avec en-têtes de cache appropriés
 */
export async function GET(request: Request) {
  // Récupérer la stratégie de cache depuis les paramètres de requête
  const url = new URL(request.url);
  const strategy = url.searchParams.get('strategy') as CacheStrategy | null;
  const maxAge = parseInt(url.searchParams.get('maxAge') || '60', 10); // Par défaut 60 secondes
  const staleWhileRevalidate = parseInt(url.searchParams.get('staleWhileRevalidate') || '30', 10);
  
  // Données de réponse simulées
  const data = {
    timestamp: new Date().toISOString(),
    message: 'Données mises en cache',
    strategy: strategy || 'default',
    maxAge,
    staleWhileRevalidate,
  };
  
  // Créer la réponse
  const response = NextResponse.json(data);
  
  // Configurer les en-têtes de cache selon la stratégie
  if (strategy === 'no-store') {
    // Pas de mise en cache
    response.headers.set('Cache-Control', 'no-store');
  } else if (strategy === 'no-cache') {
    // Toujours valider avec le serveur avant d'utiliser une version en cache
    response.headers.set('Cache-Control', 'no-cache');
  } else if (strategy === 'force-cache') {
    // Utiliser la version en cache si disponible, peu importe son âge
    response.headers.set('Cache-Control', 'public, max-age=31536000'); // 1 an
  } else {
    // Stratégie par défaut: stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      `public, max-age=${maxAge}, s-maxage=${maxAge * 2}, stale-while-revalidate=${staleWhileRevalidate}`
    );
  }
  
  // Définir un ETag pour une validation conditionnelle
  const etag = `"${data.timestamp}"`;
  response.headers.set('ETag', etag);
  
  return response;
}

/**
 * Configuration des options d'ISR pour cette route API
 */
export const dynamic = 'force-dynamic';

/**
 * Configuration du runtime pour cette route API
 */
export const runtime = 'edge'; 