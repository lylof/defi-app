import { NextResponse } from "next/server";
import { DbHealthService } from "@/lib/db-health-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Point d'API pour vérifier la santé du système
 * Accessible uniquement aux administrateurs
 * Utilise le cache pour réduire la charge sur la base de données
 * 
 * @route GET /api/health
 * @access Privé - Administrateurs uniquement
 */
export async function GET() {
  try {
    console.info("Requête de vérification de la santé du système reçue");
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    // Log pour déboguer les informations de session
    console.debug("Informations de session pour la requête health", {
      sessionExists: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    });
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      console.warn("Tentative d'accès non autorisé à l'API de santé", {
        userId: session?.user?.id,
        role: session?.user?.role
      });
      
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }
    
    // Log de succès de l'authentification
    console.info(`Accès autorisé à l'API de santé pour l'utilisateur ${session.user.id} (${session.user.role})`);
    
    // Utiliser notre service optimisé avec cache pour vérifier la santé de la base de données
    const { isConnected, stats } = await DbHealthService.checkHealth();
    
    // Récupérer les statistiques basiques de manière optimisée
    const counts = await DbHealthService.getBasicStats();
    
    // Récupérer des informations sur le système
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development'
    };
    
    // Déterminer le statut global du système
    const status = isConnected ? 'healthy' : 'critical';
    
    // Construire la réponse
    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      database: {
        isConnected,
        lastCheckTime: stats.lastCheckTime,
        connectionErrors: stats.connectionErrors,
        averageQueryTime: stats.averageQueryTime,
        status: isConnected ? 'healthy' : 'critical',
        counts
      },
      system: systemInfo,
      auth: {
        provider: "next-auth",
        session: {
          exists: !!session,
          userId: session?.user?.id || null,
          role: session?.user?.role || null
        }
      }
    };
    
    console.info("Vérification de la santé du système terminée avec succès", {
      status,
      databaseConnected: isConnected
    });
    
    return NextResponse.json(healthData);
  } catch (error) {
    console.error("Erreur lors de la vérification de la santé du système", error);
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la vérification de la santé du système",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
