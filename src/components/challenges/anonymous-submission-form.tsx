"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Loader2, Save, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AnonymousParticipationService } from "@/lib/services/anonymous-participation-service";
import { toast } from "sonner";

const submissionSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  repositoryUrl: z.string().url("L'URL doit être valide").optional().or(z.literal("")),
});

type AnonymousSubmissionFormData = z.infer<typeof submissionSchema>;

interface AnonymousSubmissionFormProps {
  challengeId: string;
}

/**
 * Formulaire de soumission pour les utilisateurs non connectés
 * Permet de sauvegarder localement la solution et la progression
 */
export function AnonymousSubmissionForm({ challengeId }: AnonymousSubmissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProgress, setSavedProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AnonymousSubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      description: "",
      repositoryUrl: "",
    },
  });

  // Surveiller les valeurs du formulaire pour auto-calcul de la progression
  const formValues = watch();

  // Calculer automatiquement la progression en fonction des champs remplis
  useEffect(() => {
    let progress = 0;
    
    if (formValues.description && formValues.description.length >= 10) {
      // La description vaut 70% de la progression
      progress += 70;
    } else if (formValues.description) {
      // Progression partielle basée sur la longueur
      progress += Math.min(70, formValues.description.length * 7);
    }
    
    if (formValues.repositoryUrl) {
      // L'URL du dépôt vaut 30% de la progression
      progress += 30;
    }
    
    setSavedProgress(progress);
  }, [formValues]);

  // Charger les données existantes au démarrage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const participation = AnonymousParticipationService.getParticipationData(challengeId);
      
      if (participation) {
        setValue("description", participation.description || "");
        setValue("repositoryUrl", participation.repositoryUrl || "");
        setSavedProgress(participation.progress);
      }
    }
  }, [challengeId, setValue]);

  // Fonction pour sauvegarder la progression sans soumettre
  const handleSaveProgress = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const result = AnonymousParticipationService.updateProgress(
        challengeId,
        savedProgress,
        {
          description: formValues.description,
          repositoryUrl: formValues.repositoryUrl || undefined,
        }
      );
      
      if (result) {
        toast.success("Votre progression a été sauvegardée localement");
      } else {
        toast.error("Impossible de sauvegarder la progression");
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la progression:", err);
      setError("Une erreur est survenue lors de la sauvegarde");
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: AnonymousSubmissionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Sauvegarder la soumission localement
      const result = AnonymousParticipationService.submitSolution(
        challengeId,
        {
          description: data.description,
          repositoryUrl: data.repositoryUrl || undefined,
        }
      );
      
      if (result) {
        toast.success("Votre solution a été sauvegardée localement");
        router.push(`/challenges/${challengeId}?submitted=anonymous`);
      } else {
        throw new Error("Impossible de soumettre la solution");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la soumission");
      }
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Soumettre votre solution (mode anonyme)
        </CardTitle>
        <div className="text-sm text-gray-500">
          Vos progrès sont sauvegardés localement sur cet appareil.
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          
          {/* Barre de progression */}
          <div className="space-y-2">
            <Label>Progression</Label>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                className="absolute h-full bg-primary transition-all duration-300" 
                style={{ width: `${savedProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{savedProgress}% complété</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description de votre solution
            </Label>
            <textarea
              {...register("description")}
              id="description"
              rows={6}
              placeholder="Expliquez votre approche et les choix techniques..."
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          {/* URL du dépôt */}
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl" className="text-sm font-medium">
              URL du dépôt (optionnel)
            </Label>
            <input
              {...register("repositoryUrl")}
              id="repositoryUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
            />
            {errors.repositoryUrl && (
              <p className="text-sm text-red-500">{errors.repositoryUrl.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/10"
              onClick={handleSaveProgress}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder le progrès
                </>
              )}
            </Button>
            
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Soumettre la solution
                </>
              )}
            </Button>
          </div>
          
          <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500">
              Vous souhaitez sauvegarder votre solution et progresser dans votre parcours ?
            </p>
            <Button 
              variant="link" 
              className="mt-2 text-primary"
              onClick={() => router.push(`/login?callbackUrl=/challenges/${challengeId}/participate`)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter ou créer un compte
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 