import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { metricsMiddleware } from "./lib/metrics-middleware";

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
      console.log(`[Middleware] Pas de token pour ${pathname}, redirection vers login`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // Vérifier si la session a expiré
    if (token?.error === "SessionExpired") {
      console.log(`[Middleware] Session expirée pour ${pathname}, redirection vers login avec paramètre expired`);
      return NextResponse.redirect(new URL("/login?expired=true", req.url));
    }
    
    // Vérifier l'ID utilisateur
    if (!token.id || typeof token.id !== 'string' || token.id.trim() === '') {
      console.log(`[Middleware] ID utilisateur invalide (${token.id}) pour ${pathname}, redirection vers logout`);
      return NextResponse.redirect(new URL("/logout", req.url));
    }
    
    // Protection des routes admin
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        console.log(`[Middleware] Accès admin refusé pour ${token.email || 'utilisateur inconnu'} (rôle: ${token.role}) - ${pathname}`);
        return NextResponse.redirect(new URL("/login?unauthorized=true", req.url));
      }
      console.log(`[Middleware] Accès admin autorisé pour ${token.email || 'utilisateur inconnu'} - ${pathname}`);
    }
    
    // Vérification spécifique pour la route de profil
    if (pathname === "/profile") {
      // Log d'accès pour déboguer les problèmes d'authentification
      console.log(`[Middleware] Accès au profil pour l'utilisateur ${token.id} (${token.email || 'email inconnu'})`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Autoriser même si token.error existe pour pouvoir gérer l'expiration dans le middleware
        const isAuthorized = !!token;
        const pathname = req.nextUrl.pathname;
        
        if (!isAuthorized) {
          console.log(`[Middleware][Unauthorized] Accès refusé à ${pathname} - Pas de token valide`);
        }
        
        return isAuthorized;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
      signOut: "/logout",
    }
  }
);

/**
 * Middleware principal
 * Chaîne plusieurs middlewares pour gérer l'authentification et les métriques
 */
export default async function middleware(request: NextRequest) {
  // Pour les routes qui nécessitent une authentification
  if (shouldApplyAuthMiddleware(request)) {
    // Le withAuth a besoin de Request et non NextRequest
    // @ts-ignore - On sait que cette conversion fonctionne avec withAuth
    const response = await authMiddleware(request);
    return response;
  }
  
  // Pour toutes les routes, appliquer le middleware de métriques
  return metricsMiddleware(request, async () => {
    // Continuer la chaîne des middlewares ou passer au handler de la route
    return NextResponse.next();
  });
}

/**
 * Détermine si le middleware d'authentification doit être appliqué à la requête
 */
function shouldApplyAuthMiddleware(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  
  // Liste des chemins protégés par l'authentification
  const protectedPaths = [
    "/admin",
    "/profile",
    "/dashboard",
    "/challenges"
  ];
  
  // Vérifier si le chemin correspond à un chemin protégé
  return protectedPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
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