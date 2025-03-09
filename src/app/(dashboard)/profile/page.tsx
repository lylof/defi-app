import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Award } from "lucide-react";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { EmailVerificationStatus } from "@/components/profile/email-verification-status";
import { UserStatsDashboard } from "@/components/profile/user-stats-dashboard";
import { UserStatsService } from "@/lib/user/user-stats-service";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profil Utilisateur | LPT Défis",
  description: "Gérez votre profil et consultez vos statistiques personnelles sur la plateforme LPT Défis",
};

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

export default async function ProfilePage() {
  const session = await getServerSession();

  // Vérifier si l'utilisateur est connecté
  if (!session?.user) {
    return (
      <div className="container py-10">
        <ErrorAlert 
          title="Authentification requise" 
          message="Vous devez être connecté pour accéder à cette page."
        >
          <div className="mt-4 flex space-x-4">
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </ErrorAlert>
      </div>
    );
  }

  // Vérifier si l'ID utilisateur est disponible
  if (!session.user.id) {
    return (
      <div className="container py-10">
        <ErrorAlert 
          title="Erreur d'authentification" 
          message="Impossible de récupérer votre identifiant utilisateur. Veuillez vous reconnecter."
        >
          <div className="mt-4 flex space-x-4">
            <Button asChild>
              <Link href="/logout">Se reconnecter</Link>
            </Button>
          </div>
        </ErrorAlert>
      </div>
    );
  }

  try {
    const userId = session.user.id;
    
    // Récupérer les statistiques utilisateur et les défis récents
    const [userStats, recentChallenges] = await Promise.allSettled([
      UserStatsService.getUserStats(userId),
      UserStatsService.getRecentChallenges(userId, 5)
    ]);

    // Traiter les résultats des promesses
    const stats = userStats.status === 'fulfilled' ? userStats.value : null;
    const challenges = recentChallenges.status === 'fulfilled' ? recentChallenges.value : [];

    return (
      <div className="container py-8">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Votre Profil</CardTitle>
              <CardDescription>
                Bienvenue {session.user.name || 'Participant'}. Voici vos informations et statistiques personnelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <UserStatsDashboard 
                  stats={stats} 
                  recentChallenges={challenges} 
                />
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-700">
                    Impossible de charger vos statistiques pour le moment. Veuillez réessayer ultérieurement.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
    
    return (
      <div className="container py-10">
        <ErrorAlert 
          title="Erreur de chargement" 
          message="Une erreur est survenue lors du chargement de votre profil. Veuillez réessayer ultérieurement."
        >
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </ErrorAlert>
      </div>
    );
  }
} 