import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

export default async function TutorialsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tutoriels</h1>
        <p className="text-muted-foreground">
          Ressources d'apprentissage et guides
        </p>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Commencer ici</h2>
              <p className="text-sm text-muted-foreground">
                Apprenez à utiliser la plateforme et à participer aux défis
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Les tutoriels seront bientôt disponibles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 