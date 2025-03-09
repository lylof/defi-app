import { expect } from '@jest/globals';

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: any) {
    const date = new Date(received);
    const pass = date instanceof Date && !isNaN(date.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  toBeValidISOString(received: any) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    const pass = typeof received === 'string' && isoRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO string`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO string`,
        pass: false,
      };
    }
  },
}); 