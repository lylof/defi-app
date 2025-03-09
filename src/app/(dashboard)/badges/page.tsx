import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mes Badges | LPT Défis",
  description: "Découvrez vos badges et récompenses sur LPT Défis",
};

export default async function BadgesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return redirect("/login?callbackUrl=/badges");
  }

  try {
    const badges = await db.badge.findMany({
      include: {
        users: {
          where: {
            userId: session.user.id,
          },
          orderBy: {
            earnedAt: "desc",
          },
        },
      },
      orderBy: {
        points: "desc",
      },
    });

    const earnedBadges = badges.filter((badge) => badge.users.length > 0);
    const unearnedBadges = badges.filter((badge) => badge.users.length === 0);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes Badges</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Badges Obtenus ({earnedBadges.length})
            </h2>
            <BadgeGrid badges={earnedBadges} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Badges à Débloquer ({unearnedBadges.length})
            </h2>
            <BadgeGrid badges={unearnedBadges} />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des badges:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mes Badges</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement des badges. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
} 