import { describe, it, expect } from 'vitest';
import { triple } from './triple';
describe('triple()', () => {
  it('triples a number', () => {
    expect(triple(5)).toBe(15);
  });
  it('works with zero', () => {
    expect(triple(0)).toBe(0);
  });
  it('works with negative numbers', () => {
    expect(triple(-3)).toBe(-9);
  });
});