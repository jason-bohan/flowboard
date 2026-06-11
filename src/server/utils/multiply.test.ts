import { describe, it, expect } from 'vitest';
import { multiply } from './math';

describe('multiply', () => {
  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(-1, 5)).toBe(-5);
    expect(multiply(0, 10)).toBe(0);
  });
});
