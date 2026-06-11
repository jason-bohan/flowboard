import { test, expect } from 'vitest';
import { negate } from './negate';

test('negate positive', () => { expect(negate(5)).toBe(-5); });
test('negate negative', () => { expect(negate(-3)).toBe(3); });
test('negate zero', () => { expect(negate(0)).toBe(0); });
