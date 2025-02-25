import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Gestion des Catégories",
  description: "Interface de gestion des catégories",
};

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Nouvelle Catégorie
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Liste des Catégories</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Chargement des catégories...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 