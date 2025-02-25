import { createMocks } from 'node-mocks-http';
import { GET, PATCH } from '@/app/api/admin/users/route';
import { AdminService } from '@/lib/admin/admin-service';
import { UserRole } from '@prisma/client';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/admin/admin-service', () => ({
  AdminService: {
    getUsers: jest.fn(),
    updateUser: jest.fn(),
  },
}));

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { req } = createMocks({
        method: 'GET',
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Non autorisé' });
    });

    it('should return 401 if user is not admin', async () => {
      const { req } = createMocks({
        method: 'GET',
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: '1', role: UserRole.USER },
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Non autorisé' });
    });

    it('should return users list for admin', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user@test.com',
          name: 'Test User',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      ];

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/users?page=1&limit=10',
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: '1', role: UserRole.ADMIN },
      });

      AdminService.getUsers.mockResolvedValue({
        users: mockUsers,
        total: 1,
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        users: mockUsers,
        total: 1,
      });
    });
  });

  describe('PATCH /api/admin/users', () => {
    it('should update user role', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      const { req } = createMocks({
        method: 'PATCH',
        body: {
          userId: '1',
          role: UserRole.ADMIN,
        },
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: 'admin1', role: UserRole.ADMIN },
      });

      AdminService.updateUser.mockResolvedValue(mockUser);

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(AdminService.updateUser).toHaveBeenCalledWith(
        '1',
        'admin1',
        { role: UserRole.ADMIN }
      );
    });

    it('should return 400 if userId is missing', async () => {
      const { req } = createMocks({
        method: 'PATCH',
        body: {
          role: UserRole.ADMIN,
        },
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: 'admin1', role: UserRole.ADMIN },
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'ID utilisateur requis' });
    });
  });
}); 