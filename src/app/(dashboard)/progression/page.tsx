import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LevelProgress } from "@/components/levels/level-progress";
import { LevelRewards } from "@/components/levels/level-rewards";

export const metadata: Metadata = {
  title: "Progression | LPT Défis",
  description: "Suivez votre progression et débloquez des récompenses",
};

export default async function ProgressionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ma Progression</h1>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <LevelProgress />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Défis complétés
                </div>
                <div className="text-2xl font-bold">
                  {/* TODO: Ajouter les statistiques réelles */}
                  0
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Points totaux
                </div>
                <div className="text-2xl font-bold">
                  {/* TODO: Ajouter les statistiques réelles */}
                  0
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <LevelRewards />
        </div>
      </div>
    </div>
  );
} 