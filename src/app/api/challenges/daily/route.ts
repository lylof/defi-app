import { NextResponse } from "next/server";

/**
 * Route API pour récupérer le défi du jour
 * Actuellement cette API retourne un défi factice pour démonstration
 * À connecter à la base de données dans une future implémentation
 * 
 * @returns Détails du défi quotidien
 */
export async function GET() {
  try {
    // Exemple de défi du jour (à remplacer par une récupération depuis la base de données)
    const dailyChallenge = {
      id: "daily-challenge-1",
      title: "Créer une Landing Page Responsive",
      domain: "Design",
      description: "Concevoir une landing page moderne et responsive pour promouvoir une application de fitness. Utilisez les principes de design UX/UI modernes.",
      difficulty: 3,
      participants: 128,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 heures à partir de maintenant
      briefUrl: "/challenges/daily-challenge-1",
      participateUrl: "/challenges/daily-challenge-1/participate",
    };

    return NextResponse.json(dailyChallenge);
  } catch (error) {
    console.error("Erreur lors de la récupération du défi du jour:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le défi du jour" },
      { status: 500 }
    );
  }
} 