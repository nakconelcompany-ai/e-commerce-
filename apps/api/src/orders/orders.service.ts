import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, SellerOrderStatus, ShipmentStatus } from '@prisma/client';
import {
  calculateLineCommission,
  resolveCommissionRate,
  deriveParentOrderStatus,
  assertTransition,
  SELLER_ORDER_TRANSITIONS,
  SHIPMENT_TRANSITIONS,
  ORDER_TRANSITIONS,
} from '@nuvora/shared';

export interface CreateOrderDto {
  deliveryAddress: {
    fullName: string;
    phone: string;
    state: string;
    city: string;
    streetAddress: string;
  };
  items: {
    variantId: string;
    quantity: number;
  }[];
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order items cannot be empty');
    }

    // 1. Fetch variant details with products & sellers
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          include: { seller: true, category: true },
        },
      },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('One or more selected product variants were not found');
    }

    // 2. Validate stock & group items by seller
    const sellerGroupMap = new Map<string, Array<{ variant: typeof variants[0]; quantity: number }>>();

    for (const item of dto.items) {
      const v = variants.find((variant) => variant.id === item.variantId);
      if (!v) throw new BadRequestException(`Variant ${item.variantId} not found`);

      if (v.stockQuantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${v.product.title} (${v.title}). Available: ${v.stockQuantity}`);
      }

      const sellerId = v.product.sellerId;
      if (!sellerGroupMap.has(sellerId)) {
        sellerGroupMap.set(sellerId, []);
      }
      sellerGroupMap.get(sellerId)!.push({ variant: v, quantity: item.quantity });
    }

    // 3. Fetch active commission rules
    const commissionRulesRaw = await this.prisma.commissionRule.findMany({ where: { active: true } });
    const commissionRules = commissionRulesRaw.map(r => ({
      ...r,
      scope: r.scope as 'global' | 'category' | 'seller',
    }));

    if (commissionRules.length === 0) {
      // Default rule fallback
      commissionRules.push({
        id: 'global-default',
        scope: 'global',
        sellerId: null,
        categoryId: null,
        rateBps: 500, // 5%
        effectiveFrom: new Date(0),
        effectiveTo: null,
        active: true,
        createdAt: new Date(),
      });
    }

    // 4. Perform atomic database transaction for order creation & stock reduction
    const parentOrderNumber = 'NUV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    return this.prisma.$transaction(async (tx) => {
      let parentSubtotalMinor = 0;
      let parentDeliveryFeeMinor = 0;

      const createdSellerOrders: Array<{
        sellerId: string;
        subtotalMinor: number;
        deliveryFeeMinor: number;
        totalAmountMinor: number;
        commissionAmountMinor: number;
        sellerEarningMinor: number;
        items: any[];
      }> = [];

      for (const [sellerId, sellerItems] of sellerGroupMap.entries()) {
        let sellerSubtotalMinor = 0;
        let sellerCommissionMinor = 0;
        let sellerEarningMinor = 0;
        const processedItems: any[] = [];

        for (const item of sellerItems) {
          const v = item.variant;
          const lineGross = v.priceMinor * item.quantity;
          sellerSubtotalMinor += lineGross;

          const rateInfo = resolveCommissionRate(commissionRules, {
            sellerId,
            categoryId: v.product.categoryId,
            at: new Date(),
          });

          const commResult = calculateLineCommission({
            unitPriceMinor: v.priceMinor,
            quantity: item.quantity,
            sellerFundedDiscountMinor: 0,
            platformFundedDiscountMinor: 0,
            rateBps: rateInfo.rateBps,
            isPlatformOwned: v.product.isPlatformOwned,
          });

          sellerCommissionMinor += commResult.commissionMinor;
          sellerEarningMinor += commResult.sellerEarningMinor;

          processedItems.push({
            productId: v.productId,
            variantId: v.id,
            productTitle: v.product.title,
            variantTitle: v.title,
            sku: v.sku,
            unitPriceMinor: v.priceMinor,
            quantity: item.quantity,
            sellerFundedDiscountMinor: 0,
            platformFundedDiscountMinor: 0,
            grossMinor: commResult.grossMinor,
            commissionBaseMinor: commResult.commissionBaseMinor,
            commissionMinor: commResult.commissionMinor,
            sellerEarningMinor: commResult.sellerEarningMinor,
          });

          // Atomic Stock Reduction
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }

        const deliveryFeeMinor = 150000; // Flat 1,500 NGN delivery fee per seller shipment
        parentSubtotalMinor += sellerSubtotalMinor;
        parentDeliveryFeeMinor += deliveryFeeMinor;

        createdSellerOrders.push({
          sellerId,
          subtotalMinor: sellerSubtotalMinor,
          deliveryFeeMinor,
          totalAmountMinor: sellerSubtotalMinor + deliveryFeeMinor,
          commissionAmountMinor: sellerCommissionMinor,
          sellerEarningMinor,
          items: processedItems,
        });
      }

      const totalAmountMinor = parentSubtotalMinor + parentDeliveryFeeMinor;

      // Create Parent Order
      const parentOrder = await tx.order.create({
        data: {
          orderNumber: parentOrderNumber,
          customerId,
          status: OrderStatus.pending_payment,
          subtotalMinor: parentSubtotalMinor,
          deliveryFeeMinor: parentDeliveryFeeMinor,
          totalAmountMinor,
          deliveryAddress: dto.deliveryAddress as any,
        },
      });

      // Create Seller Orders & OrderItems & Initial Shipments
      for (let i = 0; i < createdSellerOrders.length; i++) {
        const sData = createdSellerOrders[i];
        const sellerOrderNumber = `${parentOrderNumber}-S${i + 1}`;

        const sOrder = await tx.sellerOrder.create({
          data: {
            orderNumber: sellerOrderNumber,
            parentOrderId: parentOrder.id,
            sellerId: sData.sellerId,
            status: SellerOrderStatus.pending_payment,
            subtotalMinor: sData.subtotalMinor,
            deliveryFeeMinor: sData.deliveryFeeMinor,
            totalAmountMinor: sData.totalAmountMinor,
            commissionAmountMinor: sData.commissionAmountMinor,
            sellerEarningMinor: sData.sellerEarningMinor,
            items: {
              create: sData.items.map((it) => ({
                ...it,
                parentOrderId: parentOrder.id,
              })),
            },
          },
        });

        await tx.shipment.create({
          data: {
            sellerOrderId: sOrder.id,
            status: ShipmentStatus.awaiting_processing,
          },
        });
      }

      // Clear customer cart
      await tx.cartItem.deleteMany({ where: { customerId } });

      return tx.order.findUnique({
        where: { id: parentOrder.id },
        include: {
          sellerOrders: {
            include: { items: true, shipments: true, seller: true },
          },
        },
      });
    });
  }

  async getCustomerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        sellerOrders: {
          include: { items: true, shipments: true, seller: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        sellerOrders: {
          include: { items: true, shipments: true, seller: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (role === 'CUSTOMER' && order.customerId !== userId) {
      throw new ForbiddenException('Access to this order is restricted');
    }
    return order;
  }

  async getSellerOrders(sellerId: string) {
    return this.prisma.sellerOrder.findMany({
      where: { sellerId },
      include: {
        parentOrder: true,
        items: true,
        shipments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSellerOrderStatus(sellerOrderId: string, sellerId: string, newStatus: SellerOrderStatus, trackingNumber?: string, carrierName?: string) {
    const sOrder = await this.prisma.sellerOrder.findUnique({ where: { id: sellerOrderId }, include: { parentOrder: true, shipments: true } });
    if (!sOrder) throw new NotFoundException('Seller order not found');
    if (sOrder.sellerId !== sellerId) throw new ForbiddenException('Unauthorized access to seller order');

    // Assert State Transition
    assertTransition('SellerOrder', SELLER_ORDER_TRANSITIONS, sOrder.status, newStatus);

    return this.prisma.$transaction(async (tx) => {
      const updatedSOrder = await tx.sellerOrder.update({
        where: { id: sellerOrderId },
        data: {
          status: newStatus,
          trackingNumber: trackingNumber ?? sOrder.trackingNumber,
          carrierName: carrierName ?? sOrder.carrierName,
        },
      });

      // Sync shipment status if ready_for_dispatch or dispatched
      if (newStatus === 'dispatched' && sOrder.shipments.length > 0) {
        await tx.shipment.update({
          where: { id: sOrder.shipments[0].id },
          data: {
            status: ShipmentStatus.dispatched,
            trackingNumber: trackingNumber ?? sOrder.trackingNumber,
            carrier: carrierName ?? sOrder.carrierName,
          },
        });
      }

      // Re-derive Parent Order status from all sibling seller orders
      const siblingSellerOrders = await tx.sellerOrder.findMany({
        where: { parentOrderId: sOrder.parentOrderId },
      });

      const childStatuses = siblingSellerOrders.map((so) => so.status as any);
      const derivedParentStatus = deriveParentOrderStatus(childStatuses);

      await tx.order.update({
        where: { id: sOrder.parentOrderId },
        data: { status: derivedParentStatus as OrderStatus },
      });

      return updatedSOrder;
    });
  }
}
