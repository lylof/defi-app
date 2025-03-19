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
  Calendar,
  Tag,
  FolderTree,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLog } from "@/types/admin";

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
        name: "Catégories",
        value: stats.categories.total,
        icon: Tag,
        change: `${stats.categories.withChallenges} utilisées`,
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
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.name} className="admin-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.name}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className={`text-xs ${
                    card.changeType === "positive" ? "text-green-600" : 
                    card.changeType === "negative" ? "text-red-600" : 
                    "text-muted-foreground"
                  }`}>
                    {card.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="admin-card lg:col-span-1">
            <CardHeader>
              <CardTitle>Catégories Populaires</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.categories.mostUsed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderTree className="h-4 w-4 text-primary" />
                      <span className="font-medium">{stats.categories.mostUsed.name}</span>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {stats.categories.mostUsed.count} défis
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {stats.categories.withChallenges} catégories sur {stats.categories.total} sont utilisées par au moins un défi.
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full admin-btn admin-btn-secondary" asChild>
                    <Link href="/admin/categories" className="inline-flex items-center justify-center">
                      Gérer les catégories
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune catégorie avec des défis</p>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card lg:col-span-1">
            <CardHeader>
              <CardTitle>Activités Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs && logs.length > 0 ? (
                  logs.map((log: AdminLog) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {log.action === "UPDATE_ROLE" 
                            ? "Modification de rôle"
                            : log.action === "BAN"
                            ? "Suspension d'utilisateur"
                            : log.action === "CREATE_CATEGORY"
                            ? "Création de catégorie"
                            : log.action === "UPDATE_CATEGORY"
                            ? "Modification de catégorie"
                            : log.action === "DELETE_CATEGORY"
                            ? "Suppression de catégorie"
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

          <Card className="admin-card lg:col-span-1">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full admin-btn admin-btn-primary" asChild>
                <Link href="/admin/challenges/new" className="inline-flex items-center justify-center">
                  Créer un nouveau défi
                </Link>
              </Button>
              <Button className="w-full admin-btn" variant="secondary" asChild>
                <Link href="/admin/users" className="inline-flex items-center justify-center">
                  Gérer les utilisateurs
                </Link>
              </Button>
              <Button className="w-full admin-btn admin-btn-secondary" variant="outline" asChild>
                <Link href="/admin/categories/new" className="inline-flex items-center justify-center">
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