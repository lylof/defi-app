// Script de création d'utilisateurs pour l'application LPT Défis
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Créer un utilisateur admin
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@lptdefis.com' }
    });

    if (!adminExists) {
      console.log('Création de l\'utilisateur administrateur...');
      const adminUser = await prisma.user.create({
        data: {
          name: 'Administrateur',
          email: 'admin@lptdefis.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Utilisateur administrateur créé avec l\'ID:', adminUser.id);
    } else {
      console.log('L\'utilisateur administrateur existe déjà.');
    }

    // Créer un utilisateur standard
    const userExists = await prisma.user.findUnique({
      where: { email: 'user@lptdefis.com' }
    });

    if (!userExists) {
      console.log('Création de l\'utilisateur standard...');
      const standardUser = await prisma.user.create({
        data: {
          name: 'Utilisateur',
          email: 'user@lptdefis.com',
          password: await bcrypt.hash('user123', 10),
          role: 'USER',
          isActive: true,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Utilisateur standard créé avec l\'ID:', standardUser.id);
    } else {
      console.log('L\'utilisateur standard existe déjà.');
    }

    console.log('Opération terminée avec succès !');

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();                                        n      