import { Prisma } from "@prisma/client";

// Types pour les modèles de base
export type User = Prisma.UserGetPayload<{
  include: {
    challenges: true;
    leaderboard: true;
  };
}>;

export type Challenge = Prisma.ChallengeGetPayload<{
  include: {
    category: true;
    files: true;
    participations: {
      include: {
        user: {
          select: {
            username: true;
          };
        };
      };
    };
  };
}>;

export type Category = Prisma.CategoryGetPayload<{
  include: {
    challenges: true;
  };
}>;

export type File = Prisma.FileGetPayload<{
  include: {
    challenge: true;
  };
}>;

export type ChallengeParticipation = Prisma.ChallengeParticipationGetPayload<{
  include: {
    user: true;
    challenge: true;
  };
}>;

export type Leaderboard = Prisma.LeaderboardGetPayload<{
  include: {
    user: {
      select: {
        username: true;
        email: true;
      };
    };
  };
}>; 