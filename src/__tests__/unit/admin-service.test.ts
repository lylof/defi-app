import { AdminService } from '@/lib/admin/admin-service';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Mock de PrismaClient
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    challenge: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    challengeParticipation: {
      count: jest.fn(),
    },
    adminLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('devrait retourner la liste des utilisateurs avec le total', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          role: 'USER' as UserRole,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await AdminService.getUsers();

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });

    it('devrait gérer les erreurs', async () => {
      (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const result = await AdminService.getUsers();

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour le rôle d\'un utilisateur', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        role: 'ADMIN' as UserRole,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.adminLog.create as jest.Mock).mockResolvedValue({
        id: '1',
        action: 'UPDATE_ROLE',
      });

      const result = await AdminService.updateUser('1', 'admin1', {
        role: 'ADMIN',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.adminLog.create).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await expect(
        AdminService.updateUser('1', 'admin1', { role: 'ADMIN' })
      ).rejects.toThrow();
    });
  });

  describe('getLogs', () => {
    it('devrait retourner les logs avec pagination', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'UPDATE_ROLE',
          details: JSON.stringify({ role: 'ADMIN' }),
          createdAt: new Date(),
          adminId: 'admin1',
          targetId: 'user1',
          admin: {
            name: 'Admin',
          },
        },
      ];

      (prisma.adminLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.adminLog.count as jest.Mock).mockResolvedValue(1);

      const result = await AdminService.getLogs(1, 10);

      expect(result).toEqual({
        logs: mockLogs,
        total: 1,
      });
    });

    it('devrait gérer les erreurs', async () => {
      (prisma.adminLog.findMany as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const result = await AdminService.getLogs(1, 10);

      expect(result.logs).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
}); 
      expect(db.adminLog.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });
}); 