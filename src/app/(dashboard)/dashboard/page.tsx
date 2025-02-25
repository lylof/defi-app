import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Trophy, Target, Star, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Tableau de bord | LPT Défis",
  description: "Votre tableau de bord personnel",
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/15">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Ces données devraient venir de la base de données
  const stats = {
    points: 150,
    defisCompletes: 3,
    defisEnCours: 2,
    niveau: 2,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord personnel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Points totaux"
          value={stats.points}
          icon={<Trophy className="h-4 w-4 text-primary" />}
          description="Points accumulés"
        />
        <StatCard
          title="Défis complétés"
          value={stats.defisCompletes}
          icon={<Target className="h-4 w-4 text-primary" />}
          description="Défis réussis"
        />
        <StatCard
          title="Défis en cours"
          value={stats.defisEnCours}
          icon={<Clock className="h-4 w-4 text-primary" />}
          description="Défis actifs"
        />
        <StatCard
          title="Niveau"
          value={stats.niveau}
          icon={<Star className="h-4 w-4 text-primary" />}
          description="Votre progression"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Défis récents</h3>
            <p className="text-sm text-muted-foreground">
              Vos derniers défis en cours
            </p>
            {/* Liste des défis récents à implémenter */}
          </div>
        </div>

        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Activité récente</h3>
            <p className="text-sm text-muted-foreground">
              Vos dernières actions sur la plateforme
            </p>
            {/* Liste des activités récentes à implémenter */}
          </div>
        </div>
      </div>
    </div>
  );
} 