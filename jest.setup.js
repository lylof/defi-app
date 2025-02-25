import '@testing-library/jest-dom';

// Mock de PrismaClient
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    adminLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
})); 