export function negate(value: number): number {
  // Avoid -0 so negate(0) === +0 (Object.is-safe).
  return value === 0 ? 0 : -value;
}
