import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // Create test users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "Alice Martin",
          email: "alice@test.com",
          points: 150,
        },
      }),
      prisma.user.create({
        data: {
          name: "Bob Dupont",
          email: "bob@test.com",
          points: 200,
        },
      }),
      prisma.user.create({
        data: {
          name: "Charlie Dubois",
          email: "charlie@test.com",
          points: 100,
        },
      }),
    ]);

    // Create categories
    const webCategory = await prisma.category.create({
      data: {
        name: "Développement Web",
        description: "Défis liés au développement web",
      },
    });

    const mobileCategory = await prisma.category.create({
      data: {
        name: "Développement Mobile",
        description: "Défis liés au développement mobile",
      },
    });

    // Create challenges
    const challenges = await Promise.all([
      prisma.challenge.create({
        data: {
          title: "Créer une API REST",
          description: "Développez une API REST complète avec Node.js et Express",
          brief: `Dans ce défi, vous devrez créer une API REST pour gérer une bibliothèque de livres.

Fonctionnalités requises :
- CRUD pour les livres
- Authentification JWT
- Validation des données
- Tests unitaires`,
          points: 100,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          categoryId: webCategory.id,
        },
      }),
      prisma.challenge.create({
        data: {
          title: "Application Mobile React Native",
          description: "Créez une application mobile de gestion de tâches avec React Native",
          brief: `Développez une application mobile de gestion de tâches avec les fonctionnalités suivantes :

- Liste des tâches
- Ajout/Modification/Suppression
- Catégorisation
- Notifications
- Stockage local`,
          points: 150,
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          categoryId: mobileCategory.id,
        },
      }),
    ]);

    // Update leaderboard
    const usersWithPoints = await prisma.user.findMany({
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        points: true,
      },
    });

    // Create or update leaderboard entries
    await Promise.all(
      usersWithPoints.map((user, index) =>
        prisma.leaderboard.upsert({
          where: {
            userId: user.id,
          },
          update: {
            points: user.points,
            rank: index + 1,
          },
          create: {
            userId: user.id,
            points: user.points,
            rank: index + 1,
          },
        })
      )
    );

    console.log("✅ Test data created successfully");
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();