import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SubmissionList } from "@/components/admin/submission-list";

export default async function SubmissionsPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Récupérer toutes les soumissions en attente
  const submissions = await db.challengeParticipation.findMany({
    where: {
      submitted: true,
      // Ajouter d'autres filtres si nécessaire
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      challenge: {
        select: {
          title: true,
          points: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Évaluation des soumissions
        </h1>
        <p className="text-muted-foreground">
          Évaluez les solutions soumises par les participants
        </p>
      </div>

      <SubmissionList submissions={submissions} />
    </div>
  );
} 