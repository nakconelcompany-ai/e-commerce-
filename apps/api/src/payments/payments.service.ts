import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, SellerOrderStatus, PaymentStatus, LedgerEntryType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async initializePayment(orderId: string, customerEmail: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.pending_payment) {
      throw new BadRequestException(`Order cannot be paid in current status: ${order.status}`);
    }

    const reference = `PAY-${order.orderNumber}-${Date.now()}`;
    const paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    let authorizationUrl = `https://checkout.paystack.com/simulate-checkout?reference=${reference}`;

    // If real Paystack key is configured, initialize with Paystack REST API
    if (paystackSecret && paystackSecret.startsWith('sk_live_')) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: order.totalAmountMinor, // Minor units (kobo)
            email: customerEmail || order.customer.email,
            reference,
            currency: 'NGN',
            callback_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/checkout/callback?reference=${reference}`,
          }),
        });
        const resData: any = await response.json();
        if (resData.status && resData.data?.authorization_url) {
          authorizationUrl = resData.data.authorization_url;
        }
      } catch (err) {
        this.logger.error('Failed to initialize Paystack online checkout', err);
      }
    }

    // Save payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        reference,
        provider: 'paystack',
        amountMinor: order.totalAmountMinor,
        currency: 'NGN',
        status: PaymentStatus.initialized,
        authorizationUrl,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: reference },
    });

    return {
      reference,
      authorizationUrl,
      amountMinor: order.totalAmountMinor,
      currency: 'NGN',
    };
  }

  async verifyPayment(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: { order: { include: { sellerOrders: true } } },
    });
    if (!payment) throw new NotFoundException('Payment reference not found');

    if (payment.status === PaymentStatus.success) {
      return { status: 'success', message: 'Payment already verified successfully', payment };
    }

    // Mark Payment as Success & Process Order State Transition
    return this.processPaymentSuccess(payment.id);
  }

  async processPaymentSuccess(paymentId: string, rawPayload?: any) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              sellerOrders: {
                include: { seller: true },
              },
            },
          },
        },
      });

      if (!payment || payment.status === PaymentStatus.success) {
        return payment;
      }

      // Update Payment status to success
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.success,
          rawResponse: rawPayload || payment.rawResponse,
        },
      });

      // Update Parent Order status to PAID
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.paid,
          paidAt: new Date(),
        },
      });

      // Update Seller Orders status to awaiting_processing & Record Seller Ledger Entries
      for (const sellerOrder of payment.order.sellerOrders) {
        await tx.sellerOrder.update({
          where: { id: sellerOrder.id },
          data: { status: SellerOrderStatus.awaiting_processing },
        });

        // Record Seller Earning Ledger Entry
        const prevLedger = await tx.sellerLedgerEntry.findFirst({
          where: { sellerId: sellerOrder.sellerId },
          orderBy: { createdAt: 'desc' },
        });
        const currentBalance = prevLedger ? prevLedger.balanceAfterMinor : 0;
        const newBalance = currentBalance + sellerOrder.sellerEarningMinor;

        await tx.sellerLedgerEntry.create({
          data: {
            sellerId: sellerOrder.sellerId,
            sellerOrderId: sellerOrder.id,
            entryType: LedgerEntryType.SALE_EARNING,
            amountMinor: sellerOrder.sellerEarningMinor,
            balanceAfterMinor: newBalance,
            reference: payment.reference,
            description: `Sale net earning for order ${sellerOrder.orderNumber} (Gross: ${sellerOrder.subtotalMinor / 100} NGN, Comm: ${sellerOrder.commissionAmountMinor / 100} NGN)`,
          },
        });
      }

      return updatedPayment;
    });
  }

  verifyWebhookSignature(signature: string, rawBody: Buffer | string): boolean {
    const webhookSecret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || 'whsec_placeholder';
    const hash = crypto.createHmac('sha512', webhookSecret).update(rawBody).digest('hex');
    return hash === signature;
  }
}
