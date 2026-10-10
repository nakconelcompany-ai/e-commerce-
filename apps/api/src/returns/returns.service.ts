import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { commissionReversalForRefund } from '@nuvora/shared';
import { LedgerEntryType } from '@prisma/client';

export interface CreateReturnRequestDto {
  orderId: string;
  sellerOrderId: string;
  reason: string;
  details: string;
}

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateReturnRequestDto) {
    const sOrder = await this.prisma.sellerOrder.findUnique({
      where: { id: dto.sellerOrderId },
      include: { parentOrder: true },
    });
    if (!sOrder) throw new NotFoundException('Seller order not found');

    return this.prisma.returnRequest.create({
      data: {
        orderId: dto.orderId,
        sellerOrderId: dto.sellerOrderId,
        customerId,
        reason: dto.reason,
        details: dto.details,
        status: 'PENDING',
        refundAmountMinor: sOrder.subtotalMinor,
      },
    });
  }

  async updateStatus(returnId: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') {
    const ret = await this.prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { sellerOrder: true },
    });
    if (!ret) throw new NotFoundException('Return request not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.returnRequest.update({
        where: { id: returnId },
        data: { status },
      });

      if (status === 'COMPLETED') {
        const commReversal = commissionReversalForRefund(
          ret.sellerOrder.commissionAmountMinor,
          ret.sellerOrder.subtotalMinor,
          ret.refundAmountMinor,
        );

        const prevLedger = await tx.sellerLedgerEntry.findFirst({
          where: { sellerId: ret.sellerOrder.sellerId },
          orderBy: { createdAt: 'desc' },
        });

        const currentBalance = prevLedger ? prevLedger.balanceAfterMinor : 0;
        const netDeduction = ret.sellerOrder.sellerEarningMinor;
        const newBalance = currentBalance - netDeduction;

        await tx.sellerLedgerEntry.create({
          data: {
            sellerId: ret.sellerOrder.sellerId,
            sellerOrderId: ret.sellerOrder.id,
            entryType: LedgerEntryType.REFUND_REVERSAL,
            amountMinor: -netDeduction,
            balanceAfterMinor: newBalance,
            reference: `REFUND-${ret.id}`,
            description: `Refund reversal for return ${ret.id}. Reversed commission: ${commReversal / 100} NGN`,
          },
        });
      }

      return updated;
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.returnRequest.findMany({
      where: { customerId },
      include: { sellerOrder: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
