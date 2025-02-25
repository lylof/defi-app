import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";
import Link from "next/link";
import { 
  Users, 
  Trophy,
  Activity,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Tableau de bord administrateur",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  try {
    const stats = await AdminService.getStats();
    const { logs } = await AdminService.getLogs(1, 5);

    const statCards = [
      {
        name: "Utilisateurs Inscrits",
        value: stats.users.total,
        icon: Users,
        change: `${stats.users.active} actifs`,
        changeType: "info"
      },
      {
        name: "Défis Actifs",
        value: stats.challenges.active,
        icon: Trophy,
        change: `sur ${stats.challenges.total} total`,
        changeType: "info"
      },
      {
        name: "Taux de Participation",
        value: `${stats.participationRate}%`,
        icon: Activity,
        change: "ce mois",
        changeType: "info"
      },
      {
        name: "Nouveaux Défis",
        value: stats.monthlyStats.challenges,
        icon: Calendar,
        change: stats.monthlyStats.change,
        changeType: "positive"
      }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm">
                          {log.action === "UPDATE_ROLE" 
                            ? "Modification de rôle"
                            : log.action === "BAN"
                            ? "Suspension d'utilisateur"
                            : "Réactivation d'utilisateur"
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/admin/challenges/new">
                  Créer un nouveau défi
                </Link>
              </Button>
              <Button className="w-full" variant="secondary" asChild>
                <Link href="/admin/users">
                  Gérer les utilisateurs
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/categories/new">
                  Ajouter une catégorie
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement du dashboard. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
} 