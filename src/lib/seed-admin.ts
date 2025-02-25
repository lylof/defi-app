import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    
    const admin = await db.user.upsert({
      where: { email: "admin@lpt-defi.fr" },
      update: {},
      create: {
        email: "admin@lpt-defi.fr",
        name: "Administrateur",
        password: hashedPassword,
        role: "ADMIN",
        points: 0,
        isActive: true
      },
    });

    console.log("\n✅ Compte administrateur créé avec succès");
    console.log("Email:", admin.email);
    console.log("Mot de passe: Admin123!");
    console.log("\nVous pouvez maintenant vous connecter à l'interface d'administration.");
    
  } catch (error) {
    console.error("Erreur lors de la création du compte admin:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main(); 