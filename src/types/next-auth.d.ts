import { User } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image: string | null;
      role: User["role"];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: User["role"];
  }
} 