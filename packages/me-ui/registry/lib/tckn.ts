import { digits } from "@/lib/normalize";

/**
 * T.C. kimlik numarası validation.
 *
 * The length and leading-digit rules alone accept roughly ten billion strings
 * that no citizen holds. The last two digits are check digits, and verifying
 * them rejects ~99% of those — which is what stops a typo from reaching the
 * policy system as a real-looking identity.
 *
 * - digits 1..9 feed two weighted sums
 * - digit 10 = (odd-position sum × 7 − even-position sum) mod 10
 * - digit 11 = (sum of the first ten digits) mod 10
 */
export function isValidTckn(value: string): boolean {
  const normalized = digits(value);
  if (!/^[1-9]\d{10}$/.test(normalized)) return false;

  const d = [...normalized].map(Number);

  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];

  // The subtraction can go negative, and JS `%` keeps the sign — so it is
  // wrapped back into 0..9 rather than trusted directly.
  const tenth = (((odd * 7 - even) % 10) + 10) % 10;
  if (tenth !== d[9]) return false;

  const eleventh = d.slice(0, 10).reduce((total, digit) => total + digit, 0) % 10;
  return eleventh === d[10];
}
