import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { cacheService } from "@/lib/cache-service";
import { authOptions } from "@/lib/auth";

const apiLogger = logger.createContextLogger('api:notifications:count');

/**
 * Récupère le nombre de notifications non lues pour l'utilisateur authentifié
 * 
 * GET /api/notifications/count
 */
export async function GET() {
  try {
    // Récupérer la session de l'utilisateur avec les options d'authentification explicites
    const session = await getServerSession(authOptions);
    
    // Vérification plus robuste de l'authentification
    if (!session || !session.user || !session.user.id) {
      apiLogger.warn("Tentative d'accès sans authentification");
      return NextResponse.json(
        { error: "Authentification requise", count: 0 },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    apiLogger.debug(`Récupération du nombre de notifications pour l'utilisateur ${userId}`);
    
    // Essayer de récupérer le compteur depuis le cache
    const cacheKey = `unread-count:${userId}`;
    let count = await cacheService.get<number>(cacheKey);
    
    // Si pas dans le cache, récupérer depuis la base de données
    if (count === null || count === undefined) {
      apiLogger.debug(`Comptage des notifications non lues pour l'utilisateur ${userId}`);
      
      try {
        count = await prisma.notification.count({
          where: {
            userId,
            read: false
          }
        });
        
        // Mettre en cache pour 5 minutes
        await cacheService.set(cacheKey, count, { ttl: 5 * 60 * 1000 });
      } catch (dbError) {
        apiLogger.error(`Erreur de base de données lors du comptage des notifications pour ${userId}`, 
          dbError instanceof Error ? dbError : new Error(String(dbError)));
        
        // En cas d'erreur de base de données, retourner 0 pour éviter de bloquer l'UI
        count = 0;
      }
    }
    
    return NextResponse.json({ count });
  } catch (error) {
    apiLogger.error('Erreur lors du comptage des notifications non lues', 
      error instanceof Error ? error : new Error(String(error)));
    
    // En cas d'erreur, retourner 0 pour éviter de bloquer l'UI
    return NextResponse.json(
      { error: "Erreur lors du comptage des notifications", count: 0 },
      { status: 500 }
    );
  }
} 