import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Clock, Tag, Search } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Défis | LPT Défis",
  description: "Explorez et participez à des défis passionnants",
};

interface ChallengeCardProps {
  title: string;
  description: string;
  category: string;
  points: number;
  endDate: Date;
  participants: number;
  href: string;
}

function ChallengeCard({
  title,
  description,
  category,
  points,
  endDate,
  participants,
  href,
}: ChallengeCardProps) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">
              <Link href={href} className="hover:underline">
                {title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>{category}</span>
              <span className="text-gray-300">•</span>
              <Trophy className="h-4 w-4" />
              <span>{points} points</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(endDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            <div className="text-right">{participants} participants</div>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}

export default async function ChallengesPage() {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    // Récupérer les défis depuis la base de données avec gestion d'erreur
    const challenges = await db.challenge.findMany({
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
    }).catch(error => {
      console.error('Error fetching challenges:', error);
      return null;
    });

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Défis</h1>
          <p className="text-muted-foreground">
            Explorez les défis disponibles et participez à ceux qui vous intéressent
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher un défi..."
              className="w-full rounded-md border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select className="rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Toutes les catégories</option>
            {/* Options des catégories à ajouter */}
          </select>
        </div>

        {/* Liste des défis */}
        <div className="grid gap-4">
          {challenges && challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title}
              description={challenge.description}
              category={challenge.category.name}
              points={challenge.points}
              endDate={challenge.endDate}
              participants={challenge._count.participations}
              href={`/challenges/${challenge.id}`}
            />
          ))}

          {(!challenges || challenges.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun défi disponible pour le moment
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading challenges:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Une erreur est survenue lors du chargement des défis. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }
}