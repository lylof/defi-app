import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { Trophy, Tag, Users, FileText } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { ParticipateButton } from "@/components/challenges/participate-button";
import { TimeRemaining } from "@/components/challenges/time-remaining";
import { DifficultyBadge } from "@/components/challenges/difficulty-badge";
import { SubmissionProgress } from "@/components/challenges/submission-progress";
import { Challenge, File, Category, Submission } from "@prisma/client";

interface ChallengePageProps {
  params: {
    id: string;
  };
}

// Définition des types pour la requête Prisma
type ChallengeWithRelations = Challenge & {
  category: Category;
  files: File[];
  _count: {
    participations: number;
  };
  participations: {
    id: string;
    userId: string;
    challengeId: string;
    submissions: Submission[];
  }[];
};

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  try {
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
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return {
      title: "Erreur | LPT Défis",
      description: "Une erreur est survenue lors du chargement de la page",
    };
  }
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
        include: {
          submissions: true,
        },
      },
    },
  }) as ChallengeWithRelations | null;

  if (!challenge) {
    notFound();
  }

  const hasParticipated = challenge.participations.length > 0;
  const isActive = new Date() >= challenge.startDate && new Date() <= challenge.endDate;
  
  // Nombre de soumissions actuel pour l'utilisateur
  const currentSubmissions = hasParticipated ? challenge.participations[0].submissions.length : 0;

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
            <DifficultyBadge points={challenge.points} />
            <div className="flex items-center gap-1 ml-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold">{challenge.points} points</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{challenge.category.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{challenge._count.participations} participants</span>
          </div>
          <TimeRemaining endDate={challenge.endDate} />
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
                  
                  {/* Progression des soumissions */}
                  {challenge.allowMultipleSubmissions && (
                    <SubmissionProgress 
                      currentSubmissions={currentSubmissions}
                      maxSubmissions={challenge.maxSubmissions}
                      className="mt-2 mb-4"
                    />
                  )}
                  
                  <Link
                    href={`/challenges/${challenge.id}/submit`}
                    className={`w-full inline-flex items-center justify-center rounded-md ${
                      challenge.allowMultipleSubmissions && challenge.maxSubmissions && currentSubmissions >= challenge.maxSubmissions
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    } px-4 py-2 text-sm font-medium text-white`}
                    {...(challenge.allowMultipleSubmissions && challenge.maxSubmissions && currentSubmissions >= challenge.maxSubmissions
                      ? { "aria-disabled": true, onClick: (e) => e.preventDefault() }
                      : {}
                    )}
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
          
          {/* Informations supplémentaires */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="font-semibold mb-4">Détails du défi</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Récompense</span>
                  <span className="font-medium">{challenge.points} points</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{challenge.category.name}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">{challenge._count.participations}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Soumissions multiples</span>
                  <span className="font-medium">
                    {challenge.allowMultipleSubmissions ? (
                      challenge.maxSubmissions ? `Oui (max. ${challenge.maxSubmissions})` : "Illimitées"
                    ) : (
                      "Non"
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 