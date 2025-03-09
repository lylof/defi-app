import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Interface pour les propriétés du composant DataError
 */
export interface DataErrorProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  retryText?: string;
  homeLink?: boolean;
  children?: React.ReactNode;
}

/**
 * Composant pour afficher les erreurs de chargement de données
 * Propose une interface unifiée pour:
 * - Afficher un message d'erreur formaté
 * - Proposer un bouton de tentative
 * - Proposer un lien vers la page d'accueil
 * - Personnaliser le contenu via children
 */
export function DataError({
  title = "Erreur de chargement des données",
  message = "Une erreur est survenue lors du chargement des données. Veuillez réessayer ultérieurement.",
  error,
  onRetry,
  retryText = "Réessayer",
  homeLink = true,
  children,
}: DataErrorProps) {
  // Déterminer si l'erreur est liée à la base de données
  const isDatabaseError = error instanceof Error && 
    (error.message.includes('database') || 
     error.message.includes('connection') || 
     error.message.includes('Prisma') ||
     error.message.includes('timeout'));

  // Message spécifique pour les erreurs de base de données
  const errorMessage = isDatabaseError 
    ? "Impossible de se connecter à la base de données. Veuillez réessayer ultérieurement."
    : message;

  return (
    <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-destructive">{title}</h3>
          <div className="mt-2 text-sm text-destructive/80">
            <p>{errorMessage}</p>
            {process.env.NODE_ENV === 'development' && error instanceof Error && (
              <details className="mt-2 text-xs font-mono">
                <summary>Détails techniques</summary>
                <p className="mt-1 whitespace-pre-wrap">{error.message}</p>
                {error.stack && (
                  <pre className="mt-1 text-[10px] bg-gray-900 text-gray-200 p-2 rounded overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                )}
              </details>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRetry} 
                className="inline-flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {retryText}
              </Button>
            )}
            
            {homeLink && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 