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
  ArrowUpRight,
  TrendingUp,
  LineChart,
  ChevronRight,
  Award,
  PieChart,
  Zap,
  Plus,
  Edit,
  Clock,
  RefreshCw,
  Check,
  BarChart,
  Shield,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLog } from "@/types/admin";
import { Progress } from "@/components/ui/progress";
import { AdminStatsPanel } from "@/components/admin/admin-stats-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
        changeType: "info",
        color: "blue",
        trend: { value: 12, isPositive: true }
      },
      {
        name: "Défis Actifs",
        value: stats.challenges.active,
        icon: Trophy,
        change: `sur ${stats.challenges.total} total`,
        changeType: "info",
        color: "green",
        trend: { value: 8, isPositive: true }
      },
      {
        name: "Catégories",
        value: stats.categories.total,
        icon: Tag,
        change: `${stats.categories.withChallenges} utilisées`,
        changeType: "info",
        color: "purple",
        trend: null
      },
      {
        name: "Taux de Participation",
        value: `${stats.participationRate}%`,
        icon: Activity,
        change: "ce mois",
        changeType: "info",
        color: "amber",
        trend: { value: 5, isPositive: true }
      },
      {
        name: "Nouveaux Défis",
        value: stats.monthlyStats.challenges,
        icon: Calendar,
        change: stats.monthlyStats.change,
        changeType: "positive",
        color: "pink",
        trend: { value: 15, isPositive: true }
      }
    ];

    return (
      <div className="space-y-8">
        {/* Bannière d'accueil personnalisée */}
        <div className="space-y-8">
          <div 
            className="admin-card-enhanced p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Bonjour{session?.user?.name ? `, ${session.user.name?.split(' ')[0]}` : ''}
                </h1>
                <p className="text-muted-foreground">
                  Bienvenue sur le tableau de bord d'administration de la plateforme LPT Défis
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button className="admin-btn-enhanced primary" asChild>
                  <Link href="/admin/challenges/new" className="inline-flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau défi
                  </Link>
                </Button>
                <Button variant="outline" className="admin-btn-enhanced secondary" asChild>
                  <Link href="/admin/submissions" className="inline-flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Évaluer les soumissions
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales avec animations décalées */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 lg:grid-cols-3 gap-4"
        >
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const getColorClass = (color: string) => {
              switch (color) {
                case 'blue': return 'from-blue-500 to-blue-400';
                case 'green': return 'from-emerald-500 to-green-400';
                case 'amber': return 'from-amber-500 to-yellow-400';
                case 'purple': return 'from-purple-500 to-violet-400';
                case 'pink': return 'from-pink-500 to-rose-400';
                default: return 'from-primary to-blue-400';
              }
            };
            
            return (
              <div 
                key={card.name} 
                className="admin-stat-card-enhanced"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="admin-stat-label">{card.name}</p>
                    <h3 className="admin-stat-value">{card.value}</h3>
                    {card.trend && (
                      <div className={`flex items-center text-xs font-medium ${card.trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${!card.trend.isPositive && 'rotate-180'}`} />
                        <span>{card.trend.isPositive ? '+' : ''}{card.trend.value}% depuis le mois dernier</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getColorClass(card.color)} text-white transition-transform group-hover:scale-110 shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    {card.change}
                </div>
                
                {card.name === "Taux de Participation" && (
                  <div className="mt-2">
                    <Progress value={parseFloat(card.value.toString())} className="h-1.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn"
        >
          {/* Section Catégories Populaires */}
          <Card className="admin-card-enhanced lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Catégories Populaires</CardTitle>
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Les catégories les plus utilisées pour les défis</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.categories.mostUsed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg hover:bg-background/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md text-primary">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{stats.categories.mostUsed.name}</p>
                        <p className="text-xs text-muted-foreground">Catégorie la plus utilisée</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {stats.categories.mostUsed.count} défis
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Utilisation des catégories</span>
                      <span className="font-medium">{stats.categories.withChallenges}/{stats.categories.total}</span>
                    </div>
                    <Progress value={(stats.categories.withChallenges / stats.categories.total) * 100} className="h-1.5" />
                  </div>
                  
                  <Button className="w-full admin-btn-enhanced secondary group" asChild>
                    <Link href="/admin/categories" className="inline-flex items-center justify-center">
                      Gérer les catégories
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                  <p className="text-muted-foreground">Aucune catégorie avec des défis</p>
                  <Button className="mt-4 admin-btn-enhanced" variant="outline" size="sm" asChild>
                    <Link href="/admin/categories/new">Créer une catégorie</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section Activités Récentes */}
          <Card className="admin-card-enhanced lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Activités Récentes</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs && logs.length > 0 ? (
                  logs.map((log: AdminLog, index: number) => {
                    const getActionIcon = (action: string) => {
                      switch (action) {
                        case 'UPDATE_ROLE': return <Edit className="h-4 w-4 text-blue-500" />;
                        case 'BAN': return <Users className="h-4 w-4 text-red-500" />;
                        case 'CREATE_CATEGORY': return <Plus className="h-4 w-4 text-green-500" />;
                        case 'UPDATE_CATEGORY': return <Edit className="h-4 w-4 text-amber-500" />;
                        case 'DELETE_CATEGORY': return <Tag className="h-4 w-4 text-red-500" />;
                        default: return <RefreshCw className="h-4 w-4 text-green-500" />;
                      }
                    };

                    const getActionLabel = (action: string) => {
                      switch (action) {
                        case 'UPDATE_ROLE': return "Modification de rôle";
                        case 'BAN': return "Suspension d'utilisateur";
                        case 'CREATE_CATEGORY': return "Création de catégorie";
                        case 'UPDATE_CATEGORY': return "Modification de catégorie";
                        case 'DELETE_CATEGORY': return "Suppression de catégorie";
                        default: return "Réactivation d'utilisateur";
                      }
                    };

                    const getActionColor = (action: string) => {
                      switch (action) {
                        case 'UPDATE_ROLE': return "bg-blue-50 dark:bg-blue-900/20";
                        case 'BAN': return "bg-red-50 dark:bg-red-900/20";
                        case 'CREATE_CATEGORY': return "bg-green-50 dark:bg-green-900/20";
                        case 'UPDATE_CATEGORY': return "bg-amber-50 dark:bg-amber-900/20";
                        case 'DELETE_CATEGORY': return "bg-red-50 dark:bg-red-900/20";
                        default: return "bg-green-50 dark:bg-green-900/20";
                      }
                    };

                    return (
                      <div 
                        key={log.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${getActionColor(log.action)} hover:bg-opacity-80 transition-colors hover:translate-x-1`}
                      >
                        <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm">
                          {getActionIcon(log.action)}
                      </div>
                      <div>
                          <p className="font-medium text-sm">
                            {getActionLabel(log.action)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" /> 
                          {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section Actions Rapides */}
          <Card className="admin-card-enhanced lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Actions Rapides</CardTitle>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button className="w-full admin-btn-enhanced primary justify-between group" asChild>
                  <Link href="/admin/challenges/new" className="inline-flex items-center">
                    <span className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5" />
                  Créer un nouveau défi
                    </span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
                
                <Button className="w-full admin-btn-enhanced secondary justify-between group" asChild>
                  <Link href="/admin/users" className="inline-flex items-center">
                    <span className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                  Gérer les utilisateurs
                    </span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                
                <Button className="w-full admin-btn-enhanced secondary justify-between group" asChild>
                  <Link href="/admin/submissions" className="inline-flex items-center">
                    <span className="flex items-center">
                      <Check className="mr-2 h-5 w-5" />
                      Évaluer les soumissions
                    </span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
                
                <Button className="w-full admin-btn-enhanced secondary justify-between group" asChild>
                  <Link href="/admin/badges/new" className="inline-flex items-center">
                    <span className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Créer un badge
                    </span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mt-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                    <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Vérifier les performances</h4>
                    <p className="text-xs text-muted-foreground mt-1">Consultez les statistiques détaillées pour optimiser votre plateforme</p>
                    <Button size="sm" variant="link" className="h-8 p-0 mt-1" asChild>
                      <Link href="/admin/health">Voir les statistiques</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques avancées */}
        <div 
          className="animate-fadeIn"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-primary" />
            Statistiques Utilisateurs et Défis
          </h2>
          <Tabs defaultValue="challenges" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="challenges" className="admin-tab-enhanced">Défis</TabsTrigger>
              <TabsTrigger value="users" className="admin-tab-enhanced">Utilisateurs</TabsTrigger>
              <TabsTrigger value="submissions" className="admin-tab-enhanced">Soumissions</TabsTrigger>
            </TabsList>
            <TabsContent value="challenges" className="space-y-4">
              <div className="admin-card-enhanced p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <PieChart className="mr-2 h-5 w-5 text-primary" />
                      Répartition des défis par catégorie
                    </h3>
                    <div className="aspect-square flex items-center justify-center">
                      <PieChart className="h-40 w-40 text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-primary" />
                      Top défis
                    </h3>
                    {[1, 2, 3].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <Trophy className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">API REST avec Node.js</p>
                            <p className="text-xs text-muted-foreground">32 participants</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Actif</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="users">
              <div className="admin-card-enhanced p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Répartition des utilisateurs
                    </h3>
                    <div className="aspect-square flex items-center justify-center">
                      <PieChart className="h-40 w-40 text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      Activité récente
                    </h3>
                    {[1, 2, 3].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">Jean Dupont</p>
                            <p className="text-xs text-muted-foreground">A soumis un nouveau défi</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Nouveau</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="submissions">
              <div className="admin-card-enhanced p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Star className="mr-2 h-5 w-5 text-primary" />
                      Qualité des soumissions
                    </h3>
                    <div className="aspect-square flex items-center justify-center">
                      <BarChart className="h-40 w-40 text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Check className="mr-2 h-5 w-5 text-primary" />
                      À évaluer
                    </h3>
                    {[1, 2, 3].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 p-2 rounded-md">
                            <Check className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Interface utilisateur React</p>
                            <p className="text-xs text-muted-foreground">Soumis par Marie Lambert</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">En attente</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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