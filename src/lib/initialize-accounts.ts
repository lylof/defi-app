"use server";

/**
 * Script d'initialisation automatique des comptes utilisateurs
 * Ce script est exécuté au démarrage de l'application pour garantir
 * l'existence des comptes administrateur et utilisateurs de test
 */

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

/**
 * Interface pour définir les utilisateurs à créer
 */
interface UserSeed {
  email: string;
  name: string;
  password: string;
  role: "USER" | "ADMIN";
  points: number;
}

/**
 * Liste des utilisateurs de base à créer automatiquement
 */
const DEFAULT_USERS: UserSeed[] = [
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
 * Initialise les comptes utilisateurs si nécessaire
 * Vérifie l'existence de chaque compte et le crée s'il n'existe pas
 * Met à jour les comptes existants pour s'assurer qu'ils sont actifs
 */
export async function initializeAccounts(): Promise<void> {
  try {
    console.log("\n🔄 Vérification des comptes utilisateurs de base...");
    
    const createdUsers: User[] = [];
    const updatedUsers: User[] = [];
    
    // Traiter chaque utilisateur par défaut
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
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des comptes:", error);
    // Ne pas faire échouer l'application en cas d'erreur
    // L'application continuera de fonctionner, mais sans les comptes par défaut
  }
} 