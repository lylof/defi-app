import { DatabaseService } from './database/database-service';

// Initialisation du service de base de données
const databaseService = DatabaseService.getInstance();

// Export de l'instance Prisma avec gestion des erreurs
export const db = databaseService.getPrisma();

// Gestion de la connexion initiale
databaseService.connect()
  .catch((error) => {
    console.error('Failed to initialize database connection:', error);
  });

// Gestion propre de la fermeture de connexion
process.on('beforeExit', async () => {
  await databaseService.disconnect();
});

// Export du service pour les opérations avancées
export { databaseService };