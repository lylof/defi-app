import { User, UserRole, Challenge } from "@prisma/client";

export interface AdminUserResponse {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface UpdateUserDto {
  role?: UserRole;
  isActive?: boolean;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  details: string;
  createdAt: Date;
  admin: {
    name: string | null;
  };
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
  };
  challenges: {
    total: number;
    active: number;
    challenges: Array<Challenge & { submissionCount: number }>;
  };
  participationRate: number;
  monthlyStats: {
    challenges: number;
    change: string;
  };
}

export type { AdminActionLog as AdminLog }; 