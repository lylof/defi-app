export const defaultBadges = [
  {
    name: "Débutant",
    description: "Bienvenue dans l'aventure ! Vous avez participé à votre premier défi.",
    image: "/badges/beginner.svg",
    condition: {
      type: "PARTICIPATION_COUNT",
      value: 1,
    },
    points: 10,
  },
  {
    name: "Explorateur",
    description: "Vous avez participé à 5 défis différents.",
    image: "/badges/explorer.svg",
    condition: {
      type: "PARTICIPATION_COUNT",
      value: 5,
    },
    points: 50,
  },
  {
    name: "Champion",
    description: "Vous avez réussi 3 défis avec succès.",
    image: "/badges/champion.svg",
    condition: {
      type: "SUCCESS_COUNT",
      value: 3,
    },
    points: 100,
  },
  {
    name: "Expert",
    description: "Vous avez accumulé plus de 500 points.",
    image: "/badges/expert.svg",
    condition: {
      type: "POINTS_THRESHOLD",
      value: 500,
    },
    points: 200,
  },
  {
    name: "Mentor",
    description: "Vous avez aidé d'autres participants en commentant leurs solutions.",
    image: "/badges/mentor.svg",
    condition: {
      type: "COMMENT_COUNT",
      value: 10,
    },
    points: 150,
  },
  {
    name: "Persévérant",
    description: "Vous avez participé à des défis pendant 30 jours consécutifs.",
    image: "/badges/persistent.svg",
    condition: {
      type: "STREAK_DAYS",
      value: 30,
    },
    points: 300,
  },
] as const;

export type BadgeConditionType = 
  | "PARTICIPATION_COUNT"
  | "SUCCESS_COUNT"
  | "POINTS_THRESHOLD"
  | "COMMENT_COUNT"
  | "STREAK_DAYS";

export interface BadgeCondition {
  type: BadgeConditionType;
  value: number;
}

export interface Badge {
  name: string;
  description: string;
  image: string;
  condition: BadgeCondition;
  points: number;
} 