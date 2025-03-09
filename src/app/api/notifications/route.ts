import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NotificationService } from "@/lib/notifications/notification-service";
import { logger } from "@/lib/logger";

const apiLogger = logger.createContextLogger('api:notifications');

/**
 * Récupère les notifications de l'utilisateur connecté
 * 
 * GET /api/notifications
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 20)
 * - unread: si true, retourne uniquement les notifications non lues
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer la session de l'utilisateur
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Récupérer les paramètres de requête
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';
    
    // Valider les paramètres
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Paramètres de pagination invalides" },
        { status: 400 }
      );
    }
    
    // Récupérer les notifications selon le filtre
    let result;
    if (unreadOnly) {
      const notifications = await NotificationService.getUnreadNotifications(session.user.id, limit);
      result = {
        data: notifications,
        pagination: {
          page: 1,
          limit,
          total: notifications.length,
          totalPages: notifications.length > 0 ? 1 : 0
        }
      };
    } else {
      result = await NotificationService.getUserNotifications(session.user.id, page, limit);
    }
    
    // Récupérer le compteur de notifications non lues
    const unreadCount = await NotificationService.countUnread(session.user.id);
    
    return NextResponse.json({
      ...result,
      unreadCount
    });
  } catch (error) {
    apiLogger.error('Erreur lors de la récupération des notifications', 
      error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

/**
 * Supprime toutes les notifications ou marque toutes comme lues
 * 
 * DELETE /api/notifications
 * Query params:
 * - action: 'delete' pour supprimer toutes les notifications,
 *           'mark-read' pour marquer toutes comme lues
 */
export async function DELETE(req: NextRequest) {
  try {
    // Récupérer la session de l'utilisateur
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Récupérer l'action à effectuer
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action') || 'mark-read';
    
    // Exécuter l'action appropriée
    if (action === 'delete') {
      // Suppression de toutes les notifications non implémentée pour des raisons de sécurité
      // Cette fonctionnalité pourrait être ajoutée plus tard si nécessaire
      return NextResponse.json(
        { error: "Suppression en masse non supportée" },
        { status: 400 }
      );
    } else if (action === 'mark-read') {
      // Marquer toutes les notifications comme lues
      const updatedCount = await NotificationService.markAllAsRead(session.user.id);
      
      return NextResponse.json({
        success: true,
        message: `${updatedCount} notifications marquées comme lues`
      });
    } else {
      return NextResponse.json(
        { error: "Action non supportée" },
        { status: 400 }
      );
    }
  } catch (error) {
    apiLogger.error('Erreur lors de la suppression/marquage des notifications', 
      error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
} 