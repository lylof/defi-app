"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: {
    name: string | null;
    email: string | null;
    bio?: string | null;
    image?: string | null;
  };
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export function EditProfileForm({ user, onSubmit }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
    },
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nom
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
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            {...register("bio")}
            id="bio"
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
      </button>
    </form>
  );
} 