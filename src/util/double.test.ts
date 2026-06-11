import { test, expect } from "vitest";
import { double } from "./double";

test('double multiplies by two', () => {
  expect(double(3)).toBe(6);
});
