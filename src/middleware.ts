import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { logger } from "./lib/logger";
import { sessionCacheMiddleware } from "./lib/auth/session-cache-middleware";
import { isEdgeRuntime } from "./lib/prisma-edge";

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
    
    // Redirection automatique des administrateurs vers leur interface dédiée
    if (token?.role === "ADMIN" && 
        !pathname.startsWith("/admin") && 
        !pathname.startsWith("/api") &&
        pathname !== "/logout") {
      middlewareLogger.info(`Redirection automatique vers l'interface admin pour ${token.email || 'admin'} - ${pathname} -> /admin`);
      return NextResponse.redirect(new URL("/admin", req.url));
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
      // Si l'utilisateur est admin, rediriger vers le profil admin
      if (token?.role === "ADMIN") {
        middlewareLogger.debug(`Redirection du profil standard vers profil admin pour ${token.email || 'admin'}`);
        return NextResponse.redirect(new URL("/admin/profile", req.url));
      }
      
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
 * Applique les en-têtes de cache appropriés en fonction du type de contenu
 */
function applyCacheHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Vérifier que la réponse est bien définie
  if (!response || !response.headers) {
    middlewareLogger.warn("applyCacheHeaders: Response non définie ou headers non disponibles");
    return NextResponse.next();
  }

  // S'assurer que les headers sont accessibles
  try {
    const pathname = request.nextUrl.pathname;

    // Ajouter des headers de sécurité communs
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Frame-Options", "DENY");
    
    // Ajouter des en-têtes de cache en fonction du type de contenu
    if (pathname.startsWith("/api/")) {
      // On exclut la route de gestion personnalisée du cache
      if (pathname.startsWith("/api/cache-control")) {
        return response;
      }
      // API routes généralement dynamiques
      response.headers.set("Cache-Control", "no-store");
    } else if (
      pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/) ||
      pathname.startsWith("/_next/image")
    ) {
      // Images - mise en cache longue durée
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    } else if (
      pathname.match(/\.(js|css)$/) ||
      pathname.startsWith("/_next/static")
    ) {
      // Fichiers statiques - mise en cache avec revalidation
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    } else if (pathname.startsWith("/examples/")) {
      // Pages d'exemples - mise en cache courte avec revalidation
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, s-maxage=120, stale-while-revalidate=30"
      );
    } else {
      // Pages normales - mise en cache modérée
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=60"
      );
    }
  } catch (error) {
    middlewareLogger.error("Erreur lors de l'application des en-têtes de cache", 
      error instanceof Error ? error : new Error(String(error)));
  }
  
  return response;
}

/**
 * Middleware principal qui combine tous les middlewares
 */
export default async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Enregistrer les métriques de base pour toutes les requêtes
    const startTime = Date.now();
    
    // Préparons la réponse qui sera potentiellement modifiée
    let response: NextResponse | null = null;
    
    // Middleware de cache de session pour les requêtes d'API de session
    if (pathname.startsWith('/api/auth/session')) {
      try {
        response = await sessionCacheMiddleware(request);
      } catch (error) {
        middlewareLogger.error('Erreur dans le middleware de cache de session', 
          error instanceof Error ? error : new Error(String(error)));
        response = NextResponse.next();
      }
    } 
    // Middleware d'authentification pour les routes protégées
    else if (shouldApplyAuthMiddleware(request)) {
      try {
        // @ts-ignore - withAuth attend NextRequest mais attend des options en second paramètre dans certains cas
        response = authMiddleware(request);
      } catch (error) {
        middlewareLogger.error('Erreur dans le middleware d\'authentification', 
          error instanceof Error ? error : new Error(String(error)));
        response = NextResponse.next();
      }
    } 
    // Pour les autres routes, continuer normalement
    else {
      response = NextResponse.next();
    }
    
    // Vérifier que response est bien définie avant d'appliquer les en-têtes de cache
    if (!response) {
      middlewareLogger.warn('Réponse non définie après traitement des middlewares');
      response = NextResponse.next();
    }
    
    // Appliquer les en-têtes de cache à la réponse
    const finalResponse = applyCacheHeaders(request, response);
    
    // Mesurer le temps d'exécution du middleware
    const duration = Date.now() - startTime;
    if (duration > 100) {
      // Logger les performances lentes uniquement
      middlewareLogger.debug(`Middleware exécuté en ${duration}ms pour ${pathname}`);
    }
    
    return finalResponse;
  } catch (error) {
    // Logger l'erreur et continuer normalement pour éviter de bloquer l'application
    middlewareLogger.error('Erreur dans le middleware principal', 
      error instanceof Error ? error : new Error(String(error)));
    return NextResponse.next();
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
  // Matcher pour les routes qui nécessitent le middleware
  matcher: [
    // Routes protégées par l'authentification
    "/admin/:path*", 
    "/profile", 
    "/dashboard", 
    "/challenges/:path*",
    
    // Routes API pour les métriques et le cache
    "/api/:path*",
    
    // Exclure les routes qui ne nécessitent pas le middleware
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
}; 