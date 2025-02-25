import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SubmissionForm } from "@/components/challenges/submission-form";

export const metadata: Metadata = {
  title: "Soumettre une solution | LPT Défis",
  description: "Soumettez votre solution au défi",
};

interface SubmitPageProps {
  params: {
    id: string;
  };
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const challenge = await db.challenge.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      participations: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
    },
  });

  if (!challenge) {
    redirect("/challenges");
  }

  // Vérifier si le défi est toujours actif
  const now = new Date();
  if (now < challenge.startDate || now > challenge.endDate) {
    redirect(`/challenges/${params.id}?error=expired`);
  }

  // Vérifier si l'utilisateur participe déjà
  const hasParticipated = challenge.participations.length > 0;
  if (!hasParticipated) {
    redirect(`/challenges/${params.id}?error=not-participating`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Soumettre une solution
        </h1>
        <p className="text-muted-foreground">
          Soumettez votre solution pour le défi : {challenge.title}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <SubmissionForm challengeId={challenge.id} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="font-semibold mb-4">Instructions</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  1. Votre code doit être propre et bien commenté
                </p>
                <p>
                  2. Incluez un README si nécessaire
                </p>
                <p>
                  3. Respectez les contraintes du défi
                </p>
                <p>
                  4. Testez votre solution avant de la soumettre
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="font-semibold mb-4">Critères d'évaluation</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fonctionnalité</span>
                  <span>40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualité du code</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance</span>
                  <span>20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Documentation</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 