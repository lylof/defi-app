import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";
import { UserList } from "@/components/admin/user-list";

export const metadata: Metadata = {
  title: "Gestion des utilisateurs | Administration",
  description: "Interface d'administration des utilisateurs",
};

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  try {
    const { users, total } = await AdminService.getUsers();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <UserList initialUsers={users} totalUsers={total} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement des utilisateurs. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
} 