"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink, Check, X } from "lucide-react";

interface Submission {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  challenge: {
    title: string;
    points: number;
  };
  submission: string;
  updatedAt: Date;
}

interface SubmissionListProps {
  submissions: Submission[];
}

export function SubmissionList({ submissions }: SubmissionListProps) {
  const router = useRouter();
  const [evaluating, setEvaluating] = useState<string | null>(null);

  const handleEvaluation = async (submissionId: string, approved: boolean) => {
    try {
      setEvaluating(submissionId);

      const response = await fetch(`/api/admin/submissions/${submissionId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'évaluation");
      }

      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de l'évaluation");
    } finally {
      setEvaluating(null);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucune soumission en attente d'évaluation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => {
        const submissionData = JSON.parse(submission.submission);
        return (
          <div
            key={submission.id}
            className="rounded-lg border shadow-sm"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {submission.challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Soumis par {submission.user.name || submission.user.email}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(submission.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {submissionData.description}
                  </p>
                </div>

                {submissionData.repositoryUrl && (
                  <div>
                    <h4 className="text-sm font-medium">Dépôt</h4>
                    <a
                      href={submissionData.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {submissionData.repositoryUrl}
                    </a>
                  </div>
                )}

                {submissionData.files?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Fichiers</h4>
                    <div className="mt-1 space-y-1">
                      {submissionData.files.map((file: any) => (
                        <a
                          key={file.path}
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-4">
                  <button
                    onClick={() => handleEvaluation(submission.id, false)}
                    disabled={evaluating === submission.id}
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </button>
                  <button
                    onClick={() => handleEvaluation(submission.id, true)}
                    disabled={evaluating === submission.id}
                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approuver
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 