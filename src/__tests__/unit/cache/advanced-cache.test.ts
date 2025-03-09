import { createCacheManager } from '@/lib/cache/advanced-cache';
import { cacheService } from '@/lib/cache-service';

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

describe('Advanced Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCacheManager', () => {
    const domain = 'testDomain';
    const cacheManager = createCacheManager(domain);

    it('devrait créer un gestionnaire de cache pour un domaine', () => {
      expect(cacheManager).toBeDefined();
      expect(cacheManager.getOrSet).toBeDefined();
      expect(cacheManager.invalidate).toBeDefined();
      expect(cacheManager.invalidateAll).toBeDefined();
    });

    describe('getOrSet', () => {
      it('devrait récupérer des données depuis le cache si elles existent', async () => {
        const key = 'testKey';
        const cachedData = { test: 'data' };
        (cacheService.getOrSet as jest.Mock).mockResolvedValue(cachedData);

        const fetchFn = jest.fn();
        const result = await cacheManager.getOrSet(key, fetchFn);

        expect(cacheService.getOrSet).toHaveBeenCalledWith(
          `${domain}:${key}`,
          expect.any(Function),
          expect.objectContaining({
            ttl: expect.any(Number),
            tags: [domain],
          })
        );
        expect(fetchFn).not.toHaveBeenCalled();
        expect(result).toEqual(cachedData);
      });

      it('devrait appeler la fonction de récupération si les données ne sont pas en cache', async () => {
        const key = 'testKey';
        const fetchedData = { test: 'fetchedData' };
        
        // Simuler que cacheService.getOrSet appelle la fonction fetchFn
        (cacheService.getOrSet as jest.Mock).mockImplementation(async (cacheKey, fetchFn) => {
          return await fetchFn();
        });
        
        const fetchFn = jest.fn().mockResolvedValue(fetchedData);
        const result = await cacheManager.getOrSet(key, fetchFn);

        expect(cacheService.getOrSet).toHaveBeenCalled();
        expect(fetchFn).toHaveBeenCalled();
        expect(result).toEqual(fetchedData);
      });

      it('devrait gérer les erreurs et appeler la fonction de récupération directement', async () => {
        const key = 'testKey';
        const fetchedData = { test: 'fetchedData' };
        
        // Simuler une erreur dans le service de cache
        (cacheService.getOrSet as jest.Mock).mockRejectedValue(new Error('Cache error'));
        
        const fetchFn = jest.fn().mockResolvedValue(fetchedData);
        const result = await cacheManager.getOrSet(key, fetchFn);

        expect(cacheService.getOrSet).toHaveBeenCalled();
        expect(fetchFn).toHaveBeenCalled();
        expect(result).toEqual(fetchedData);
      });
    });

    describe('invalidate', () => {
      it('devrait supprimer une entrée spécifique du cache', () => {
        const key = 'testKey';
        cacheManager.invalidate(key);

        expect(cacheService.delete).toHaveBeenCalledWith(`${domain}:${key}`);
      });
    });

    describe('invalidateAll', () => {
      it('devrait invalider toutes les entrées de cache pour le domaine', () => {
        cacheManager.invalidateAll();

        expect(cacheService.invalidateByTag).toHaveBeenCalledWith(domain);
      });
    });
  });
}); 