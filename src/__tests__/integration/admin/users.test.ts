import { GET, PATCH } from '@/app/api/admin/users/route';
import { AdminService } from '@/lib/admin/admin-service';
import { UserRole } from '@prisma/client';

// Mock de next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock du service admin
jest.mock('@/lib/admin/admin-service', () => ({
  AdminService: {
    getUsers: jest.fn(),
    updateUser: jest.fn(),
  },
}));

describe('Admin Users API', () => {
  const mockDate = new Date('2024-02-25T19:01:13.449Z');
  const mockDateString = mockDate.toISOString();
  const mockUser = {
    id: '1',
    email: 'user@test.com',
    name: 'Test User',
    role: 'USER' as UserRole,
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
    lastLogin: mockDate,
    emailVerified: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('devrait retourner 401 si l\'utilisateur n\'est pas authentifié', async () => {
      const request = new Request('http://localhost:3000/api/admin/users');
      require('next-auth').getServerSession.mockResolvedValue(null);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Non autorisé' });
    });

    it('devrait retourner 401 si l\'utilisateur n\'est pas admin', async () => {
      const request = new Request('http://localhost:3000/api/admin/users');
      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: '1', role: 'USER' as UserRole },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Non autorisé' });
    });

    it('devrait retourner la liste des utilisateurs pour un admin', async () => {
      const request = new Request('http://localhost:3000/api/admin/users?page=1&limit=10');
      
      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN' as UserRole },
      });

      (AdminService.getUsers as jest.Mock).mockResolvedValue({
        users: [mockUser],
        total: 1,
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
      expect(data.users).toHaveLength(1);
      expect(data.users[0]).toEqual({
        ...mockUser,
        createdAt: mockDateString,
        updatedAt: mockDateString,
        lastLogin: mockDateString,
      });
    });

    it('devrait gérer les erreurs du service', async () => {
      const request = new Request('http://localhost:3000/api/admin/users');
      
      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: '1', role: 'ADMIN' as UserRole },
      });

      (AdminService.getUsers as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Une erreur est survenue' });
    });
  });

  describe('PATCH /api/admin/users', () => {
    it('devrait mettre à jour le rôle d\'un utilisateur', async () => {
      const updatedUser = {
        ...mockUser,
        role: 'ADMIN' as UserRole,
      };

      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '1',
          role: 'ADMIN',
        }),
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'ADMIN' as UserRole },
      });

      (AdminService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...updatedUser,
        createdAt: mockDateString,
        updatedAt: mockDateString,
        lastLogin: mockDateString,
      });
      expect(AdminService.updateUser).toHaveBeenCalledWith(
        '1',
        'admin1',
        { role: 'ADMIN' }
      );
    });

    it('devrait retourner 400 si l\'ID utilisateur est manquant', async () => {
      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'ADMIN',
        }),
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'ADMIN' as UserRole },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        error: 'Données invalides',
        details: expect.any(Object),
      });
    });

    it('devrait gérer les erreurs du service', async () => {
      const request = new Request('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '1',
          role: 'ADMIN',
        }),
      });

      require('next-auth').getServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'ADMIN' as UserRole },
      });

      (AdminService.updateUser as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Une erreur est survenue' });
    });
  });
}); 
 
 