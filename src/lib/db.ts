import { PrismaClient } from "@prisma/client";

// Type pour le cache global de Prisma
declare global {
  var cachedPrisma: PrismaClient | undefined;
}

/**
 * Configuration et options du client Prisma
 * Activation des logs en développement pour faciliter le debugging
 */
const prismaClientOptions = process.env.NODE_ENV === "development" 
  ? {
      log: ["query", "error", "warn"],
    }
  : {};

/**
 * Initialisation du client Prisma avec gestion du cache en développement
 * Pour éviter la création de multiples connexions en mode développement
 */
let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient(prismaClientOptions);
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(prismaClientOptions);
  }
  db = global.cachedPrisma;
}

// Gestion des erreurs de connexion
db.$connect()
  .catch((error) => {
    console.error("Erreur de connexion à la base de données:", error);
    process.exit(1);
  });

// Gestion propre de la fermeture de connexion
process.on("beforeExit", async () => {
  await db.$disconnect();
});

export { db };