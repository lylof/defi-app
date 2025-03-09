import { OptimizedUserService } from '@/lib/user/optimized-user-service';
import { prisma } from '@/lib/prisma';
import { createCacheManager } from '@/lib/cache/advanced-cache';
import { cacheService } from '@/lib/cache-service';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    level: {
      findUnique: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
    },
    submission: {
      count: jest.fn(),
    },
    challengeParticipation: {
      count: jest.fn(),
    },
  },
}));

// Mock du gestionnaire de cache
jest.mock('@/lib/cache/advanced-cache', () => ({
  createCacheManager: jest.fn().mockReturnValue({
    getOrSet: jest.fn(),
    invalidate: jest.fn(),
    invalidateAll: jest.fn(),
  }),
}));

// Mock du service de cache
jest.mock('@/lib/cache-service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidateByTag: jest.fn(),
    getOrSet: jest.fn(),
  },
}));

// Mock du logger
jest.mock('@/lib/logger', () => ({
  logger: {
    createContextLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  },
}));

describe('OptimizedUserService', () => {
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    bio: 'Test bio',
    points: 100,
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLevel = {
    id: 'level123',
    userId: 'user123',
    level: 5,
    experience: 500,
    nextLevel: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserBadges = [
    {
      id: 'userBadge1',
      userId: 'user123',
      badgeId: 'badge1',
      createdAt: new Date(),
      badge: {
        id: 'badge1',
        name: 'Test Badge',
        description: 'Test Badge Description',
        image: 'badge.png',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurer les mocks par défaut
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.level.findUnique as jest.Mock).mockResolvedValue(mockLevel);
    (prisma.userBadge.findMany as jest.Mock).mockResolvedValue(mockUserBadges);
    (prisma.submission.count as jest.Mock).mockResolvedValue(10);
    (prisma.challengeParticipation.count as jest.Mock).mockResolvedValue(8);
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, bio: 'Updated bio' });

    // Mock de createCacheManager.getOrSet pour simuler le cache
    const mockCacheManager = createCacheManager('');
    (mockCacheManager.getOrSet as jest.Mock).mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    });
  });

  describe('getUserById', () => {
    it('devrait récupérer un utilisateur par son ID', async () => {
      const result = await OptimizedUserService.getUserById('user123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await OptimizedUserService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserLevel', () => {
    it('devrait récupérer le niveau d\'un utilisateur', async () => {
      const result = await OptimizedUserService.getUserLevel('user123');

      expect(prisma.level.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
      expect(result).toEqual(mockLevel);
    });
  });

  describe('getUserProfile', () => {
    it('devrait récupérer le profil complet d\'un utilisateur', async () => {
      const result = await OptimizedUserService.getUserProfile('user123');

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.level.findUnique).toHaveBeenCalled();
      expect(prisma.userBadge.findMany).toHaveBeenCalled();
      expect(prisma.submission.count).toHaveBeenCalled();
      expect(prisma.challengeParticipation.count).toHaveBeenCalled();

      expect(result).toEqual(expect.objectContaining({
        ...mockUser,
        level: mockLevel,
        badges: [mockUserBadges[0].badge],
        stats: {
          submissionsCount: 10,
          participationsCount: 8,
          completionRate: 80,
        },
      }));
    });

    it('devrait lancer une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(OptimizedUserService.getUserProfile('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur et invalider le cache', async () => {
      const updateData = { bio: 'Updated bio' };
      const result = await OptimizedUserService.updateUser('user123', updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: updateData,
      });
      
      // Vérifier que le cache a été invalidé
      const mockCacheManager = createCacheManager('');
      expect(mockCacheManager.invalidate).toHaveBeenCalled();
      
      expect(result).toEqual(expect.objectContaining({
        id: 'user123',
        bio: 'Updated bio',
      }));
    });
  });

  describe('getSessionUser', () => {
    it('devrait récupérer les données de session d\'un utilisateur', async () => {
      const result = await OptimizedUserService.getSessionUser('user123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          role: true,
        }),
      });
      expect(result).toEqual(expect.objectContaining({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      }));
    });

    it('devrait lancer une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(OptimizedUserService.getSessionUser('nonexistent')).rejects.toThrow();
    });
  });

  describe('invalidateUserCache', () => {
    it('devrait invalider toutes les entrées de cache liées à un utilisateur', async () => {
      await OptimizedUserService.invalidateUserCache('user123');

      const mockCacheManager = createCacheManager('');
      expect(mockCacheManager.invalidate).toHaveBeenCalledTimes(4);
      expect(cacheService.invalidateByTag).toHaveBeenCalled();
    });
  });
}); 