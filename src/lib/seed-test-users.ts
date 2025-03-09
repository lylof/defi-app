import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("password123", 10);
    const testPassword = await bcrypt.hash("Test123!", 10);
    
    // Créer des utilisateurs de test
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {
          password: adminPassword,
          isActive: true
        },
        create: {
          email: "admin@example.com",
          name: "Administrateur",
          password: adminPassword,
          role: "ADMIN",
          points: 1000,
          isActive: true
        },
      }),
      prisma.user.upsert({
        where: { email: "user@example.com" },
        update: {
          password: userPassword,
          isActive: true
        },
        create: {
          email: "user@example.com",
          name: "Utilisateur Standard",
          password: userPassword,
          role: "USER",
          points: 500,
          isActive: true
        },
      }),
      prisma.user.upsert({
        where: { email: "user1@test.com" },
        update: {},
        create: {
          email: "user1@test.com",
          name: "Utilisateur Test 1",
          password: testPassword,
          role: "USER",
          points: 100,
          isActive: true
        },
      }),
      prisma.user.upsert({
        where: { email: "user2@test.com" },
        update: {},
        create: {
          email: "user2@test.com",
          name: "Utilisateur Test 2",
          password: testPassword,
          role: "USER",
          points: 50,
          isActive: true
        },
      }),
      prisma.user.upsert({
        where: { email: "user3@test.com" },
        update: {},
        create: {
          email: "user3@test.com",
          name: "Utilisateur Test 3",
          password: testPassword,
          role: "USER",
          points: 75,
          isActive: true
        },
      }),
    ]);

    console.log("\n✅ Utilisateurs de test créés avec succès");
    console.log("\nComptes créés :");
    console.log(`- admin@example.com (Mot de passe: admin123) - ADMIN`);
    console.log(`- user@example.com (Mot de passe: password123) - USER`);
    users.slice(2).forEach(user => {
      console.log(`- ${user.email} (Mot de passe: Test123!)`);
    });
    console.log("\nVous pouvez maintenant tester l'interface avec ces comptes.");
    
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs de test:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 