"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink, Check, X, ListChecks } from "lucide-react";
import { DetailedEvaluationForm } from "./detailed-evaluation-form";

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface Challenge {
  title: string;
  points: number;
  evaluationCriteria: EvaluationCriterion[];
}

interface Submission {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  challenge: Challenge;
  submission: string;
  updatedAt: Date;
}

interface SubmissionListProps {
  submissions: Submission[];
}

export function SubmissionList({ submissions }: SubmissionListProps) {
  const router = useRouter();
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [detailedEvaluation, setDetailedEvaluation] = useState<{
    submissionId: string;
    criteria: EvaluationCriterion[];
  } | null>(null);

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

  const openDetailedEvaluation = (submissionId: string, criteria: EvaluationCriterion[]) => {
    setDetailedEvaluation({ submissionId, criteria });
  };

  const closeDetailedEvaluation = () => {
    setDetailedEvaluation(null);
    router.refresh();
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

  if (detailedEvaluation) {
    return (
      <DetailedEvaluationForm
        submissionId={detailedEvaluation.submissionId}
        criteria={detailedEvaluation.criteria}
        onCancel={closeDetailedEvaluation}
      />
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => {
        const submissionData = JSON.parse(submission.submission);
        const hasCriteria = submission.challenge.evaluationCriteria && submission.challenge.evaluationCriteria.length > 0;

        return (
          <div key={submission.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {submission.challenge.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Soumis par {submission.user.name || submission.user.email} le{" "}
                    {new Date(submission.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {submission.challenge.points} points
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Description de la solution</h4>
                <p className="text-gray-700">{submissionData.description}</p>

                {submissionData.repositoryUrl && (
                  <div className="mt-2">
                    <Link
                      href={submissionData.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Voir le dépôt
                    </Link>
                  </div>
                )}

                {submissionData.files && submissionData.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Fichiers joints</h4>
                    <ul className="space-y-1">
                      {submissionData.files.map((file: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{file}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                <button
                  onClick={() => handleEvaluation(submission.id, false)}
                  disabled={evaluating === submission.id}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Refuser
                </button>
                {hasCriteria && (
                  <button
                    onClick={() => openDetailedEvaluation(submission.id, submission.challenge.evaluationCriteria)}
                    disabled={evaluating === submission.id}
                    className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Évaluation détaillée
                  </button>
                )}
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
        );
      })}
    </div>
  );
} 