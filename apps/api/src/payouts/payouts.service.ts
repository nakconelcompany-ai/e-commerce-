import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerEntryType, PayoutStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async requestPayout(sellerId: string, amountMinor: number) {
    const seller = await this.prisma.sellerProfile.findUnique({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller profile not found');
    if (!seller.bankAccountNumber || !seller.bankName) {
      throw new BadRequestException('Please complete bank account details before requesting payouts');
    }

    const lastLedger = await this.prisma.sellerLedgerEntry.findFirst({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = lastLedger ? lastLedger.balanceAfterMinor : 0;
    if (currentBalance < amountMinor) {
      throw new BadRequestException(`Insufficient payable balance (${currentBalance / 100} NGN available)`);
    }

    const reference = 'PAYOUT-' + Date.now();

    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.create({
        data: {
          sellerId,
          amountMinor,
          bankAccountName: seller.bankAccountName || seller.businessName,
          bankAccountNumber: seller.bankAccountNumber!,
          bankName: seller.bankName!,
          reference,
          status: PayoutStatus.PENDING,
        },
      });

      const newBalance = currentBalance - amountMinor;
      await tx.sellerLedgerEntry.create({
        data: {
          sellerId,
          entryType: LedgerEntryType.PAYOUT,
          amountMinor: -amountMinor,
          balanceAfterMinor: newBalance,
          reference,
          description: `Payout request ${reference} to ${seller.bankName} (${seller.bankAccountNumber})`,
        },
      });

      return payout;
    });
  }

  async getSellerPayouts(sellerId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPayouts() {
    return this.prisma.payoutRequest.findMany({
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPayout(payoutId: string, status: PayoutStatus) {
    return this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status },
    });
  }
}
