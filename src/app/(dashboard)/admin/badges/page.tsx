import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BadgeForm } from "@/components/admin/badge-form";
import { BadgeList } from "@/components/admin/badge-list";

export default async function BadgesAdminPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const badges = await db.badge.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Badges</h1>
        <p className="text-muted-foreground">
          Créez et gérez les badges que les utilisateurs peuvent obtenir
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Créer un badge</h2>
              <BadgeForm />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Badges existants</h2>
              <BadgeList badges={badges} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 