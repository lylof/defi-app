const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("password123", 10);
    
    // Créer des utilisateurs de test
    const admin = await prisma.user.upsert({
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
    });

    const user = await prisma.user.upsert({
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
    });

    console.log("\n✅ Utilisateurs créés avec succès");
    console.log("\nComptes créés :");
    console.log(`- ${admin.email} (Mot de passe: admin123) - ${admin.role}`);
    console.log(`- ${user.email} (Mot de passe: password123) - ${user.role}`);
    console.log("\nVous pouvez maintenant tester l'interface avec ces comptes.");
    
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 