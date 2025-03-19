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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600">
            <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-2">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Erreur de base de données</h3>
          </div>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>
              Une erreur est survenue lors de la connexion à la base de données.
              Veuillez patienter pendant que nous tentons de rétablir la connexion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
} 