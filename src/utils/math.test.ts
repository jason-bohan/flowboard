import { add, subtract, multiply, divide } from './math';
import { describe, it, expect } from 'vitest';

describe('math', () => {
  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(1, 2)).toBe(3);
    });
  });

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      expect(subtract(3, 2)).toBe(1);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      expect(divide(6, 3)).toBe(2);
    });

    it('throws an error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Cannot divide by zero');
    });
  });
});
