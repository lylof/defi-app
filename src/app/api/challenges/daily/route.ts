import { NextResponse } from "next/server";
import { advancedCache } from "@/lib/cache/advanced-cache";
import { logger } from "@/lib/logger";

// Clé de cache pour le défi du jour
const DAILY_CHALLENGE_CACHE_KEY = "daily-challenge";

// Interface pour le type de défi du jour
interface DailyChallenge {
  id: string;
  title: string;
  domain: string;
  description: string;
  difficulty: number;
  participants: number;
  endTime: string;
  briefUrl: string;
  participateUrl: string;
  theme?: string;
}

// Simuler le service de défi du jour
const DailyChallengeService = {
  getActiveChallenge: async (): Promise<DailyChallenge | null> => {
    // Vérifier si les données sont en cache
    const cachedData = advancedCache.get(DAILY_CHALLENGE_CACHE_KEY) as DailyChallenge | undefined;
    if (cachedData) {
      return cachedData;
    }

    // Exemple de défi du jour (à remplacer par une récupération depuis la base de données)
    const dailyChallenge: DailyChallenge = {
      id: "daily-challenge-1",
      title: "Créer une Landing Page Responsive",
      domain: "Design",
      description: "Concevoir une landing page moderne et responsive pour promouvoir une application de fitness. Utilisez les principes de design UX/UI modernes.",
      difficulty: 3,
      participants: 128,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 heures à partir de maintenant
      briefUrl: "/challenges/daily-challenge-1",
      participateUrl: "/challenges/daily-challenge-1/participate",
      theme: "UX/UI Design"
    };

    // Stocker dans le cache avancé
    advancedCache.set(DAILY_CHALLENGE_CACHE_KEY, dailyChallenge, {
      ttl: 5 * 60 * 1000, // 5 minutes
      group: "challenges",
      priority: 10
    });

    return dailyChallenge;
  }
};

/**
 * Route API pour récupérer le défi du jour
 * Optimisée avec mise en cache avancée et gestion d'erreurs améliorée
 * 
 * @returns Détails du défi quotidien
 */
export async function GET() {
  try {
    // Récupérer le défi du jour depuis la base de données
    const dailyChallenge = await DailyChallengeService.getActiveChallenge();
    
    // Si aucun défi n'est trouvé, retourner une 404
    if (!dailyChallenge) {
      logger.info("Aucun défi du jour actif trouvé");
      
      // Réponse avec un message d'erreur approprié
      const notFoundResponse = NextResponse.json(
        { error: "Aucun défi du jour actif n'est disponible actuellement" },
        { status: 404 }
      );
      
      // Ajouter un en-tête de cache court pour permettre une nouvelle tentative rapide
      notFoundResponse.headers.set('Cache-Control', 'no-store, max-age=0');
      
      return notFoundResponse;
    }
    
    // Enregistrer l'accès au défi pour les statistiques
    logger.info(`Défi du jour récupéré avec succès: ${dailyChallenge.id}, thème: ${dailyChallenge.theme}`);

    // Créer la réponse avec les données
    const response = NextResponse.json(dailyChallenge);
    
    // Ajouter des en-têtes de cache pour optimiser les performances
    // Cache pendant 5 minutes côté client, 10 minutes côté serveur
    // Permet la revalidation en arrière-plan après 1 minute
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, s-maxage=600, stale-while-revalidate=60'
    );
    
    // Ajouter un en-tête pour indiquer que c'est un miss du cache
    response.headers.set('X-Cache', 'MISS');
    
    return response;
  } catch (error) {
    logger.error("Erreur lors de la récupération du défi du jour", 
      error instanceof Error ? error : new Error(String(error)));
    
    // Réponse d'erreur avec en-têtes de cache appropriés
    const errorResponse = NextResponse.json(
      { error: "Impossible de récupérer le défi du jour" },
      { status: 500 }
    );
    
    // Cache court pour les erreurs
    errorResponse.headers.set('Cache-Control', 'no-cache');
    
    return errorResponse;
  }
} 