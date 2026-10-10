import {
  mulBps, mulDivRound, assertMinor, formatMoney,
  resolveCommissionRate, calculateLineCommission, commissionReversalForRefund, CommissionRule,
  normalizeNigerianPhone,
  canTransition, assertTransition, InvalidTransitionError, deriveParentOrderStatus,
  ORDER_TRANSITIONS, SELLER_ORDER_TRANSITIONS, SHIPMENT_TRANSITIONS, PAYMENT_TRANSITIONS,
  ORDER_STATUSES, SELLER_ORDER_STATUSES, SHIPMENT_STATUSES, PAYMENT_STATUSES,
} from './index';

describe('money', () => {
  it('rounds half-up exactly', () => {
    expect(mulBps(10_000, 500)).toBe(500);       // 5% of N100
    expect(mulBps(1_999, 500)).toBe(100);        // 99.95 -> 100
    expect(mulBps(1_990, 500)).toBe(100);        // 99.5 -> 100
    expect(mulBps(1_989, 500)).toBe(99);         // 99.45 -> 99
  });
  it('handles very large amounts without float error', () => {
    expect(mulBps(900_000_000_000_000, 1)).toBe(90_000_000_000);
  });
  it('rejects non-integers and bad bps', () => {
    expect(() => assertMinor(10.5)).toThrow();
    expect(() => mulBps(100, 10_001)).toThrow();
    expect(() => mulBps(100, 1.5)).toThrow();
  });
  it('mulDivRound is exact', () => {
    expect(mulDivRound(500, 1, 3)).toBe(167);
    expect(() => mulDivRound(1, 1, 0)).toThrow();
  });
  it('formats naira', () => {
    expect(formatMoney(150_000)).toContain('1,500');
  });
});

describe('commission', () => {
  const d = (s: string) => new Date(s);
  const rules: CommissionRule[] = [
    { id: 'g1', scope: 'global', rateBps: 500, effectiveFrom: d('2026-01-01'), active: true },
    { id: 'c1', scope: 'category', categoryId: 'cat-a', rateBps: 800, effectiveFrom: d('2026-01-01'), active: true },
    { id: 's1', scope: 'seller', sellerId: 'seller-1', rateBps: 300, effectiveFrom: d('2026-01-01'), active: true },
    { id: 's1-old', scope: 'seller', sellerId: 'seller-1', rateBps: 200, effectiveFrom: d('2025-01-01'), active: true },
    { id: 's2-future', scope: 'seller', sellerId: 'seller-2', rateBps: 100, effectiveFrom: d('2030-01-01'), active: true },
    { id: 'c-off', scope: 'category', categoryId: 'cat-b', rateBps: 999, effectiveFrom: d('2026-01-01'), active: false },
  ];
  const at = d('2026-06-01');
  it('seller-specific beats category beats global', () => {
    expect(resolveCommissionRate(rules, { sellerId: 'seller-1', categoryId: 'cat-a', at }).ruleId).toBe('s1');
    expect(resolveCommissionRate(rules, { sellerId: 'seller-9', categoryId: 'cat-a', at }).ruleId).toBe('c1');
    expect(resolveCommissionRate(rules, { sellerId: 'seller-9', categoryId: 'cat-z', at }).ruleId).toBe('g1');
  });
  it('ignores inactive and future rules, uses latest effective rule in a scope', () => {
    expect(resolveCommissionRate(rules, { sellerId: 'seller-2', categoryId: 'cat-b', at }).ruleId).toBe('g1');
  });
  it('respects effectiveTo', () => {
    const r: CommissionRule[] = [
      { id: 'g', scope: 'global', rateBps: 500, effectiveFrom: d('2026-01-01'), active: true },
      { id: 'x', scope: 'seller', sellerId: 's', rateBps: 100, effectiveFrom: d('2026-01-01'), effectiveTo: d('2026-03-01'), active: true },
    ];
    expect(resolveCommissionRate(r, { sellerId: 's', categoryId: null, at }).ruleId).toBe('g');
  });
  it('throws if no global default exists', () => {
    expect(() => resolveCommissionRate([], { sellerId: 's', categoryId: null, at })).toThrow();
  });
  it('commission applies to product value net of seller-funded discount only', () => {
    const r = calculateLineCommission({
      unitPriceMinor: 1_000_000, quantity: 2, sellerFundedDiscountMinor: 200_000,
      platformFundedDiscountMinor: 100_000, rateBps: 500, isPlatformOwned: false,
    });
    expect(r.grossMinor).toBe(2_000_000);
    expect(r.commissionBaseMinor).toBe(1_800_000);
    expect(r.commissionMinor).toBe(90_000);
    expect(r.sellerEarningMinor).toBe(1_710_000);
    expect(r.customerPaysMinor).toBe(1_700_000);
  });
  it('platform-owned products never carry commission', () => {
    const r = calculateLineCommission({
      unitPriceMinor: 500_000, quantity: 1, sellerFundedDiscountMinor: 0,
      platformFundedDiscountMinor: 0, rateBps: 500, isPlatformOwned: true,
    });
    expect(r.commissionMinor).toBe(0);
  });
  it('rejects discounts bigger than the line', () => {
    expect(() => calculateLineCommission({
      unitPriceMinor: 100, quantity: 1, sellerFundedDiscountMinor: 80,
      platformFundedDiscountMinor: 30, rateBps: 500, isPlatformOwned: false,
    })).toThrow();
  });
  it('reverses commission proportionally on partial refund and never over-reverses', () => {
    expect(commissionReversalForRefund(90_000, 1_800_000, 900_000)).toBe(45_000);
    expect(commissionReversalForRefund(90_000, 1_800_000, 1_800_000)).toBe(90_000);
    expect(() => commissionReversalForRefund(90_000, 1_800_000, 1_800_001)).toThrow();
    expect(commissionReversalForRefund(0, 1_800_000, 100)).toBe(0);
  });
});

describe('nigerian phone numbers', () => {
  it.each([
    ['08031234567', '+2348031234567'],
    ['+234 803 123 4567', '+2348031234567'],
    ['2347012345678', '+2347012345678'],
    ['0901-234-5678', '+2349012345678'],
  ])('normalises %s', (input, expected) => expect(normalizeNigerianPhone(input)).toBe(expected));
  it.each(['0803123456', '12345', '+4478123456789', '08231234567', '', 'abc'])('rejects %s', (v) =>
    expect(normalizeNigerianPhone(v)).toBeNull());
});

describe('state machines', () => {
  it('allows valid and blocks invalid transitions', () => {
    expect(canTransition(ORDER_TRANSITIONS, 'pending_payment', 'paid')).toBe(true);
    expect(canTransition(ORDER_TRANSITIONS, 'pending_payment', 'delivered')).toBe(false);
    expect(canTransition(SELLER_ORDER_TRANSITIONS, 'processing', 'delivered')).toBe(false);
    expect(canTransition(SHIPMENT_TRANSITIONS, 'delivered', 'preparing')).toBe(false);
    expect(canTransition(PAYMENT_TRANSITIONS, 'failed', 'success')).toBe(false);
    expect(() => assertTransition('order', ORDER_TRANSITIONS, 'cancelled', 'paid')).toThrow(InvalidTransitionError);
  });
  it('every machine defines every status and only references known statuses', () => {
    const check = (statuses: readonly string[], m: Record<string, readonly string[]>) => {
      expect(Object.keys(m).sort()).toEqual([...statuses].sort());
      for (const to of Object.values(m).flat()) expect(statuses).toContain(to);
    };
    check(ORDER_STATUSES, ORDER_TRANSITIONS);
    check(SELLER_ORDER_STATUSES, SELLER_ORDER_TRANSITIONS);
    check(SHIPMENT_STATUSES, SHIPMENT_TRANSITIONS);
    check(PAYMENT_STATUSES, PAYMENT_TRANSITIONS);
  });
  it('one seller delivering does not deliver the whole order', () => {
    expect(deriveParentOrderStatus(['delivered', 'processing'])).toBe('partially_delivered');
    expect(deriveParentOrderStatus(['delivered', 'delivered'])).toBe('delivered');
    expect(deriveParentOrderStatus(['awaiting_processing', 'awaiting_processing'])).toBe('paid');
    expect(deriveParentOrderStatus(['processing', 'awaiting_processing'])).toBe('processing');
    expect(deriveParentOrderStatus(['cancelled', 'cancelled'])).toBe('cancelled');
    expect(deriveParentOrderStatus(['cancelled', 'delivered'])).toBe('partially_cancelled');
    expect(deriveParentOrderStatus(['completed', 'completed'])).toBe('completed');
  });
});
