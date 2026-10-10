/**
 * Explicit, validated state machines. The API refuses any transition not listed here.
 * Parent orders are DERIVED from seller orders after payment, so one seller delivering
 * never marks the whole checkout delivered.
 */
export type Transitions<S extends string> = Readonly<Record<S, readonly S[]>>;

export class InvalidTransitionError extends Error {
  constructor(public readonly machine: string, public readonly from: string, public readonly to: string) {
    super(`Invalid ${machine} transition: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function canTransition<S extends string>(m: Transitions<S>, from: S, to: S): boolean {
  return (m[from] ?? []).includes(to);
}

export function assertTransition<S extends string>(machine: string, m: Transitions<S>, from: S, to: S): void {
  if (!canTransition(m, from, to)) throw new InvalidTransitionError(machine, from, to);
}

// ---- Payment -------------------------------------------------------------
export const PAYMENT_STATUSES = [
  'initialized', 'pending', 'success', 'failed', 'abandoned', 'partially_refunded', 'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_TRANSITIONS: Transitions<PaymentStatus> = {
  initialized: ['pending', 'success', 'failed', 'abandoned'],
  pending: ['success', 'failed', 'abandoned'],
  success: ['partially_refunded', 'refunded'],
  failed: [],
  abandoned: ['success'], // a late webhook can still confirm an abandoned attempt
  partially_refunded: ['partially_refunded', 'refunded'],
  refunded: [],
};

// ---- Parent order (customer checkout) -------------------------------------
export const ORDER_STATUSES = [
  'pending_payment', 'payment_failed', 'expired', 'paid', 'processing',
  'partially_delivered', 'delivered', 'partially_cancelled', 'cancelled', 'completed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_TRANSITIONS: Transitions<OrderStatus> = {
  pending_payment: ['paid', 'payment_failed', 'expired', 'cancelled'],
  payment_failed: ['pending_payment', 'expired', 'cancelled'],
  expired: [],
  paid: ['processing', 'partially_cancelled', 'cancelled'],
  processing: ['partially_delivered', 'delivered', 'partially_cancelled', 'cancelled'],
  partially_delivered: ['delivered', 'partially_cancelled'],
  partially_cancelled: ['processing', 'partially_delivered', 'delivered', 'cancelled'],
  delivered: ['completed'],
  cancelled: [],
  completed: [],
};

// ---- Seller order ----------------------------------------------------------
export const SELLER_ORDER_STATUSES = [
  'pending_payment', 'awaiting_processing', 'processing', 'ready_for_dispatch',
  'dispatched', 'delivered', 'delivery_failed', 'returned', 'cancelled', 'completed',
] as const;
export type SellerOrderStatus = (typeof SELLER_ORDER_STATUSES)[number];
export const SELLER_ORDER_TRANSITIONS: Transitions<SellerOrderStatus> = {
  pending_payment: ['awaiting_processing', 'cancelled'],
  awaiting_processing: ['processing', 'cancelled'],
  processing: ['ready_for_dispatch', 'cancelled'],
  ready_for_dispatch: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'delivery_failed'],
  delivery_failed: ['dispatched', 'returned'],
  delivered: ['completed', 'returned'],
  returned: [],
  cancelled: [],
  completed: [],
};

// ---- Shipment ---------------------------------------------------------------
export const SHIPMENT_STATUSES = [
  'awaiting_processing', 'preparing', 'dispatched', 'in_transit',
  'out_for_delivery', 'delivered', 'delivery_failed', 'returned',
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];
export const SHIPMENT_TRANSITIONS: Transitions<ShipmentStatus> = {
  awaiting_processing: ['preparing'],
  preparing: ['dispatched'],
  dispatched: ['in_transit', 'out_for_delivery', 'delivered', 'delivery_failed'],
  in_transit: ['out_for_delivery', 'delivered', 'delivery_failed'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivery_failed: ['out_for_delivery', 'dispatched', 'returned'],
  delivered: [],
  returned: [],
};

/** Derive the parent order status from its seller orders once the order has been paid. */
export function deriveParentOrderStatus(children: readonly SellerOrderStatus[]): OrderStatus {
  if (children.length === 0) throw new Error('A paid order must have at least one seller order');
  const active = children.filter((s) => s !== 'cancelled');
  if (active.length === 0) return 'cancelled';
  const hasCancelled = active.length !== children.length;
  const done = (s: SellerOrderStatus) => s === 'delivered' || s === 'completed';
  if (active.every((s) => s === 'completed')) return hasCancelled ? 'partially_cancelled' : 'completed';
  if (active.every(done)) return hasCancelled ? 'partially_cancelled' : 'delivered';
  if (active.some(done)) return 'partially_delivered';
  if (active.every((s) => s === 'awaiting_processing' || s === 'pending_payment')) {
    return hasCancelled ? 'partially_cancelled' : 'paid';
  }
  return hasCancelled ? 'partially_cancelled' : 'processing';
}
