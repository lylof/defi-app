'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function DatabaseErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      // Vérifie si l'erreur est liée à la base de données
      if (
        event.error?.message?.includes('database') ||
        event.error?.message?.includes('prisma') ||
        event.error?.message?.includes('connection')
      ) {
        setHasError(true);
        toast.error('Erreur de connexion à la base de données', {
          description: 'Tentative de reconnexion en cours...',
          duration: 5000,
        });
      }
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => handleError(event as unknown as ErrorEvent));

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', (event) => handleError(event as unknown as ErrorEvent));
    };
  }, []);

  if (hasError) {
    return fallback || (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Erreur de connexion
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                Une erreur est survenue lors de la connexion à la base de données.
                Veuillez patienter pendant que nous tentons de rétablir la connexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
} 