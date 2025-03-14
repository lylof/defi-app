import { toast } from "sonner";
import { AnonymousParticipationService } from "./anonymous-participation-service";

/**
 * Service pour gérer la migration des participations anonymes vers un compte utilisateur
 */
export class AnonymousMigrationService {
  /**
   * Récupère toutes les participations anonymes et les migre vers le compte utilisateur
   * @returns Le nombre de participations migrées
   */
  static async migrateAnonymousParticipations(): Promise<number> {
    try {
      // Récupérer toutes les participations anonymes
      const anonymousParticipations = AnonymousParticipationService.getAllParticipations();
      
      if (!anonymousParticipations || anonymousParticipations.length === 0) {
        return 0;
      }
      
      // Compter les participations qui ont été soumises
      const submittedParticipations = anonymousParticipations.filter(p => p.isSubmitted);
      
      // Pour chaque participation, nous créerions une participation réelle en base de données
      // Ceci est une implémentation simplifiée qui serait remplacée par des appels API réels
      for (const participation of anonymousParticipations) {
        console.log(`Migrating participation for challenge ${participation.challengeId}`);
        
        // Ici, on appellerait une API pour créer la participation en base de données
        // await api.post('/api/participations', {
        //   challengeId: participation.challengeId,
        //   description: participation.description,
        //   repositoryUrl: participation.repositoryUrl,
        //   progress: participation.progress
        // });
      }
      
      // Une fois migrées, supprimer toutes les participations anonymes
      AnonymousParticipationService.clearAllParticipations();
      
      toast.success(
        submittedParticipations.length > 0
          ? `${submittedParticipations.length} soumission(s) et ${anonymousParticipations.length - submittedParticipations.length} brouillon(s) migrés avec succès !`
          : `${anonymousParticipations.length} brouillon(s) migrés avec succès !`
      );
      
      return anonymousParticipations.length;
    } catch (error) {
      console.error("Erreur lors de la migration des participations anonymes:", error);
      toast.error("Erreur lors de la migration des participations anonymes");
      return 0;
    }
  }
  
  /**
   * Vérifie s'il existe des participations anonymes à migrer
   */
  static hasParticipationsToMigrate(): boolean {
    return AnonymousParticipationService.hasAnonymousParticipations();
  }
  
  /**
   * Affiche une notification à l'utilisateur s'il a des participations anonymes à migrer
   */
  static notifyIfParticipationsExist(): void {
    if (this.hasParticipationsToMigrate()) {
      toast.info(
        "Nous avons détecté des participations anonymes sur cet appareil. Connectez-vous pour les sauvegarder définitivement !",
        {
          duration: 8000,
          action: {
            label: "En savoir plus",
            onClick: () => {
              // Ici, on pourrait ouvrir une modale d'information
              console.log("Afficher plus d'informations sur la migration");
            }
          }
        }
      );
    }
  }
} 