import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";
import UserList from "@/components/admin/user-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, RefreshCw, UserPlus, BadgeCheck, UserMinus, Filter, SortAsc, SortDesc } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs | Administration",
  description: "Gérer les utilisateurs de la plateforme",
};

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  try {
    const { users, total } = await AdminService.getUsers();

    // Statistiques des utilisateurs par rôle
    const admins = users.filter(user => user.role === "ADMIN").length;
    const participants = users.filter(user => user.role === "USER").length;
    const inactive = users.filter(user => !user.isActive).length;
    const verified = users.filter(user => user.emailVerified).length;
    const unverified = users.length - verified;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 admin-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">
              Gérez les utilisateurs et leurs rôles sur la plateforme
            </p>
          </div>
          <Button className="admin-btn-enhanced primary" asChild>
            <a href="/admin/users/invite" className="inline-flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </a>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 admin-fade-in-up admin-delay-1">
          <Card className="admin-stat-card-enhanced">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisateurs enregistrés
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stat-card-enhanced">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{admins}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisateurs avec rôle admin
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 text-white shadow-md">
                  <BadgeCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stat-card-enhanced">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{participants}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisateurs standards
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-400 text-white shadow-md">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stat-card-enhanced">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Non Vérifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{unverified}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email non confirmé
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 text-white shadow-md">
                  <UserMinus className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-stat-card-enhanced">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{inactive}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comptes désactivés
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md">
                  <UserMinus className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="admin-fade-in-up admin-delay-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <TabsList>
              <TabsTrigger value="all" className="relative">
                Tous
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{users.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="admin" className="relative">
                Admins
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{admins}</Badge>
              </TabsTrigger>
              <TabsTrigger value="user" className="relative">
                Participants
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{participants}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="relative">
                Inactifs
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{inactive}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-9 w-full md:w-[250px] h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrer</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <SortAsc className="h-4 w-4" />
                <span className="hidden sm:inline">Trier</span>
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="p-0 mt-0">
            <Card className="admin-card-enhanced border-none shadow-none">
              <CardContent className="p-0">
                <UserList users={users} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin" className="p-0 mt-0">
            <Card className="admin-card-enhanced border-none shadow-none">
              <CardContent className="p-0">
                <UserList users={users.filter(user => user.role === "ADMIN")} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user" className="p-0 mt-0">
            <Card className="admin-card-enhanced border-none shadow-none">
              <CardContent className="p-0">
                <UserList users={users.filter(user => user.role === "USER")} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inactive" className="p-0 mt-0">
            <Card className="admin-card-enhanced border-none shadow-none">
              <CardContent className="p-0">
                <UserList users={users.filter(user => !user.isActive)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement des utilisateurs. Veuillez réessayer plus tard.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }
} 