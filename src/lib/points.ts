import { prisma } from "./prisma";

export async function updateUserPoints(userId: string, points: number) {
  // Mettre à jour les points de l'utilisateur
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        increment: points,
      },
    },
  });

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

  // Mettre à jour le classement de chaque utilisateur
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

  return user;
}

export async function getLeaderboard(limit = 100) {
  return prisma.leaderboard.findMany({
    take: limit,
    orderBy: {
      points: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getUserRank(userId: string) {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: { userId },
  });
  return leaderboard?.rank || 0;
} 