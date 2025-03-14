import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@lptdefis.com" }
  });

  if (existingUser) {
    console.log("L'utilisateur admin existe déjà, mise à jour du mot de passe...");
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { email: "admin@lptdefis.com" },
      data: {
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
        emailVerified: new Date()
      }
    });
    
    console.log("Mot de passe administrateur mis à jour avec succès!");
  } else {
    console.log("Création d'un nouvel utilisateur administrateur...");
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Créer l'utilisateur
    await prisma.user.create({
      data: {
        name: "Administrateur",
        email: "admin@lptdefis.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
        emailVerified: new Date()
      }
    });
    
    console.log("Utilisateur administrateur créé avec succès!");
  }

  // Créer aussi un utilisateur standard
  const existingUserStd = await prisma.user.findUnique({
    where: { email: "user@lptdefis.com" }
  });

  if (!existingUserStd) {
    console.log("Création d'un utilisateur standard...");
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash("user123", 10);
    
    // Créer l'utilisateur
    await prisma.user.create({
      data: {
        name: "Utilisateur",
        email: "user@lptdefis.com",
        password: hashedPassword,
        role: "USER",
        isActive: true,
        emailVerified: new Date()
      }
    });
    
    console.log("Utilisateur standard créé avec succès!");
  }
}

main()
  .catch((e) => {
    console.error("Erreur lors de la création des utilisateurs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 