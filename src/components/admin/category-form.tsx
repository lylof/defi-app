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

// Schéma de validation pour la catégorie
const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function CategoryForm({ category }: CategoryFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  // Fonction de soumission du formulaire
  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(category ? `/api/categories/${category.id}` : "/api/categories", {
        method: category ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue");
      }

      toast.success(category ? "Catégorie mise à jour avec succès" : "Catégorie créée avec succès");
      router.push("/admin/categories");
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
              <FormLabel>Nom de la catégorie</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la catégorie" {...field} />
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
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de la catégorie"
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
            onClick={() => router.push("/admin/categories")}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : category ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 