import { describe, it, expect } from 'vitest';
import { square } from './square';

describe('square', () => {
  it('should return the square of a number', () => {
    expect(square(2)).toBe(4);
    expect(square(3)).toBe(9);
    expect(square(0)).toBe(0);
    expect(square(-2)).toBe(4);
  });
});
