import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Award } from "lucide-react";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";

export const metadata: Metadata = {
  title: "Profil | LPT Défis",
  description: "Gérez votre profil utilisateur",
};

async function updateProfile(data: FormData) {
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

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Informations de base */}
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-6">
              <AvatarUpload
                currentImage={session.user.image}
                onUpload={uploadAvatar}
              />

              <EditProfileForm
                user={session.user}
                onSubmit={updateProfile}
              />
            </div>
          </div>
        </div>

        {/* Statistiques et badges */}
        <div className="space-y-8">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Points totaux</span>
                  <span className="text-sm">150</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Défis complétés</span>
                  <span className="text-sm">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Niveau actuel</span>
                  <span className="text-sm">2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Badges</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs mt-2">Débutant</span>
                </div>
                {/* Ajouter d'autres badges ici */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 