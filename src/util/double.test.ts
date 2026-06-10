import { double } from './double';

test('double multiplies by two', () => {
  expect(double(3)).toBe(6);
  expect(double(-4)).toBe(-8);
});
