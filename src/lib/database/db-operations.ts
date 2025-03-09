import { databaseService } from '../db';

export async function executeQuery<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  return databaseService.executeWithRetry(operation, context);
}

export const dbOperations = {
  /**
   * Trouve un enregistrement unique
   */
  findUnique: async <T>(
    model: string,
    operation: () => Promise<T | null>,
  ): Promise<T | null> => {
    return executeQuery(
      operation,
      `find unique ${model}`
    );
  },

  /**
   * Trouve plusieurs enregistrements
   */
  findMany: async <T>(
    model: string,
    operation: () => Promise<T[]>,
  ): Promise<T[]> => {
    return executeQuery(
      operation,
      `find many ${model}`
    );
  },

  /**
   * Crée un nouvel enregistrement
   */
  create: async <T>(
    model: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    return executeQuery(
      operation,
      `create ${model}`
    );
  },

  /**
   * Met à jour un enregistrement
   */
  update: async <T>(
    model: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    return executeQuery(
      operation,
      `update ${model}`
    );
  },

  /**
   * Supprime un enregistrement
   */
  delete: async <T>(
    model: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    return executeQuery(
      operation,
      `delete ${model}`
    );
  },

  /**
   * Exécute une transaction
   */
  transaction: async <T>(
    operation: () => Promise<T>,
  ): Promise<T> => {
    return executeQuery(
      operation,
      'transaction'
    );
  },
}; 