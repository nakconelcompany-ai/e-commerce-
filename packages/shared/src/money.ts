/**
 * All money in Nuvora is stored and computed as INTEGER MINOR UNITS (kobo for NGN).
 * Floating point is never used for money. Multiplications that could exceed 2^53 use BigInt.
 */
export type Minor = number;

export function assertMinor(value: number, label = 'amount'): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a safe integer in minor units, got ${value}`);
  }
}

export const nairaToKobo = (naira: number): Minor => {
  const k = Math.round(naira * 100);
  assertMinor(k, 'naira amount');
  return k;
};

/** amount * bps / 10_000, rounded half-up, exact (BigInt). */
export function mulBps(amountMinor: Minor, bps: number): Minor {
  assertMinor(amountMinor, 'amount');
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new RangeError(`bps must be an integer between 0 and 10000, got ${bps}`);
  }
  const num = BigInt(amountMinor) * BigInt(bps);
  const sign = num < 0n ? -1n : 1n;
  const abs = num < 0n ? -num : num;
  return Number(sign * ((abs + 5_000n) / 10_000n));
}

/** a * b / c rounded half-up (non-negative inputs), exact. */
export function mulDivRound(a: Minor, b: Minor, c: Minor): Minor {
  assertMinor(a); assertMinor(b); assertMinor(c);
  if (c === 0) throw new RangeError('division by zero');
  if (a < 0 || b < 0 || c < 0) throw new RangeError('mulDivRound expects non-negative inputs');
  const num = BigInt(a) * BigInt(b);
  return Number((num * 2n + BigInt(c)) / (BigInt(c) * 2n));
}

export function formatMoney(minor: Minor, currency = 'NGN', locale = 'en-NG'): string {
  assertMinor(minor);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}
