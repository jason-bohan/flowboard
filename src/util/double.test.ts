import { describe, expect, test } from 'vitest';
import { double } from './double';

describe('double util', () => {
  test('doubles positive numbers', () => {
    expect(double(2)).toBe(4);
    expect(double(5)).toBe(10);
  });

  test('doubles zero and negatives', () => {
    expect(double(0)).toBe(0);
    expect(double(-3)).toBe(-6);
  });
});
