import { dbOperations } from '@/lib/database/db-operations';
import { databaseService } from '@/lib/db';

// Mock du DatabaseService
jest.mock('@/lib/db', () => ({
  databaseService: {
    executeWithRetry: jest.fn(),
  },
}));

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUnique', () => {
    it('devrait exécuter une opération findUnique', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ id: 1 });
      await dbOperations.findUnique('User', mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'find unique User'
      );
    });

    it('devrait gérer les erreurs', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('DB Error'));
      
      await expect(dbOperations.findUnique('User', mockOperation))
        .rejects
        .toThrow('DB Error');
    });
  });

  describe('findMany', () => {
    it('devrait exécuter une opération findMany', async () => {
      const mockOperation = jest.fn().mockResolvedValue([{ id: 1 }]);
      await dbOperations.findMany('User', mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'find many User'
      );
    });
  });

  describe('create', () => {
    it('devrait exécuter une opération create', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ id: 1 });
      await dbOperations.create('User', mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'create User'
      );
    });
  });

  describe('update', () => {
    it('devrait exécuter une opération update', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ id: 1 });
      await dbOperations.update('User', mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'update User'
      );
    });
  });

  describe('delete', () => {
    it('devrait exécuter une opération delete', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ id: 1 });
      await dbOperations.delete('User', mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'delete User'
      );
    });
  });

  describe('transaction', () => {
    it('devrait exécuter une transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ id: 1 });
      await dbOperations.transaction(mockOperation);

      expect(databaseService.executeWithRetry).toHaveBeenCalledWith(
        mockOperation,
        'transaction'
      );
    });
  });
}); 