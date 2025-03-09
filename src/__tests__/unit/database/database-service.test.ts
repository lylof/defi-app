import { DatabaseService } from '@/lib/database/database-service';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
  })),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = DatabaseService.getInstance();
  });

  describe('getInstance', () => {
    it('devrait retourner la même instance', () => {
      const instance1 = DatabaseService.getInstance();
      const instance2 = DatabaseService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('connect', () => {
    it('devrait se connecter avec succès', async () => {
      const prisma = service.getPrisma();
      await service.connect();
      expect(prisma.$connect).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const prisma = service.getPrisma();
      (prisma.$connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(service.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('executeWithRetry', () => {
    it('devrait exécuter l\'opération avec succès', async () => {
      const operation = jest.fn().mockResolvedValueOnce('success');
      const result = await service.executeWithRetry(operation, 'test');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('devrait réessayer en cas d\'erreur de connexion', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ kind: 'Closed' })
        .mockResolvedValueOnce('success');

      const result = await service.executeWithRetry(operation, 'test');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('devrait échouer après le nombre maximum de tentatives', async () => {
      const operation = jest.fn().mockRejectedValue({ kind: 'Closed' });
      
      await expect(service.executeWithRetry(operation, 'test'))
        .rejects
        .toThrow('Failed test after 3 attempts');
    });

    it('devrait ne pas réessayer pour les erreurs non liées à la connexion', async () => {
      const operation = jest.fn().mockRejectedValueOnce(new Error('Business logic error'));
      
      await expect(service.executeWithRetry(operation, 'test'))
        .rejects
        .toThrow('Business logic error');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
}); 