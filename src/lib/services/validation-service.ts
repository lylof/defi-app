/**
 * Service de validation pour les données de l'application
 * Centralise toutes les règles de validation
 */
export const ValidationService = {
  /**
   * Valide une URL de dépôt GitHub
   * @param url URL à valider
   * @returns true si l'URL est valide, false sinon
   */
  validateRepositoryUrl: (url: string): boolean => {
    if (!url) return true; // URL optionnelle
    
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'github.com' || parsedUrl.hostname === 'gitlab.com';
    } catch {
      return false;
    }
  },

  /**
   * Valide une description de soumission
   * @param description Description à valider
   * @returns true si la description est valide, false sinon
   */
  validateDescription: (description: string): boolean => {
    if (!description) return false;
    
    // Vérifier la longueur minimale et maximale
    if (description.length < 10 || description.length > 5000) {
      return false;
    }
    
    // Vérifier que la description ne contient pas uniquement des espaces
    return description.trim().length > 0;
  },

  /**
   * Valide un fichier uploadé
   * @param file Fichier à valider
   * @returns true si le fichier est valide, false sinon
   */
  validateFile: (file: File): boolean => {
    if (!file) return true; // Fichier optionnel
    
    // Taille maximale : 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return false;
    }
    
    // Types de fichiers acceptés
    const ALLOWED_TYPES = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/gzip',
      'application/x-tar',
      'text/plain',
      'text/markdown',
      'application/json',
      'application/javascript',
      'text/css',
      'text/html'
    ];
    
    return ALLOWED_TYPES.includes(file.type);
  },

  /**
   * Valide les données de participation
   * @param data Données à valider
   * @returns true si les données sont valides, false sinon
   */
  validateParticipationData: (data: {
    description?: string;
    repositoryUrl?: string;
    files?: File[];
  }): boolean => {
    // Valider la description si présente
    if (data.description && !ValidationService.validateDescription(data.description)) {
      return false;
    }
    
    // Valider l'URL du dépôt si présente
    if (data.repositoryUrl && !ValidationService.validateRepositoryUrl(data.repositoryUrl)) {
      return false;
    }
    
    // Valider les fichiers si présents
    if (data.files?.length) {
      return data.files.every(file => ValidationService.validateFile(file));
    }
    
    return true;
  },

  /**
   * Retourne un message d'erreur pour une validation échouée
   * @param field Champ qui a échoué la validation
   * @returns Message d'erreur approprié
   */
  getErrorMessage: (field: 'description' | 'repositoryUrl' | 'file'): string => {
    switch (field) {
      case 'description':
        return 'La description doit contenir entre 10 et 5000 caractères';
      case 'repositoryUrl':
        return 'L\'URL du dépôt doit être une URL GitHub ou GitLab valide';
      case 'file':
        return 'Le fichier doit faire moins de 10MB et être d\'un type accepté';
      default:
        return 'Erreur de validation';
    }
  }
}; 