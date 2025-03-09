import { create } from 'zustand';

/**
 * Interface pour l'état du service de surveillance de la base de données
 */
interface DatabaseStatus {
  // État de la connexion
  isConnected: boolean;
  // Nombre de tentatives de reconnexion depuis le dernier succès
  reconnectAttempts: number;
  // Timestamp de la dernière connexion réussie
  lastSuccessfulConnection: number | null;
  // Timestamp de la dernière erreur
  lastErrorTimestamp: number | null;
  // Message d'erreur le plus récent
  lastErrorMessage: string | null;
  // Méthodes pour mettre à jour l'état
  setConnected: (isConnected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setLastError: (message: string) => void;
}

/**
 * Store Zustand pour suivre l'état de la connexion à la base de données
 * Utilisé par les composants pour afficher des alertes ou des indicateurs d'état
 */
export const useDatabaseStatus = create<DatabaseStatus>((set) => ({
  isConnected: true, // Supposer que la connexion est établie au démarrage
  reconnectAttempts: 0,
  lastSuccessfulConnection: Date.now(),
  lastErrorTimestamp: null,
  lastErrorMessage: null,
  
  // Mettre à jour l'état de connexion
  setConnected: (isConnected: boolean) => set((state: DatabaseStatus) => ({
    isConnected,
    ...(isConnected 
      ? { 
          lastSuccessfulConnection: Date.now(), 
          reconnectAttempts: 0 
        } 
      : {})
  })),
  
  // Incrémenter le compteur de tentatives de reconnexion
  incrementReconnectAttempts: () => set((state: DatabaseStatus) => ({
    reconnectAttempts: state.reconnectAttempts + 1
  })),
  
  // Réinitialiser le compteur de tentatives de reconnexion
  resetReconnectAttempts: () => set(() => ({
    reconnectAttempts: 0
  })),
  
  // Enregistrer la dernière erreur
  setLastError: (message: string) => set(() => ({
    lastErrorTimestamp: Date.now(),
    lastErrorMessage: message
  }))
}));

/**
 * Classe utilitaire pour intégrer les événements de la base de données avec le store
 */
export class DatabaseStatusMonitor {
  /**
   * Enregistre une reconnexion réussie
   */
  static connectionSuccessful(): void {
    useDatabaseStatus.getState().setConnected(true);
    console.log('État de la base de données: Connectée');
  }
  
  /**
   * Enregistre une déconnexion ou une erreur
   * @param message Message d'erreur
   */
  static connectionError(message: string): void {
    const state = useDatabaseStatus.getState();
    state.setConnected(false);
    state.setLastError(message);
    console.log(`État de la base de données: Déconnectée - ${message}`);
  }
  
  /**
   * Enregistre une tentative de reconnexion
   */
  static reconnectionAttempt(): void {
    const state = useDatabaseStatus.getState();
    state.incrementReconnectAttempts();
    console.log(`État de la base de données: Tentative de reconnexion ${state.reconnectAttempts}`);
  }
  
  /**
   * Vérifie si la connexion est considérée comme stable
   * (connectée et sans tentative de reconnexion récente)
   */
  static isConnectionStable(): boolean {
    const state = useDatabaseStatus.getState();
    return state.isConnected && state.reconnectAttempts === 0;
  }
  
  /**
   * Obtient le délai recommandé avant une nouvelle tentative
   * (augmente exponentiellement avec le nombre de tentatives)
   */
  static getRecommendedRetryDelay(): number {
    const attempts = useDatabaseStatus.getState().reconnectAttempts;
    // Délai exponentiel avec plafond: 5s, 10s, 20s, 40s, max 60s
    return Math.min(5000 * Math.pow(2, attempts), 60000);
  }
} 