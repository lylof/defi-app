import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubmissionList } from "@/components/admin/submission-list";

export default async function SubmissionsPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Récupérer toutes les soumissions en attente
  const participations = await prisma.challengeParticipation.findMany({
    where: {
      submitted: true,
      evaluated: false, // Seulement les soumissions non évaluées
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
          evaluationCriteria: true, // Inclure les critères d'évaluation
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Transformer les participations en soumissions pour le composant SubmissionList
  const submissions = participations
    .filter(p => p.submission !== null) // Filtrer les participations sans soumission
    .map(p => ({
      id: p.id,
      user: p.user,
      challenge: p.challenge,
      submission: p.submission as string, // Cast pour assurer que ce n'est pas null
      updatedAt: p.updatedAt,
    }));

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