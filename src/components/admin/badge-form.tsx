"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Loader2 } from "lucide-react";

const badgeSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  image: z.string().url("L'URL de l'image doit être valide"),
  condition: z.string().min(10, "La condition doit être décrite en détail"),
  points: z.number().min(0, "Les points doivent être positifs"),
});

type BadgeFormData = z.infer<typeof badgeSchema>;

interface BadgeFormProps {
  badge?: {
    id: string;
    name: string;
    description: string;
    image: string;
    condition: string;
    points: number;
  };
}

export function BadgeForm({ badge }: BadgeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: badge || {
      points: 0,
    },
  });

  const onSubmit = async (data: BadgeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/badges" + (badge ? `/${badge.id}` : ""), {
        method: badge ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Une erreur est survenue");
      }

      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la création du badge");
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
          <label htmlFor="name" className="block text-sm font-medium">
            Nom du badge
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium">
            URL de l'image
          </label>
          <input
            {...register("image")}
            id="image"
            type="url"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium">
            Condition d'obtention
          </label>
          <textarea
            {...register("condition")}
            id="condition"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.condition && (
            <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="points" className="block text-sm font-medium">
            Points
          </label>
          <input
            {...register("points", { valueAsNumber: true })}
            id="points"
            type="number"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.points && (
            <p className="mt-1 text-sm text-red-600">{errors.points.message}</p>
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
            {badge ? "Mise à jour..." : "Création..."}
          </>
        ) : (
          badge ? "Mettre à jour le badge" : "Créer le badge"
        )}
      </button>
    </form>
  );
} 