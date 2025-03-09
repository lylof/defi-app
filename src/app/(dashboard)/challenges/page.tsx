import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ChallengeList from "@/components/challenges/challenge-list";
import { DataError } from "@/components/ui/data-error";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Défis | LPT Défis",
  description: "Explorez et participez à des défis passionnants",
};

/**
 * Page de liste des défis disponibles
 * Affiche tous les défis publiés avec filtrage par catégorie
 */
export default async function ChallengesPage() {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    // Récupérer les défis et les catégories en parallèle
    const [challengesResult, categoriesResult] = await Promise.allSettled([
      db.challenge.findMany({
        include: {
          category: true,
          _count: {
            select: {
              participations: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          isPublished: true, // Ajouter un filtre pour ne montrer que les défis publiés
        },
      }),
      db.category.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    // Vérifier s'il y a eu des erreurs dans les requêtes
    if (challengesResult.status === 'rejected') {
      throw new Error(`Erreur lors du chargement des défis: ${(challengesResult as PromiseRejectedResult).reason}`);
    }
    
    if (categoriesResult.status === 'rejected') {
      throw new Error(`Erreur lors du chargement des catégories: ${(categoriesResult as PromiseRejectedResult).reason}`);
    }

    // Extraire les résultats des promesses
    const challenges = challengesResult.value;
    const categories = categoriesResult.value;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Défis</h1>
          <p className="text-muted-foreground">
            Explorez les défis disponibles et participez à ceux qui vous intéressent
          </p>
        </div>

        {/* ChallengeList component */}
        <ChallengeList challenges={challenges} categories={categories} />
      </div>
    );
  } catch (error) {
    console.error("Error loading challenges:", error);
    
    return (
      <div className="container py-10">
        <DataError 
          title="Impossible de charger les défis"
          message="Une erreur est survenue lors du chargement des défis. Cela peut être dû à un problème temporaire de connexion à la base de données."
          error={error}
          homeLink={true}
        >
          <Button 
            onClick={() => window.location.reload()}
            variant="default" 
            size="sm"
            className="inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser la page
          </Button>
        </DataError>
      </div>
    );
  }
}