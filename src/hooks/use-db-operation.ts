import { useState, useCallback } from 'react';
import { dbOperations } from '@/lib/database/db-operations';
import { toast } from 'sonner';

interface UseDbOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useDbOperation<T>(
  model: string,
  options: UseDbOperationOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      type: 'findUnique' | 'findMany' | 'create' | 'update' | 'delete' | 'transaction'
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await dbOperations[type](model, operation);

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Une erreur est survenue');
        setError(error);
        
        if (options.errorMessage) {
          toast.error(options.errorMessage);
        }

        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [model, options]
  );

  return {
    isLoading,
    error,
    findUnique: <R = T>(operation: () => Promise<R | null>) => 
      execute(operation as () => Promise<T>, 'findUnique'),
    findMany: <R = T>(operation: () => Promise<R[]>) => 
      execute(operation as () => Promise<T>, 'findMany'),
    create: (operation: () => Promise<T>) => 
      execute(operation, 'create'),
    update: (operation: () => Promise<T>) => 
      execute(operation, 'update'),
    delete: (operation: () => Promise<T>) => 
      execute(operation, 'delete'),
    transaction: (operation: () => Promise<T>) => 
      execute(operation, 'transaction'),
  };
} 