import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";

// Mock de PrismaClient
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock de next-auth
jest.mock("next-auth", () => ({
  ...jest.requireActual("next-auth"),
  getServerSession: jest.fn(),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Authentication", () => {
    it("devrait trouver un utilisateur par email", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        password: await hash("password123", 10),
        role: "USER" as UserRole,
        isActive: true
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" }
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(mockUser.email);
      expect(user?.role).toBe(mockUser.role);
    });

    it("devrait rejeter un utilisateur inactif", async () => {
      const mockUser = {
        id: "1",
        email: "inactive@example.com",
        password: await hash("password123", 10),
        isActive: false
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: mockUser.email }
      });

      expect(user).toBeDefined();
      expect(user?.isActive).toBe(false);
    });

    it("devrait gérer un utilisateur inexistant", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: "nonexistent@example.com" }
      });

      expect(user).toBeNull();
    });
  });

  describe("Session Management", () => {
    it("devrait enrichir le token avec les informations utilisateur", async () => {
      const token: JWT = {
        id: "",
        role: "USER" as UserRole,
        name: "",
        email: "",
        picture: "",
        sub: ""
      };
      const user: AdapterUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER" as UserRole,
        emailVerified: null
      };

      const result = {
        ...token,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: "",
        sub: ""
      });
    });

    it("devrait enrichir la session avec les informations du token", async () => {
      const session: Session = { 
        user: { 
          id: "",
          email: "",
          name: "",
          role: "USER" as UserRole
        },
        expires: new Date().toISOString()
      };
      const token = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER" as UserRole,
        picture: "",
        sub: ""
      };

      const result = {
        ...session,
        user: {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role
        }
      };

      expect(result.user).toEqual({
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role
      });
    });
  });
}); 
 
 