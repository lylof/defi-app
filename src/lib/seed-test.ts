const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Créer quelques utilisateurs de test
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

    // Mettre à jour le classement
    const usersWithPoints = await prisma.user.findMany({
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        points: true,
      },
    });

    // Créer ou mettre à jour le classement
    for (let i = 0; i < usersWithPoints.length; i++) {
      await prisma.leaderboard.upsert({
        where: {
          userId: usersWithPoints[i].id,
        },
        update: {
          points: usersWithPoints[i].points,
          rank: i + 1,
        },
        create: {
          userId: usersWithPoints[i].id,
          points: usersWithPoints[i].points,
          rank: i + 1,
        },
      });
    }

    console.log("✅ Données de test créées avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la création des données de test:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 