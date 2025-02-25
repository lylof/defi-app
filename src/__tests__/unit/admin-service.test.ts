import { AdminService } from '@/lib/admin/admin-service';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      ];

      (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (db.user.count as jest.Mock).mockResolvedValue(1);

      const result = await AdminService.getUsers(1, 10);

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
      });
      expect(db.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      });
    });
  });

  describe('updateUser', () => {
    it('should update user role and create log', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      (db.user.update as jest.Mock).mockResolvedValue(mockUser);
      (db.adminLog.create as jest.Mock).mockResolvedValue({
        id: '1',
        adminId: 'admin1',
        action: 'UPDATE_ROLE',
        targetId: '1',
        details: JSON.stringify({ role: UserRole.ADMIN }),
        createdAt: new Date(),
      });

      const result = await AdminService.updateUser('1', 'admin1', {
        role: UserRole.ADMIN,
      });

      expect(result).toEqual(mockUser);
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          role: UserRole.ADMIN,
          updatedAt: expect.any(Date),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
      });
    });

    it('should update user status and create log', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.USER,
        isActive: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      (db.user.update as jest.Mock).mockResolvedValue(mockUser);
      (db.adminLog.create as jest.Mock).mockResolvedValue({
        id: '1',
        adminId: 'admin1',
        action: 'BAN',
        targetId: '1',
        details: JSON.stringify({ isActive: false }),
        createdAt: new Date(),
      });

      const result = await AdminService.updateUser('1', 'admin1', {
        isActive: false,
      });

      expect(result).toEqual(mockUser);
      expect(db.adminLog.create).toHaveBeenCalledWith({
        data: {
          adminId: 'admin1',
          targetId: '1',
          action: 'BAN',
          details: JSON.stringify({ isActive: false }),
        },
      });
    });
  });

  describe('getLogs', () => {
    it('should return logs with pagination', async () => {
      const mockLogs = [
        {
          id: '1',
          adminId: 'admin1',
          action: 'UPDATE_ROLE',
          targetId: 'user1',
          details: '{"role":"ADMIN"}',
          createdAt: new Date(),
          admin: {
            name: 'Admin',
            email: 'admin@test.com',
          },
        },
      ];

      (db.adminLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (db.adminLog.count as jest.Mock).mockResolvedValue(1);

      const result = await AdminService.getLogs(1, 10);

      expect(result).toEqual({
        logs: mockLogs,
        total: 1,
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