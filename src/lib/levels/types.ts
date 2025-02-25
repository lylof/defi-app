export interface LevelRequirement {
  level: number;
  experienceRequired: number;
  rewards: LevelReward[];
}

export interface LevelReward {
  type: "BADGE" | "FEATURE" | "POINTS";
  id?: string;  // Pour les badges
  value?: number;  // Pour les points
  description: string;
}

export interface LevelProgress {
  currentLevel: number;
  currentExperience: number;
  nextLevelExperience: number;
  progress: number;  // Pourcentage de progression vers le niveau suivant
}

export const LEVEL_REQUIREMENTS: LevelRequirement[] = [
  {
    level: 1,
    experienceRequired: 0,
    rewards: [
      {
        type: "FEATURE",
        description: "Accès aux défis de base",
      },
    ],
  },
  {
    level: 2,
    experienceRequired: 100,
    rewards: [
      {
        type: "POINTS",
        value: 50,
        description: "Bonus de 50 points",
      },
    ],
  },
  {
    level: 3,
    experienceRequired: 250,
    rewards: [
      {
        type: "FEATURE",
        description: "Accès aux défis intermédiaires",
      },
      {
        type: "BADGE",
        id: "intermediate_challenger",
        description: "Badge de challenger intermédiaire",
      },
    ],
  },
  {
    level: 4,
    experienceRequired: 500,
    rewards: [
      {
        type: "POINTS",
        value: 100,
        description: "Bonus de 100 points",
      },
    ],
  },
  {
    level: 5,
    experienceRequired: 1000,
    rewards: [
      {
        type: "FEATURE",
        description: "Accès aux défis avancés",
      },
      {
        type: "BADGE",
        id: "advanced_challenger",
        description: "Badge de challenger avancé",
      },
    ],
  },
]; 