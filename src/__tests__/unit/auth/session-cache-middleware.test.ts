import { NextRequest, NextResponse } from 'next/server';
import { sessionCacheMiddleware, invalidateSessionCache } from '@/lib/auth/session-cache-middleware';
import { cacheService } from '@/lib/cache-service';

// Mock des dépendances
jest.mock('@/lib/cache-service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidateByTag: jest.fn(),
  }
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    createContextLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  }
}));

describe('Session Cache Middleware', () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Créer un mock de NextRequest
    mockRequest = {
      nextUrl: { pathname: '/api/auth/session' },
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'mock-session-token' }),
      },
    } as unknown as NextRequest;
    
    // Créer un mock de NextResponse
    mockResponse = {
      status: 200,
      clone: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue({ user: { id: 'user123' } }),
    } as unknown as NextResponse;
    
    // Mock de NextResponse.next
    jest.spyOn(NextResponse, 'next').mockImplementation(() => mockResponse);
  });
  
  it('devrait passer la requête si le chemin n\'est pas /api/auth/session', async () => {
    mockRequest.nextUrl.pathname = '/api/autre';
    
    await sessionCacheMiddleware(mockRequest);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(cacheService.get).not.toHaveBeenCalled();
  });
  
  it('devrait passer la requête si aucun token de session n\'est trouvé', async () => {
    (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined);
    
    await sessionCacheMiddleware(mockRequest);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(cacheService.get).not.toHaveBeenCalled();
  });
  
  it('devrait retourner la session mise en cache si elle existe', async () => {
    const cachedSession = { user: { id: 'user123', name: 'Test User' } };
    (cacheService.get as jest.Mock).mockResolvedValue(cachedSession);
    
    const response = await sessionCacheMiddleware(mockRequest);
    
    expect(cacheService.get).toHaveBeenCalledWith('auth:session:mock-session-token');
    expect(response).toBeDefined();
    expect(NextResponse.next).not.toHaveBeenCalled();
  });
  
  it('devrait mettre en cache la session si la réponse est valide', async () => {
    // Simuler qu'il n'y a pas de session en cache
    (cacheService.get as jest.Mock).mockResolvedValue(null);
    
    await sessionCacheMiddleware(mockRequest);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(mockResponse.clone).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalled();
    expect(cacheService.set).toHaveBeenCalledWith(
      'auth:session:mock-session-token',
      { user: { id: 'user123' } },
      expect.objectContaining({
        ttl: 5 * 60 * 1000,
        tags: ['auth:session', 'user:user123']
      })
    );
  });
  
  it('devrait gérer les erreurs et continuer la requête', async () => {
    // Simuler une erreur
    (cacheService.get as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await sessionCacheMiddleware(mockRequest);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });
  
  it('devrait invalider le cache de session pour un utilisateur spécifique', async () => {
    await invalidateSessionCache('user123');
    
    expect(cacheService.invalidateByTag).toHaveBeenCalledWith('user:user123');
  });
}); 