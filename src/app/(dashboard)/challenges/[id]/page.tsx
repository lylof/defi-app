import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { Trophy, Clock, Tag, Users, FileText } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ParticipateButton } from "@/components/challenges/participate-button";

interface ChallengePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const challenge = await db.challenge.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!challenge) {
    return {
      title: "Défi non trouvé | LPT Défis",
      description: "Le défi demandé n'existe pas",
    };
  }

  return {
    title: `${challenge.title} | LPT Défis`,
    description: challenge.description,
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const challenge = await db.challenge.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      files: true,
      _count: {
        select: {
          participations: true,
        },
      },
      participations: {
        where: {
          userId: session.user.id,
        },
        take: 1,
      },
    },
  });

  if (!challenge) {
    notFound();
  }

  const hasParticipated = challenge.participations.length > 0;
  const isActive = new Date() >= challenge.startDate && new Date() <= challenge.endDate;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/challenges" className="hover:underline">
            Défis
          </Link>
          <span>/</span>
          <span>{challenge.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold">{challenge.points} points</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{challenge.category.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{challenge._count.participations} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Jusqu'au{" "}
              {new Date(challenge.endDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{challenge.description}</p>
              </div>
            </div>
          </div>

          {/* Brief */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Brief</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{challenge.brief}</p>
              </div>
            </div>
          </div>

          {/* Ressources */}
          {challenge.files.length > 0 && (
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ressources</h2>
                <div className="space-y-2">
                  {challenge.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="font-semibold mb-4">Statut</h2>
              {hasParticipated ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-green-600 font-medium">
                      Vous participez à ce défi
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Vous pouvez soumettre votre solution jusqu'au{" "}
                      {new Date(challenge.endDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/challenges/${challenge.id}/submit`}
                    className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Soumettre une solution
                  </Link>
                </div>
              ) : isActive ? (
                <div>
                  <ParticipateButton challengeId={challenge.id} />
                  <p className="text-sm text-muted-foreground mt-2">
                    En participant, vous vous engagez à respecter les règles du défi
                  </p>
                </div>
              ) : (
                <p className="text-sm text-yellow-600">
                  Ce défi n'est plus disponible
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="font-semibold mb-4">Dates importantes</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Début</p>
                  <p className="text-muted-foreground">
                    {new Date(challenge.startDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Fin</p>
                  <p className="text-muted-foreground">
                    {new Date(challenge.endDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 