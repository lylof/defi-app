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
  id: string;
  name: string;
  description: string;
  image: string;
  condition: BadgeCondition;
  points: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: Badge;
} 