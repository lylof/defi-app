import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
        <p className="text-muted-foreground">
          Votre historique d'activités et de participations
        </p>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Aucune activité récente à afficher pour le moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 