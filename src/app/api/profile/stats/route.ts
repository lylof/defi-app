import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserStatsService } from "@/lib/user/user-stats-service";

/**
 * Récupère les statistiques détaillées de l'utilisateur connecté
 * Inclut également la liste des défis récents
 * 
 * @route GET /api/profile/stats
 * @access Privé - Nécessite d'être connecté
 */
export async function GET() {
  try {
    const session = await getServerSession();
    
    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }
    
    // Vérifier si l'ID utilisateur est disponible
    if (!session.user.id) {
      return NextResponse.json(
        { error: "ID utilisateur non disponible. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Vérifier que l'ID est une chaîne non vide
    if (typeof userId !== 'string' || !userId.trim()) {
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }
    
    // Récupérer les statistiques et les défis récents en parallèle
    const [userStats, recentChallenges] = await Promise.all([
      UserStatsService.getUserStats(userId),
      UserStatsService.getRecentChallenges(userId, 5)
    ]);
    
    return NextResponse.json({
      stats: userStats,
      recentChallenges
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    
    let statusCode = 500;
    let message = "Une erreur est survenue lors de la récupération des statistiques";
    
    // Personnaliser le message d'erreur si possible
    if (error instanceof Error) {
      message = error.message;
      if (message.includes("non trouvé") || message.includes("not found")) {
        statusCode = 404;
      } else if (message.includes("non autorisé") || message.includes("unauthorized")) {
        statusCode = 401;
      } else if (message.includes("valide") || message.includes("valid")) {
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
} 