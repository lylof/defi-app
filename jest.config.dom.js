/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@auth/(.*)$': '<rootDir>/src/__mocks__/@auth/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.dom.js'],
  testMatch: [
    '**/__tests__/hooks/**/*.test.ts?(x)',
    '**/__tests__/components/**/*.test.ts?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 10000,
  transformIgnorePatterns: [
    '/node_modules/(?!(@auth|next-auth|@prisma)/).*'
  ],
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/src'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/unit/',
    '/integration/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

module.exports = config; 