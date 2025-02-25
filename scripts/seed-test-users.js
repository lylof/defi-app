const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("Test123!", 10);
    
    // Créer des utilisateurs de test
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: "user1@test.com" },
        update: {},
        create: {
          email: "user1@test.com",
          name: "Utilisateur Test 1",
          password: hashedPassword,
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
          password: hashedPassword,
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
          password: hashedPassword,
          role: "USER",
          points: 75,
          isActive: true
        },
      }),
    ]);

    console.log("\n✅ Utilisateurs de test créés avec succès");
    console.log("\nComptes créés :");
    users.forEach(user => {
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