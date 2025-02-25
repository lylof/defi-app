import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";
import { ActivityLogs } from "@/components/admin/activity-logs";

export const metadata: Metadata = {
  title: "Logs d'activité | Administration",
  description: "Historique des actions d'administration",
};

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  try {
    const { logs, total } = await AdminService.getLogs();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Logs d'activité</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <ActivityLogs initialLogs={logs} totalLogs={total} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des logs:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Logs d'activité</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Une erreur est survenue lors du chargement des logs. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
} 