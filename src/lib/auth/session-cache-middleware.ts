import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache-service';
import { logger } from '@/lib/logger';

const sessionLogger = logger.createContextLogger('session-cache');

/**
 * Middleware pour mettre en cache les sessions d'authentification
 * Réduit considérablement les requêtes à la base de données pour les vérifications de session
 */
export async function sessionCacheMiddleware(req: NextRequest) {
  // Ne s'applique qu'aux requêtes d'API de session
  if (!req.nextUrl.pathname.startsWith('/api/auth/session')) {
    return NextResponse.next();
  }

  // Extraire l'ID de session du cookie pour l'utiliser comme clé de cache
  const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                       req.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!sessionToken) {
    sessionLogger.debug('Aucun token de session trouvé, pas de mise en cache');
    return NextResponse.next();
  }

  // Générer une clé de cache basée sur le token de session
  const cacheKey = `auth:session:${sessionToken}`;
  
  try {
    // Vérifier si la session est en cache
    const cachedSession = await cacheService.get(cacheKey);
    
    if (cachedSession) {
      sessionLogger.debug('Session récupérée depuis le cache');
      
      // Retourner la session mise en cache
      return new NextResponse(JSON.stringify(cachedSession), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate'
        }
      });
    }
    
    // Si pas en cache, continuer la requête
    const response = await NextResponse.next();
    
    // Vérifier si la réponse est valide
    if (response.status === 200) {
      try {
        // Cloner la réponse pour ne pas affecter la réponse originale
        const responseClone = response.clone();
        
        // Vérifier si la réponse a un contenu
        const text = await responseClone.text();
        
        if (text && text.trim() !== '') {
          // Parser le texte en JSON seulement s'il y a du contenu
          try {
            const sessionData = JSON.parse(text);
            
            // Mettre en cache la session pour 5 minutes
            if (sessionData) {
              await cacheService.set(cacheKey, sessionData, { 
                ttl: 5 * 60 * 1000, // 5 minutes
                staleWhileRevalidate: true,
                tags: ['auth:session', `user:${sessionData.user?.id || 'anonymous'}`]
              });
              sessionLogger.debug('Session mise en cache');
            }
          } catch (jsonError) {
            sessionLogger.error('Erreur de parsing JSON de la session', 
              jsonError instanceof Error ? jsonError : new Error(String(jsonError)));
          }
        } else {
          sessionLogger.warn('Réponse de session vide, rien à mettre en cache');
        }
      } catch (parseError) {
        sessionLogger.error('Erreur lors de la mise en cache de la session', 
          parseError instanceof Error ? parseError : new Error(String(parseError)));
      }
    }
    
    return response;
  } catch (error) {
    sessionLogger.error('Erreur dans le middleware de cache de session', 
      error instanceof Error ? error : new Error(String(error)));
    
    // En cas d'erreur, continuer normalement
    return NextResponse.next();
  }
}

/**
 * Invalide le cache de session pour un utilisateur spécifique
 */
export async function invalidateSessionCache(userId: string) {
  sessionLogger.debug(`Invalidation du cache de session pour l'utilisateur ${userId}`);
  await cacheService.invalidateByTag(`user:${userId}`);
}

/**
 * Invalide toutes les sessions en cache
 */
export async function invalidateAllSessionCaches() {
  sessionLogger.debug('Invalidation de toutes les sessions en cache');
  await cacheService.invalidateByTag('auth:session');
} 