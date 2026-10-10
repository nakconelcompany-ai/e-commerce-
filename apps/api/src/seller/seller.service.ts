import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerStatus, Role } from '@prisma/client';

export interface CreateSellerApplicationDto {
  businessName: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  state: string;
  city: string;
  description?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  bankName?: string;
}

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, dto: CreateSellerApplicationDto) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('You already have a seller application or profile');
    }

    const storeSlug = dto.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const profile = await this.prisma.sellerProfile.create({
      data: {
        userId,
        businessName: dto.businessName,
        storeName: dto.storeName,
        storeSlug,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        businessAddress: dto.businessAddress,
        state: dto.state,
        city: dto.city,
        description: dto.description || null,
        bankAccountName: dto.bankAccountName || null,
        bankAccountNumber: dto.bankAccountNumber || null,
        bankCode: dto.bankCode || null,
        bankName: dto.bankName || null,
        onboardingStatus: SellerStatus.SUBMITTED,
      },
    });

    // Update user role to SELLER
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.SELLER },
    });

    return profile;
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: { verificationDocs: true },
    });
    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<CreateSellerApplicationDto> & { storeLogo?: string; storeBanner?: string }) {
    const profile = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Seller profile not found');

    return this.prisma.sellerProfile.update({
      where: { id: profile.id },
      data: {
        businessName: data.businessName ?? profile.businessName,
        storeName: data.storeName ?? profile.storeName,
        contactEmail: data.contactEmail ?? profile.contactEmail,
        contactPhone: data.contactPhone ?? profile.contactPhone,
        businessAddress: data.businessAddress ?? profile.businessAddress,
        state: data.state ?? profile.state,
        city: data.city ?? profile.city,
        description: data.description ?? profile.description,
        storeLogo: data.storeLogo ?? profile.storeLogo,
        storeBanner: data.storeBanner ?? profile.storeBanner,
        bankAccountName: data.bankAccountName ?? profile.bankAccountName,
        bankAccountNumber: data.bankAccountNumber ?? profile.bankAccountNumber,
        bankCode: data.bankCode ?? profile.bankCode,
        bankName: data.bankName ?? profile.bankName,
      },
    });
  }

  async getOverviewMetrics(sellerId: string) {
    const totalProducts = await this.prisma.product.count({ where: { sellerId } });
    const orders = await this.prisma.sellerOrder.findMany({ where: { sellerId } });

    let grossSalesMinor = 0;
    let commissionMinor = 0;
    let netEarningsMinor = 0;

    orders.forEach(o => {
      if (o.status !== 'cancelled' && o.status !== 'pending_payment') {
        grossSalesMinor += o.subtotalMinor;
        commissionMinor += o.commissionAmountMinor;
        netEarningsMinor += o.sellerEarningMinor;
      }
    });

    const pendingOrdersCount = orders.filter(o => o.status === 'awaiting_processing' || o.status === 'processing').length;
    const deliveredOrdersCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

    return {
      totalProducts,
      totalOrders: orders.length,
      pendingOrdersCount,
      deliveredOrdersCount,
      grossSalesMinor,
      commissionMinor,
      netEarningsMinor,
    };
  }

  async getPublicStore(slug: string) {
    const store = await this.prisma.sellerProfile.findUnique({
      where: { storeSlug: slug },
      include: {
        products: {
          where: { status: 'PUBLISHED' },
          include: { variants: true, category: true },
        },
      },
    });
    if (!store || store.onboardingStatus !== 'APPROVED') {
      throw new NotFoundException('Store not found or not active');
    }
    return store;
  }

  async uploadVerificationDoc(userId: string, docType: string, docUrl: string) {
    const profile = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Seller profile not found');

    const doc = await this.prisma.sellerVerificationDoc.create({
      data: {
        sellerId: profile.id,
        docType,
        docUrl,
        verificationStatus: 'PENDING',
      },
    });

    if (profile.onboardingStatus === 'DRAFT' || profile.onboardingStatus === 'SUBMITTED') {
      await this.prisma.sellerProfile.update({
        where: { id: profile.id },
        data: { onboardingStatus: 'PENDING_VERIFICATION' },
      });
    }

    return doc;
  }

  async getMyVerificationDocs(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Seller profile not found');

    return this.prisma.sellerVerificationDoc.findMany({
      where: { sellerId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}

