import { Minor, assertMinor, mulBps, mulDivRound } from './money';

/**
 * COMMISSION POLICY (defaults; every number is configurable, nothing is hardcoded):
 *  - Commission applies to PRODUCT VALUE only: (unit price x quantity) minus SELLER-FUNDED discounts.
 *  - Delivery fees and taxes are excluded from the commission base.
 *  - PLATFORM-FUNDED discounts do not reduce the commission base (the platform absorbs them).
 *  - Platform-owned products never generate seller commission.
 *  - Refunds reverse commission proportionally to the refunded share of the commission base.
 *  - Rate precedence: seller-specific > category-specific > global default.
 *    Within one scope the rule with the latest effectiveFrom that is active "at" the order time wins.
 */
export type CommissionScope = 'global' | 'category' | 'seller';

export interface CommissionRule {
  id: string;
  scope: CommissionScope;
  sellerId?: string | null;
  categoryId?: string | null;
  rateBps: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  active: boolean;
}

const PRECEDENCE: CommissionScope[] = ['seller', 'category', 'global'];

export function resolveCommissionRate(
  rules: CommissionRule[],
  ctx: { sellerId: string; categoryId: string | null; at: Date },
): { rateBps: number; ruleId: string; scope: CommissionScope } {
  const at = ctx.at.getTime();
  const applicable = rules.filter((r) => {
    if (!r.active) return false;
    if (r.effectiveFrom.getTime() > at) return false;
    if (r.effectiveTo && r.effectiveTo.getTime() <= at) return false;
    if (r.scope === 'seller') return r.sellerId === ctx.sellerId;
    if (r.scope === 'category') return !!ctx.categoryId && r.categoryId === ctx.categoryId;
    return r.scope === 'global';
  });
  for (const scope of PRECEDENCE) {
    const inScope = applicable
      .filter((r) => r.scope === scope)
      .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime() || (a.id < b.id ? -1 : 1));
    if (inScope.length) {
      return { rateBps: inScope[0].rateBps, ruleId: inScope[0].id, scope };
    }
  }
  throw new Error('No commission rule applies; a global default rule must always exist');
}

export interface LineCommissionInput {
  unitPriceMinor: Minor;
  quantity: number;
  sellerFundedDiscountMinor: Minor;
  platformFundedDiscountMinor: Minor;
  rateBps: number;
  isPlatformOwned: boolean;
}

export interface LineCommissionResult {
  grossMinor: Minor;          // unit x qty
  commissionBaseMinor: Minor; // gross - seller-funded discount
  commissionMinor: Minor;
  sellerEarningMinor: Minor;  // base - commission
  customerPaysMinor: Minor;   // gross - seller-funded - platform-funded
}

export function calculateLineCommission(i: LineCommissionInput): LineCommissionResult {
  assertMinor(i.unitPriceMinor, 'unitPrice');
  assertMinor(i.sellerFundedDiscountMinor, 'sellerFundedDiscount');
  assertMinor(i.platformFundedDiscountMinor, 'platformFundedDiscount');
  if (!Number.isInteger(i.quantity) || i.quantity < 1) throw new RangeError('quantity must be >= 1');
  if (i.unitPriceMinor < 0 || i.sellerFundedDiscountMinor < 0 || i.platformFundedDiscountMinor < 0) {
    throw new RangeError('amounts cannot be negative');
  }
  const grossMinor = i.unitPriceMinor * i.quantity;
  assertMinor(grossMinor, 'gross');
  if (i.sellerFundedDiscountMinor + i.platformFundedDiscountMinor > grossMinor) {
    throw new RangeError('discounts cannot exceed the line value');
  }
  const commissionBaseMinor = grossMinor - i.sellerFundedDiscountMinor;
  const commissionMinor = i.isPlatformOwned ? 0 : mulBps(commissionBaseMinor, i.rateBps);
  return {
    grossMinor,
    commissionBaseMinor,
    commissionMinor,
    sellerEarningMinor: commissionBaseMinor - commissionMinor,
    customerPaysMinor: grossMinor - i.sellerFundedDiscountMinor - i.platformFundedDiscountMinor,
  };
}

/** Commission to reverse when part of a line is refunded. Never exceeds the original commission. */
export function commissionReversalForRefund(
  commissionMinor: Minor,
  commissionBaseMinor: Minor,
  refundedBaseMinor: Minor,
): Minor {
  if (refundedBaseMinor > commissionBaseMinor) {
    throw new RangeError('refund cannot exceed the commission base of the line');
  }
  if (commissionBaseMinor === 0 || commissionMinor === 0) return 0;
  return Math.min(commissionMinor, mulDivRound(commissionMinor, refundedBaseMinor, commissionBaseMinor));
}
