import { PrismaClient, Prisma } from "@prisma/client";

// Type pour le cache global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configuration et options du client Prisma
 * Activation des logs en développement pour faciliter le debugging
 */
const prismaClientOptions: Prisma.PrismaClientOptions = process.env.NODE_ENV === "development" 
  ? {
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    }
  : {};

// Initialisation du client Prisma avec gestion du cache en développement
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// Assurer qu'en développement, nous n'avons qu'une seule instance
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Gestion des erreurs de connexion
prisma.$connect()
  .catch((error) => {
    console.error("Erreur de connexion à la base de données:", error);
  });

// Gestion propre de la fermeture de connexion
process.on("beforeExit", async () => {
  await prisma.$disconnect();
}); 