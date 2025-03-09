import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NotificationService } from "@/lib/notifications/notification-service";
import { logger } from "@/lib/logger";

const apiLogger = logger.createContextLogger('api:notifications');

interface Params {
  params: {
    id: string;
  };
}

/**
 * Marque une notification comme lue
 * 
 * PATCH /api/notifications/[id]
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Récupérer la session de l'utilisateur
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Marquer comme lue
    await NotificationService.markAsRead(id, session.user.id);
    
    return NextResponse.json({
      success: true,
      message: "Notification marquée comme lue"
    });
  } catch (error) {
    apiLogger.error(`Erreur lors du marquage de la notification ${params.id}`, 
      error instanceof Error ? error : new Error(String(error)));
    
    // Déterminer si c'est une erreur d'autorisation ou une erreur serveur
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFoundError = errorMessage.includes('non trouvée') || errorMessage.includes('n\'appartenant pas');
    
    return NextResponse.json(
      { 
        error: isNotFoundError 
          ? "Notification non trouvée ou non autorisée" 
          : "Erreur lors du marquage de la notification" 
      },
      { status: isNotFoundError ? 404 : 500 }
    );
  }
}

/**
 * Supprime une notification
 * 
 * DELETE /api/notifications/[id]
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Récupérer la session de l'utilisateur
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Supprimer la notification
    const success = await NotificationService.deleteNotification(id, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Notification non trouvée ou non autorisée" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Notification supprimée avec succès"
    });
  } catch (error) {
    apiLogger.error(`Erreur lors de la suppression de la notification ${params.id}`, 
      error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
} 