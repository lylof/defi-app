import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestion des Défis",
  description: "Interface de gestion des défis",
};

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  try {
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
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Défis</h1>
          <Link
            href="/admin/challenges/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Nouveau Défi
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Liste des Défis</h2>
            {challenges.length > 0 ? (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {challenge.category.name} • {challenge._count.participations} participants
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/challenges/${challenge.id}`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/admin/challenges/${challenge.id}/edit`}
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun défi n'a été créé pour le moment
              </p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading challenges:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Une erreur est survenue lors du chargement des défis. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }
}