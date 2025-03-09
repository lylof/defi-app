import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { UserRole } from "@prisma/client";

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

describe("Authentication", () => {
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

    it("devrait vérifier un mot de passe valide", async () => {
      const password = "password123";
      const hashedPassword = await hash(password, 10);

      const isValid = await compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("devrait rejeter un mot de passe invalide", async () => {
      const password = "password123";
      const wrongPassword = "wrongpassword";
      const hashedPassword = await hash(password, 10);

      const isValid = await compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe("User Status", () => {
    it("devrait identifier un utilisateur actif", async () => {
      const mockUser = {
        id: "1",
        email: "active@example.com",
        isActive: true,
        role: "USER" as UserRole
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: mockUser.email }
      });

      expect(user).toBeDefined();
      expect(user?.isActive).toBe(true);
    });

    it("devrait identifier un utilisateur inactif", async () => {
      const mockUser = {
        id: "1",
        email: "inactive@example.com",
        isActive: false,
        role: "USER" as UserRole
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: mockUser.email }
      });

      expect(user).toBeDefined();
      expect(user?.isActive).toBe(false);
    });
  });

  describe("User Roles", () => {
    it("devrait identifier un administrateur", async () => {
      const mockAdmin = {
        id: "1",
        email: "admin@example.com",
        role: "ADMIN" as UserRole,
        isActive: true
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      const user = await prisma.user.findUnique({
        where: { email: mockAdmin.email }
      });

      expect(user).toBeDefined();
      expect(user?.role).toBe("ADMIN");
    });

    it("devrait identifier un utilisateur standard", async () => {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        role: "USER" as UserRole,
        isActive: true
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findUnique({
        where: { email: mockUser.email }
      });

      expect(user).toBeDefined();
      expect(user?.role).toBe("USER");
    });
  });
}); 
 
 