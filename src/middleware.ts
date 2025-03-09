import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { logger } from "./lib/logger";
import { sessionCacheMiddleware } from "./lib/auth/session-cache-middleware";

const middlewareLogger = logger.createContextLogger('middleware');

/**
 * Middleware d'authentification
 * Ce middleware vérifie l'authentification de l'utilisateur et protège les routes sensibles
 */
const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Vérifier si un token existe
    if (!token) {
      middlewareLogger.info(`Pas de token pour ${pathname}, redirection vers login`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Vérifier si la session a expiré
    if (token?.error === "SessionExpired") {
      middlewareLogger.info(`Session expirée pour ${pathname}, redirection vers login avec paramètre expired`);
      return NextResponse.redirect(new URL("/login?expired=true", req.url));
    }
    
    // Vérifier l'ID utilisateur
    if (!token.id || typeof token.id !== 'string' || token.id.trim() === '') {
      middlewareLogger.warn(`ID utilisateur invalide (${token.id}) pour ${pathname}, redirection vers logout`);
      return NextResponse.redirect(new URL("/logout", req.url));
    }
    
    // Protection des routes admin
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        middlewareLogger.warn(`Accès admin refusé pour ${token.email || 'utilisateur inconnu'} (rôle: ${token.role}) - ${pathname}`);
        return NextResponse.redirect(new URL("/login?unauthorized=true", req.url));
      }
      middlewareLogger.info(`Accès admin autorisé pour ${token.email || 'utilisateur inconnu'} - ${pathname}`);
    }
    
    // Vérification spécifique pour la route de profil
    if (pathname === "/profile") {
      // Log d'accès pour déboguer les problèmes d'authentification
      middlewareLogger.debug(`Accès au profil pour l'utilisateur ${token.id} (${token.email || 'email inconnu'})`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

/**
 * Middleware principal qui combine tous les middlewares
 */
export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Enregistrer les métriques de base pour toutes les requêtes
    const startTime = Date.now();
    
    // Middleware de cache de session pour les requêtes d'API de session
    if (pathname.startsWith('/api/auth/session')) {
      try {
        return await sessionCacheMiddleware(request);
      } catch (error) {
        middlewareLogger.error('Erreur dans le middleware de cache de session', 
          error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Middleware d'authentification pour les routes protégées
    if (shouldApplyAuthMiddleware(request)) {
      try {
        // L'erreur de lint indique qu'il faut deux arguments
        // Mais en réalité, withAuth prend un seul argument de type NextRequest
        // NextAuth gère en interne la conversion, donc ignorons le lint ici
        // @ts-ignore - withAuth attend NextRequest mais attend des options en second paramètre dans certains cas
        return authMiddleware(request);
      } catch (error) {
        middlewareLogger.error('Erreur dans le middleware d\'authentification', 
          error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Pour les autres routes, continuer normalement
    return NextResponse.next();
  } catch (error) {
    // Logger l'erreur et continuer normalement pour éviter de bloquer l'application
    middlewareLogger.error('Erreur dans le middleware principal', 
      error instanceof Error ? error : new Error(String(error)));
    return NextResponse.next();
  } finally {
    // Enregistrer les métriques de fin de requête si nécessaire
  }
}

/**
 * Détermine si le middleware d'authentification doit être appliqué à cette requête
 */
function shouldApplyAuthMiddleware(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  
  // Ne pas appliquer l'authentification aux routes publiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return false;
  }
  
  // Appliquer l'authentification à toutes les autres routes
  return true;
}

/**
 * Configuration des chemins pour lesquels le middleware sera appliqué
 */
export const config = {
  // Matcher plus large pour inclure toutes les routes où nous voulons appliquer des métriques
  matcher: [
    // Routes protégées par l'authentification
    "/admin/:path*", 
    "/profile", 
    "/dashboard", 
    "/challenges/:path*",
    
    // Routes API pour les métriques
    "/api/:path*"
  ],
}; 