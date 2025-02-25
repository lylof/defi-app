import { Challenge, Category } from "@prisma/client";

export interface ChallengeWithRelations extends Challenge {
  category: Category;
  _count: {
    participations: number;
  };
}

export interface ChallengeCardProps {
  title: string;
  description: string;
  category: string;
  points: number;
  endDate: Date;
  participants: number;
  href: string;
}