import { renderHook, act } from '@testing-library/react';
import { useDbOperation } from '@/hooks/use-db-operation';
import { dbOperations } from '@/lib/database/db-operations';
import { toast } from 'sonner';

// Mock des dépendances
jest.mock('@/lib/database/db-operations', () => ({
  dbOperations: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useDbOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait gérer une opération réussie', async () => {
    const mockData = { id: 1, name: 'Test' };
    const onSuccess = jest.fn();
    
    (dbOperations.findUnique as jest.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useDbOperation<typeof mockData>('User', {
      onSuccess,
      successMessage: 'Success!',
    }));

    await act(async () => {
      const data = await result.current.findUnique(async () => mockData);
      expect(data).toEqual(mockData);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
    expect(toast.success).toHaveBeenCalledWith('Success!');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait gérer une erreur', async () => {
    const error = new Error('Test error');
    const onError = jest.fn();
    
    (dbOperations.findUnique as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useDbOperation<{ id: number }>('User', {
      onError,
      errorMessage: 'Error!',
    }));

    await act(async () => {
      try {
        await result.current.findUnique(async () => { throw error; });
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(toast.error).toHaveBeenCalledWith('Error!');
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait gérer l\'état de chargement', async () => {
    const { result } = renderHook(() => useDbOperation<{ id: number }>('User'));

    let loadingState = false;
    
    (dbOperations.findUnique as jest.Mock).mockImplementationOnce(async () => {
      loadingState = result.current.isLoading;
      return { id: 1 };
    });

    await act(async () => {
      await result.current.findUnique(async () => ({ id: 1 }));
    });

    expect(loadingState).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait supporter toutes les opérations de base de données', async () => {
    type TestType = { id: number };
    const { result } = renderHook(() => useDbOperation<TestType>('User'));

    // Test findUnique
    (dbOperations.findUnique as jest.Mock).mockResolvedValueOnce({ id: 1 });
    await act(async () => {
      const data = await result.current.findUnique<TestType>(async () => ({ id: 1 }));
      expect(data).toEqual({ id: 1 });
    });

    // Test findMany
    (dbOperations.findMany as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);
    await act(async () => {
      const data = await result.current.findMany<TestType>(async () => [{ id: 1 }]);
      expect(data).toEqual([{ id: 1 }]);
    });

    // Test create
    (dbOperations.create as jest.Mock).mockResolvedValueOnce({ id: 1 });
    await act(async () => {
      const data = await result.current.create(async () => ({ id: 1 }));
      expect(data).toEqual({ id: 1 });
    });

    // Test update
    (dbOperations.update as jest.Mock).mockResolvedValueOnce({ id: 1 });
    await act(async () => {
      const data = await result.current.update(async () => ({ id: 1 }));
      expect(data).toEqual({ id: 1 });
    });

    // Test delete
    (dbOperations.delete as jest.Mock).mockResolvedValueOnce({ id: 1 });
    await act(async () => {
      const data = await result.current.delete(async () => ({ id: 1 }));
      expect(data).toEqual({ id: 1 });
    });

    // Test transaction
    (dbOperations.transaction as jest.Mock).mockResolvedValueOnce({ id: 1 });
    await act(async () => {
      const data = await result.current.transaction(async () => ({ id: 1 }));
      expect(data).toEqual({ id: 1 });
    });

    // Vérifier que toutes les opérations ont été appelées
    expect(dbOperations.findUnique).toHaveBeenCalled();
    expect(dbOperations.findMany).toHaveBeenCalled();
    expect(dbOperations.create).toHaveBeenCalled();
    expect(dbOperations.update).toHaveBeenCalled();
    expect(dbOperations.delete).toHaveBeenCalled();
    expect(dbOperations.transaction).toHaveBeenCalled();
  });
}); 