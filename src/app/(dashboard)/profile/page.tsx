import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Award } from "lucide-react";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { EmailVerificationStatus } from "@/components/profile/email-verification-status";

export const metadata: Metadata = {
  title: "Profil | LPT Défis",
  description: "Gérez votre profil utilisateur",
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

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: session.user?.name || "",
    email: session.user?.email || "",
    bio: "",
    image: session.user?.image || ""
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profil Utilisateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col items-center">
              <AvatarUpload 
                currentImage={user.image}
                onUpload={uploadAvatar}
              />
              <h2 className="mt-4 text-xl font-semibold">{session.user?.name || "Utilisateur"}</h2>
              <p className="text-gray-600">{session.user?.email}</p>
              
              <div className="mt-4 flex items-center text-gray-600">
                <Award className="h-5 w-5 mr-2" />
                <span>Points: 150</span>
              </div>
              
              <div className="mt-2 flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Membre depuis: Janvier 2023</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <EmailVerificationStatus />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <EditProfileForm 
              user={user}
              onSubmit={updateProfile}
            />
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">Défis complétés</h3>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">Défis en cours</h3>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">Badges obtenus</h3>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-700">Classement</h3>
                <p className="text-2xl font-bold">#42</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 