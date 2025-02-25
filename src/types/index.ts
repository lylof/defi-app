export type User = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  points: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  brief: string;
  points: number;
  startDate: Date;
  endDate: Date;
  participants: number;
  categoryId: string;
  category: Category;
  files: File[];
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  challenges: Challenge[];
  createdAt: Date;
  updatedAt: Date;
};

export type File = {
  id: string;
  challengeId: string;
  url: string;
  name: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ChallengeParticipation = {
  id: string;
  userId: string;
  challengeId: string;
  submitted: boolean;
  submission?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  challenge: Challenge;
};

export type Leaderboard = {
  id: string;
  userId: string;
  points: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    username: string;
    email: string;
  };
}; 