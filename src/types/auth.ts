import { User } from '@prisma/client';
import { DefaultSession } from 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: User['role'];
    } & DefaultSession['user'];
  }

  interface User {
    role: User['role'];
  }
}

// Extend JWT type to include custom fields
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: User['role'];
  }
}

// Auth log types
export type AuthLogType = 'login' | 'logout' | 'register' | 'error';

export interface AuthLogData {
  type: AuthLogType;
  userId?: string;
  message: string;
  metadata?: Record<string, any>;
}