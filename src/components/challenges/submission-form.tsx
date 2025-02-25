"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Loader2 } from "lucide-react";
import { useBadgeCheck } from "@/hooks/use-badge-check";
import { toast } from "sonner";

const submissionSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  repositoryUrl: z.string().url("L'URL doit être valide").optional(),
  files: z.array(z.instanceof(File)).optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
  challengeId: string;
}

export function SubmissionForm({ challengeId }: SubmissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkBadges } = useBadgeCheck();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  });

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("description", data.description);
      if (data.repositoryUrl) {
        formData.append("repositoryUrl", data.repositoryUrl);
      }
      if (data.files) {
        Array.from(data.files).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Une erreur est survenue");
      }

      await checkBadges();
      
      toast.success("Votre solution a été soumise avec succès !");
      router.push(`/challenges/${challengeId}?submitted=true`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la soumission");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description de votre solution
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            placeholder="Expliquez votre approche et les choix techniques..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="repositoryUrl" className="block text-sm font-medium">
            URL du dépôt (optionnel)
          </label>
          <input
            {...register("repositoryUrl")}
            id="repositoryUrl"
            type="url"
            placeholder="https://github.com/username/repo"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.repositoryUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.repositoryUrl.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="files" className="block text-sm font-medium">
            Fichiers (optionnel)
          </label>
          <div className="mt-1">
            <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="files"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                  >
                    <span>Téléverser des fichiers</span>
                    <input
                      {...register("files")}
                      id="files"
                      type="file"
                      multiple
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  ZIP, RAR jusqu'à 10MB
                </p>
              </div>
            </div>
          </div>
          {errors.files && (
            <p className="mt-1 text-sm text-red-600">{errors.files.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Soumission en cours...
          </>
        ) : (
          "Soumettre la solution"
        )}
      </button>
    </form>
  );
} 