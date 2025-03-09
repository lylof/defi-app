import { NextResponse } from "next/server";
import { dbHealthService } from "@/lib/db-health-service";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cacheService } from "@/lib/cache-service";
import { logger } from "@/lib/logger";
import { apiLogger } from "@/lib/logger";

/**
 * Point d'API pour vérifier la santé du système
 * Accessible uniquement aux administrateurs
 * 
 * @route GET /api/health
 * @access Privé - Administrateurs uniquement
 */
export async function GET() {
  try {
    apiLogger.info("Requête de vérification de la santé du système reçue");
    
    // Vérifier l'authentification avec authOptions explicites
    const session = await getServerSession(authOptions);
    
    // Log pour déboguer les informations de session
    apiLogger.debug("Informations de session pour la requête health", {
      metadata: {
        sessionExists: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role,
      }
    });
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      apiLogger.warn("Tentative d'accès non autorisé à l'API de santé", {
        metadata: {
          userId: session?.user?.id,
          role: session?.user?.role
        }
      });
      
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }
    
    // Log de succès de l'authentification
    apiLogger.info(`Accès autorisé à l'API de santé pour l'utilisateur ${session.user.id} (${session.user.role})`);
    
    // Forcer une vérification de la santé de la base de données
    await dbHealthService.checkHealth();
    
    // Récupérer les statistiques de santé
    const dbStats = dbHealthService.getHealthStats();
    
    // Récupérer les statistiques de cache
    const cacheStats = cacheService.getStats();
    
    // Récupérer des informations supplémentaires sur la base de données
    const [usersCount, challengesCount, submissionsCount] = await Promise.allSettled([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.submission.count()
    ]);
    
    // Récupérer des informations sur le système
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV
    };
    
    // Récupérer des statistiques sur la connexion à la base de données
    const connectionStats = prisma instanceof Object && 'getConnectionStats' in prisma 
      ? (prisma as any).getConnectionStats() 
      : { healthy: dbStats.isConnected };
    
    // Construire la réponse
    const healthData = {
      status: dbStats.status,
      timestamp: new Date().toISOString(),
      database: {
        ...dbStats,
        connection: connectionStats,
        counts: {
          users: usersCount.status === 'fulfilled' ? usersCount.value : null,
          challenges: challengesCount.status === 'fulfilled' ? challengesCount.value : null,
          submissions: submissionsCount.status === 'fulfilled' ? submissionsCount.value : null
        }
      },
      cache: {
        ...cacheStats,
        status: cacheStats.size > 0 ? 'active' : 'empty'
      },
      system: systemInfo,
      auth: {
        provider: "next-auth",
        session: {
          exists: !!session,
          userId: session?.user?.id || null,
          role: session?.user?.role || null
        }
      },
      logging: {
        enabled: true,
        loggers: [
          'app',
          'api',
          'auth',
          'database',
          'cache'
        ]
      }
    };
    
    apiLogger.info("Vérification de la santé du système terminée avec succès", {
      metadata: {
        status: dbStats.status,
        databaseConnected: dbStats.isConnected,
        cacheEntries: cacheStats.size
      }
    });
    
    return NextResponse.json(healthData);
  } catch (error) {
    apiLogger.error("Erreur lors de la vérification de la santé du système", error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la vérification de la santé du système",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 