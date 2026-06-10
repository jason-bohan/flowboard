import { double } from './double';

test('double works', () => {
  expect(double(2)).toBe(4);
  expect(double(-3)).toBe(-6);
});
