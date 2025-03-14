import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Award, Shield, Activity } from "lucide-react";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { EmailVerificationStatus } from "@/components/profile/email-verification-status";
import { UserStatsDashboard } from "@/components/profile/user-stats-dashboard";
import { AdminStatsPanel } from "@/components/admin/admin-stats-panel";
import { UserStatsService } from "@/lib/user/user-stats-service";
import { AdminService } from "@/lib/admin/admin-service";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profil Administrateur | LPT Défis",
  description: "Gérez votre profil administrateur et accédez aux fonctionnalités avancées de la plateforme LPT Défis",
};

/**
 * Fonction serveur pour mettre à jour le profil
 * @param data Données du profil à mettre à jour
 */
async function updateProfile(data: any) {
  "use server";
  
  const response = await fetch("/api/profile/update", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour du profil");
  }

  return response.json();
}

/**
 * Fonction serveur pour télécharger un avatar
 * @param file Fichier image de l'avatar
 */
async function uploadAvatar(file: File) {
  "use server";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/profile/avatar", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload de l'avatar");
  }

  return response.json();
}

/**
 * Page de profil spécifique pour les administrateurs
 * Affiche les informations personnelles ainsi que des statistiques et outils d'administration
 */
export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/profile");
  }

  // Vérification supplémentaire du rôle administrateur
  if (session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  try {
    // Extension typée des données de l'utilisateur pour accéder aux propriétés spécifiques
    const user = session.user as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      bio?: string | null;
      emailVerified?: Date | null;
    };

    // Récupération des statistiques utilisateur
    const userStats = await UserStatsService.getUserStats(user.id);
    
    // Récupération des dernières activités administratives
    const { logs } = await AdminService.getLogs(1, 5);
    
    // Récupération des statistiques d'administration
    const adminStatistics = await AdminService.getAdminStats();
    
    // Conversion des statistiques utilisateur au format attendu par le composant
    const dashboardStats = {
      points: userStats.points,
      level: userStats.level,
      experience: userStats.experience,
      nextLevelAt: userStats.nextLevelAt,
      rank: userStats.rank,
      totalParticipants: userStats.totalParticipants,
      challengesCompleted: userStats.challengesCompleted,
      challengesInProgress: userStats.challengesInProgress,
      badgesCount: userStats.badgesCount,
      successRate: userStats.successRate,
      memberSince: userStats.memberSince
    };
    
    // Statistiques pour le panel d'administration
    const adminStats = {
      totalUsers: adminStatistics.totalUsers,
      totalSubmissions: adminStatistics.totalSubmissions,
      pendingSubmissions: adminStatistics.pendingSubmissions,
      activeChallenges: adminStatistics.activeChallenges,
      lastLogin: user.emailVerified?.toISOString(),
      lastAction: logs.length > 0 ? `${logs[0].action} - ${new Date(logs[0].createdAt).toLocaleString()}` : undefined
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profil Administrateur</h1>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md">
              Administrateur
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et votre identité sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 mb-6">
                <AvatarUpload 
                  currentImage={user.image || null} 
                  onUpload={uploadAvatar}
                />
                <div className="text-center">
                  <p className="text-lg font-semibold">{user.name || "Administrateur"}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <EmailVerificationStatus />
              </div>

              <EditProfileForm 
                user={{
                  name: user.name || "",
                  email: user.email || "",
                  bio: user.bio || "",
                  image: user.image || ""
                }}
                onSubmit={updateProfile}
              />
            </CardContent>
          </Card>

          {/* Activités administratives récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Activités administratives récentes</CardTitle>
              <CardDescription>
                Vos dernières actions en tant qu'administrateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length > 0 ? (
                  <ul className="space-y-2">
                    {logs.map((log) => (
                      <li key={log.id} className="flex items-start gap-2 text-sm border-b pb-2">
                        <Activity className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                          <p className="text-xs">{log.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                )}

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/logs">
                    Voir toutes les activités
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques et tableau de bord */}
        <UserStatsDashboard stats={dashboardStats} />

        {/* Panel d'administration spécifique */}
        <AdminStatsPanel adminStats={adminStats} />

        {/* Accès rapide administration */}
        <Card>
          <CardHeader>
            <CardTitle>Accès rapide administration</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités d'administration les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Link href="/admin/users">
                  <User className="h-5 w-5" />
                  <span>Gestion Utilisateurs</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Link href="/admin/submissions">
                  <Award className="h-5 w-5" />
                  <span>Évaluation</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Link href="/admin/challenges">
                  <Activity className="h-5 w-5" />
                  <span>Gestion Défis</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Erreur de chargement du profil administrateur:", error);
    
    // Message d'erreur adapté à partir de l'exception
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Impossible de charger les données du profil. Veuillez réessayer plus tard.";
      
    return (
      <ErrorAlert
        title="Erreur de chargement"
        message={errorMessage}
        variant="default"
      />
    );
  }
} 