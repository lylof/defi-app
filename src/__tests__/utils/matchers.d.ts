declare namespace jest {
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
    toBeValidDate(): R;
    toBeValidISOString(): R;
  }
} 