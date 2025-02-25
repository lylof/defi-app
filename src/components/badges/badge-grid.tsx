"use client";

import { Badge, UserBadge } from "@prisma/client";
import { BadgeCard } from "./badge-card";

interface BadgeGridProps {
  badges: (Badge & { userBadges?: UserBadge[] })[];
  newBadgeIds?: string[];
}

export function BadgeGrid({ badges, newBadgeIds = [] }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          isNew={newBadgeIds.includes(badge.id)}
          earnedAt={badge.userBadges?.[0]?.earnedAt}
        />
      ))}
    </div>
  );
} 