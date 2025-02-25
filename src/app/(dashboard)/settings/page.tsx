import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Settings, Bell, Shield, Moon } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos paramètres et préférences
        </p>
      </div>

      <div className="grid gap-8">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez vos préférences de notifications
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Les paramètres de notification seront bientôt disponibles.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Sécurité</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez vos paramètres de sécurité
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Les paramètres de sécurité seront bientôt disponibles.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Moon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Apparence</h2>
                <p className="text-sm text-muted-foreground">
                  Personnalisez l'apparence de l'application
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Les paramètres d'apparence seront bientôt disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 