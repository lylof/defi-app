/**
 * Script d'initialisation de la base de données
 * 
 * Ce script permet d'initialiser la base de données et de créer les comptes utilisateurs
 * nécessaires au fonctionnement de l'application.
 * 
 * Exécution: node src/scripts/initialize-db.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Initialiser le client Prisma
const prisma = new PrismaClient();

// Liste des utilisateurs à créer
const DEFAULT_USERS = [
  {
    email: "admin@lpt-defi.fr",
    name: "Administrateur",
    password: "Admin123!",
    role: "ADMIN",
    points: 0,
  },
  {
    email: "admin@example.com",
    name: "Administrateur Test",
    password: "admin123",
    role: "ADMIN",
    points: 1000,
  },
  {
    email: "user@example.com",
    name: "Utilisateur Standard",
    password: "password123",
    role: "USER",
    points: 500,
  },
  {
    email: "user1@test.com",
    name: "Utilisateur Test 1",
    password: "Test123!",
    role: "USER",
    points: 100,
  },
  {
    email: "user2@test.com",
    name: "Utilisateur Test 2",
    password: "Test123!",
    role: "USER",
    points: 50,
  },
  {
    email: "user3@test.com",
    name: "Utilisateur Test 3",
    password: "Test123!",
    role: "USER",
    points: 75,
  },
];

/**
 * Fonction principale d'initialisation
 */
async function main() {
  try {
    console.log("\n🔄 Initialisation de la base de données...");
    
    // Vérifier la connexion à la base de données
    try {
      await prisma.$queryRaw`SELECT 1 as health_check`;
      console.log("✅ Connexion à la base de données établie avec succès");
    } catch (error) {
      console.error("❌ Erreur de connexion à la base de données:", error);
      process.exit(1);
    }
    
    console.log("\n🔄 Création des comptes utilisateurs...");
    
    const createdUsers = [];
    const updatedUsers = [];
    
    // Traiter chaque utilisateur
    for (const userSeed of DEFAULT_USERS) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userSeed.email },
      });
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userSeed.password, 10);
      
      if (!existingUser) {
        // Créer l'utilisateur s'il n'existe pas
        const newUser = await prisma.user.create({
          data: {
            email: userSeed.email,
            name: userSeed.name,
            password: hashedPassword,
            role: userSeed.role,
            points: userSeed.points,
            isActive: true,
          },
        });
        
        createdUsers.push(newUser);
        console.log(`✅ Compte créé: ${userSeed.email} (${userSeed.role})`);
      } else if (!existingUser.isActive) {
        // Réactiver l'utilisateur s'il existe mais n'est pas actif
        const updatedUser = await prisma.user.update({
          where: { email: userSeed.email },
          data: {
            isActive: true,
            password: hashedPassword, // Réinitialiser le mot de passe au cas où
          },
        });
        
        updatedUsers.push(updatedUser);
        console.log(`🔄 Compte réactivé: ${userSeed.email} (${userSeed.role})`);
      } else {
        console.log(`✓ Compte existant et actif: ${userSeed.email} (${userSeed.role})`);
      }
    }
    
    // Résumé des opérations
    if (createdUsers.length > 0 || updatedUsers.length > 0) {
      console.log("\n✅ Initialisation des comptes terminée");
      console.log(`📊 ${createdUsers.length} comptes créés, ${updatedUsers.length} comptes mis à jour`);
      
      // Afficher les informations de connexion
      console.log("\n🔑 Informations de connexion pour les comptes de test:");
      DEFAULT_USERS.forEach(user => {
        console.log(`- ${user.email} (Mot de passe: ${user.password}) - ${user.role}`);
      });
    } else {
      console.log("\n✅ Tous les comptes sont déjà initialisés et actifs");
    }
    
    console.log("\n🎉 Initialisation de la base de données terminée avec succès!");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction principale
main(); 