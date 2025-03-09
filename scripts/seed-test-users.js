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
    console.log(`- Email: ${admin.email} | Mot de passe: admin123 | Rôle: ${admin.role}`);
    console.log(`- Email: ${user.email} | Mot de passe: password123 | Rôle: ${user.role}`);
    console.log("\nVous pouvez maintenant vous connecter avec ces comptes à l'adresse http://localhost:3000/login");
    
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 