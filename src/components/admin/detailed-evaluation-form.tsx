"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import React from "react";

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface DetailedEvaluationFormProps {
  submissionId: string;
  criteria: EvaluationCriterion[];
  onCancel: () => void;
}

export function DetailedEvaluationForm({
  submissionId,
  criteria,
  onCancel
}: DetailedEvaluationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Array<{
    criterionId: string;
    score: number;
    comment: string;
  }>>(
    criteria.map(criterion => ({
      criterionId: criterion.id,
      score: 5, // Score par défaut (milieu de l'échelle)
      comment: ""
    }))
  );
  const [approvalThreshold, setApprovalThreshold] = useState(60); // Seuil d'approbation par défaut (60%)

  // Mettre à jour le score d'un critère
  const updateScore = (criterionId: string, score: number) => {
    setEvaluations(prev =>
      prev.map(evaluation =>
        evaluation.criterionId === criterionId ? { ...evaluation, score } : evaluation
      )
    );
  };

  // Mettre à jour le commentaire d'un critère
  const updateComment = (criterionId: string, comment: string) => {
    setEvaluations(prev =>
      prev.map(evaluation =>
        evaluation.criterionId === criterionId ? { ...evaluation, comment } : evaluation
      )
    );
  };

  // Calculer le score total et le score maximum possible
  const calculateScores = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    evaluations.forEach(evaluation => {
      const criterion = criteria.find(c => c.id === evaluation.criterionId);
      if (criterion) {
        totalScore += evaluation.score * criterion.weight;
        maxPossibleScore += 10 * criterion.weight; // 10 est le score maximum pour chaque critère
      }
    });

    const scorePercentage = maxPossibleScore > 0 
      ? (totalScore / maxPossibleScore) * 100 
      : 0;

    return {
      totalScore,
      maxPossibleScore,
      scorePercentage: Math.round(scorePercentage)
    };
  };

  const { totalScore, maxPossibleScore, scorePercentage } = calculateScores();
  const isApproved = scorePercentage >= approvalThreshold;

  // Soumettre l'évaluation
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/admin/submissions/${submissionId}/evaluate-detailed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          criteriaEvaluations: evaluations,
          approvalThreshold
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur est survenue lors de l'évaluation");
      }

      router.refresh();
      onCancel(); // Fermer le formulaire après soumission réussie
    } catch (error) {
      console.error("Erreur lors de l'évaluation:", error);
      setError((error as Error).message || "Une erreur est survenue lors de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Évaluation détaillée</h2>
        <button aria-label="Fermer"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seuil d'approbation (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={approvalThreshold}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApprovalThreshold(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-500 mt-1">
          Le pourcentage minimum requis pour approuver la soumission
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {criteria.map((criterion) => {
          const evaluation = evaluations.find(e => e.criterionId === criterion.id);
          if (!evaluation) return null;

          return (
            <div key={criterion.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{criterion.name}</h3>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Poids: {criterion.weight}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-10)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={evaluation.score}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateScore(criterion.id, Number(e.target.value))}
                    className="w-full mr-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-lg font-semibold min-w-[2rem] text-center">
                    {evaluation.score}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  value={evaluation.comment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateComment(criterion.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={2}
                  placeholder="Commentaire optionnel sur ce critère"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Résumé de l'évaluation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Score total:</p>
            <p className="font-semibold">{totalScore} / {maxPossibleScore}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pourcentage:</p>
            <p className="font-semibold">{scorePercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Seuil d'approbation:</p>
            <p className="font-semibold">{approvalThreshold}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Résultat:</p>
            <p className={`font-semibold ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
              {isApproved ? 'Approuvé' : 'Refusé'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Évaluation en cours...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Soumettre l'évaluation
            </>
          )}
        </button>
      </div>
    </div>
  );
} 