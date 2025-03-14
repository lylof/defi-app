"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation pour le badge
const badgeSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(500, "La description ne peut pas dépasser 500 caractères"),
  image: z.string().url("L'URL de l'image n'est pas valide").optional().or(z.literal("")),
  points: z.coerce.number().int("Les points doivent être un nombre entier").min(0, "Les points ne peuvent pas être négatifs"),
  condition: z.string().min(5, "La condition doit contenir au moins 5 caractères").max(1000, "La condition ne peut pas dépasser 1000 caractères"),
});

type BadgeFormValues = z.infer<typeof badgeSchema>;

interface BadgeFormProps {
  badge?: {
    id: string;
    name: string;
    description: string;
    image: string | null;
    points: number;
    condition: string;
  };
}

export function BadgeForm({ badge }: BadgeFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: badge?.name || "",
      description: badge?.description || "",
      image: badge?.image || "",
      points: badge?.points || 0,
      condition: badge?.condition || "",
    },
  });

  // Fonction de soumission du formulaire
  async function onSubmit(values: BadgeFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(badge ? `/api/badges/${badge.id}` : "/api/badges", {
        method: badge ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue");
      }

      toast.success(badge ? "Badge mis à jour avec succès" : "Badge créé avec succès");
      router.push("/admin/badges");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du badge</FormLabel>
              <FormControl>
                <Input placeholder="Nom du badge" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description du badge"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l&apos;image (optionnelle)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition d&apos;obtention</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Condition d&apos;obtention du badge (ex: Compléter 5 défis)"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/badges")}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : badge ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 