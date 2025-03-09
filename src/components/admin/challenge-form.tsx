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
  FormDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// Enhanced schema with additional fields
const challengeSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  points: z.coerce.number().min(1, "Le nombre de points doit être supérieur à 0"),
  startDate: z.date({
    required_error: "Veuillez sélectionner une date de début",
  }),
  endDate: z.date({
    required_error: "Veuillez sélectionner une date de fin",
  }),
  // New fields
  brief: z.string().max(150, "Le résumé ne doit pas dépasser 150 caractères").optional(),
  isPublished: z.boolean().default(false),
  allowMultipleSubmissions: z.boolean().default(false),
  maxSubmissions: z.coerce.number().min(1).optional(),
  evaluationCriteria: z.array(
    z.object({
      name: z.string().min(1, "Le nom du critère est requis"),
      description: z.string().min(1, "La description du critère est requise"),
      weight: z.coerce.number().min(1, "Le poids doit être supérieur à 0"),
    })
  ).optional(),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

interface ChallengeFormProps {
  categories: Category[];
  challenge?: Partial<ChallengeFormValues>;
}

export function ChallengeForm({ categories, challenge }: ChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [criteria, setCriteria] = useState<Array<{ name: string; description: string; weight: number }>>(
    challenge?.evaluationCriteria || []
  );

  // Set default dates if not provided
  const now = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(now.getDate() + 30); // Default 30 days from now

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: challenge?.title || "",
      description: challenge?.description || "",
      categoryId: challenge?.categoryId || "",
      points: challenge?.points || 1,
      startDate: challenge?.startDate || now,
      endDate: challenge?.endDate || defaultEndDate,
      brief: challenge?.brief || "",
      isPublished: challenge?.isPublished || false,
      allowMultipleSubmissions: challenge?.allowMultipleSubmissions || false,
      maxSubmissions: challenge?.maxSubmissions || 1,
      evaluationCriteria: challenge?.evaluationCriteria || [],
    },
  });

  // Add a new evaluation criterion
  const addCriterion = () => {
    setCriteria([...criteria, { name: "", description: "", weight: 1 }]);
  };

  // Remove an evaluation criterion
  const removeCriterion = (index: number) => {
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);
  };

  // Update an evaluation criterion
  const updateCriterion = (index: number, field: string, value: string | number) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  async function onSubmit(data: ChallengeFormValues) {
    try {
      setIsLoading(true);
      
      // Add criteria to the form data
      const formData = {
        ...data,
        evaluationCriteria: criteria,
        // Generate brief from description if not provided
        brief: data.brief || data.description.substring(0, 147) + "...",
      };

      const response = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        {/* Basic Information Section */}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold border-b pb-2">Informations de base</h2>
          
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
            name="brief"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Résumé</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Bref résumé du défi (max 150 caractères)" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Si laissé vide, un résumé sera généré automatiquement à partir de la description
                </FormDescription>
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
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        {/* Dates Section */}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold border-b pb-2">Dates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          return date < startDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold border-b pb-2">Paramètres</h2>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publier immédiatement</FormLabel>
                    <FormDescription>
                      Si désactivé, le défi sera enregistré comme brouillon
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowMultipleSubmissions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Autoriser plusieurs soumissions</FormLabel>
                    <FormDescription>
                      Permet aux participants de soumettre plusieurs fois
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("allowMultipleSubmissions") && (
              <FormField
                control={form.control}
                name="maxSubmissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre maximum de soumissions</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder="Nombre maximum de soumissions" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Laissez vide pour un nombre illimité
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Evaluation Criteria Section */}
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold">Critères d'évaluation</h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addCriterion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un critère
            </Button>
          </div>
          
          <div className="space-y-4">
            {criteria.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun critère d'évaluation défini. Ajoutez-en pour aider les participants à comprendre comment leur travail sera évalué.
              </p>
            ) : (
              criteria.map((criterion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Critère #{index + 1}</h3>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCriterion(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel htmlFor={`criterion-name-${index}`}>Nom</FormLabel>
                          <Input
                            id={`criterion-name-${index}`}
                            value={criterion.name}
                            onChange={(e) => updateCriterion(index, "name", e.target.value)}
                            placeholder="Ex: Lisibilité du code"
                          />
                        </div>
                        
                        <div>
                          <FormLabel htmlFor={`criterion-weight-${index}`}>Poids</FormLabel>
                          <Input
                            id={`criterion-weight-${index}`}
                            type="number"
                            min={1}
                            value={criterion.weight}
                            onChange={(e) => updateCriterion(index, "weight", parseInt(e.target.value))}
                            placeholder="Ex: 5"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel htmlFor={`criterion-description-${index}`}>Description</FormLabel>
                        <Textarea
                          id={`criterion-description-${index}`}
                          value={criterion.description}
                          onChange={(e) => updateCriterion(index, "description", e.target.value)}
                          placeholder="Décrivez ce critère d'évaluation"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

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