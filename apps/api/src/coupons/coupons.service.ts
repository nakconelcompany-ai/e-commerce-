import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCouponDto {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchaseMinor?: number;
  maxDiscountMinor?: number;
  expiresAt?: Date;
}

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new BadRequestException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minPurchaseMinor: dto.minPurchaseMinor || 0,
        maxDiscountMinor: dto.maxDiscountMinor || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async validateCoupon(code: string, subtotalMinor: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new NotFoundException('Invalid or expired coupon code');

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Coupon code has expired');
    }

    if (subtotalMinor < coupon.minPurchaseMinor) {
      throw new BadRequestException(`Minimum purchase requirement for this coupon is ${coupon.minPurchaseMinor / 100} NGN`);
    }

    let discountMinor = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountMinor = Math.round((subtotalMinor * coupon.discountValue) / 10000); // discountValue in BPS
    } else {
      discountMinor = coupon.discountValue; // Fixed minor units
    }

    if (coupon.maxDiscountMinor && discountMinor > coupon.maxDiscountMinor) {
      discountMinor = coupon.maxDiscountMinor;
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountMinor: Math.min(discountMinor, subtotalMinor),
    };
  }

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
