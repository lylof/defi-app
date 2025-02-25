"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const challengeSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  points: z.coerce.number().min(1, "Le nombre de points doit être supérieur à 0"),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

interface ChallengeFormProps {
  categories: Category[];
  challenge?: ChallengeFormValues;
}

export function ChallengeForm({ categories, challenge }: ChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: challenge || {
      title: "",
      description: "",
      categoryId: "",
      points: 1,
    },
  });

  async function onSubmit(data: ChallengeFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création du défi");
      }

      toast.success("Défi créé avec succès");
      
      router.push("/admin/challenges");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la création du défi:", error);
      toast.error(error instanceof Error ? error.message : "Impossible de créer le défi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre du défi" {...field} />
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
                  placeholder="Description détaillée du défi"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input 
                  type="number" 
                  min={1}
                  placeholder="Nombre de points" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer le défi"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 