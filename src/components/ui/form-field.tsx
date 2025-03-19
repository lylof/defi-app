"use client";

import React, { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * Composant de champ de formulaire accessible
 * Combine un label, un champ et un message d'erreur avec les attributs ARIA appropriés
 */
interface FormFieldProps {
  /** Identifiant unique pour le champ */
  id: string;
  
  /** Label visible pour le champ */
  label: string;
  
  /** Description supplémentaire pour le champ */
  description?: string;
  
  /** Message d'erreur (si présent) */
  error?: string;
  
  /** Indique si le champ est obligatoire */
  required?: boolean;
  
  /** Contenu du champ de formulaire (input, select, textarea, etc.) */
  children: ReactNode;
  
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

export function AccessibleFormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  // Générer des IDs uniques pour la description et le message d'erreur
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  
  // Déterminer si le champ a une erreur
  const hasError = !!error;
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={id}
        className={cn(
          "block text-sm font-medium",
          hasError && "text-destructive"
        )}
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        )}
      </Label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      {/* Cloner l'enfant pour injecter les attributs d'accessibilité */}
      {React.isValidElement(children) && 
        React.cloneElement(children as React.ReactElement, {
          id,
          "aria-invalid": hasError || undefined,
          "aria-required": required || undefined,
          "aria-describedby": [
            descriptionId, 
            hasError ? errorId : undefined
          ].filter(Boolean).join(" ") || undefined
        })
      }
      
      {hasError && (
        <FormMessage 
          id={errorId}
          className="text-sm font-medium text-destructive"
        >
          {error}
        </FormMessage>
      )}
    </div>
  );
} 