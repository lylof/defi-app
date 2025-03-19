/**
 * Interface pour les détails d'une erreur
 */
interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  timestamp: number;
}

/**
 * Interface pour le service de gestion des erreurs
 */
interface ErrorServiceType {
  errors: ErrorDetails[];
  addError: (error: Error | string, code?: string) => void;
  clearErrors: () => void;
  getErrors: () => ErrorDetails[];
  hasErrors: () => boolean;
  getLastError: () => ErrorDetails | null;
  formatError: (error: Error | string) => string;
}

/**
 * Service de gestion des erreurs
 * Centralise la gestion des erreurs dans l'application
 */
export const ErrorService: ErrorServiceType = {
  /**
   * Liste des erreurs enregistrées
   */
  errors: [],

  /**
   * Ajouter une erreur
   * @param error L'erreur à ajouter
   * @param code Code optionnel pour identifier l'erreur
   */
  addError: (error: Error | string, code?: string): void => {
    const errorDetails: ErrorDetails = {
      code,
      message: ErrorService.formatError(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    };

    ErrorService.errors.push(errorDetails);
    console.error('Erreur enregistrée:', errorDetails);
  },

  /**
   * Effacer toutes les erreurs
   */
  clearErrors: (): void => {
    ErrorService.errors = [];
  },

  /**
   * Obtenir toutes les erreurs
   * @returns Liste des erreurs
   */
  getErrors: (): ErrorDetails[] => {
    return ErrorService.errors;
  },

  /**
   * Vérifier s'il y a des erreurs
   * @returns true si des erreurs existent
   */
  hasErrors: (): boolean => {
    return ErrorService.errors.length > 0;
  },

  /**
   * Obtenir la dernière erreur
   * @returns Dernière erreur ou null si aucune erreur
   */
  getLastError: (): ErrorDetails | null => {
    return ErrorService.errors.length > 0 
      ? ErrorService.errors[ErrorService.errors.length - 1] 
      : null;
  },

  /**
   * Formater une erreur en chaîne de caractères
   * @param error L'erreur à formater
   * @returns Message d'erreur formaté
   */
  formatError: (error: Error | string): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}; 