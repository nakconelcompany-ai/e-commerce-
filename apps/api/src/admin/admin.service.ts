import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerStatus, VerificationDocStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getOverviewMetrics() {
    const totalCustomers = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalSellers = await this.prisma.sellerProfile.count({ where: { onboardingStatus: 'APPROVED' } });
    const pendingSellerApplications = await this.prisma.sellerProfile.count({
      where: { onboardingStatus: { in: ['SUBMITTED', 'PENDING_VERIFICATION'] } },
    });
    const totalProducts = await this.prisma.product.count();
    const totalOrders = await this.prisma.order.count();

    const orders = await this.prisma.order.findMany({
      where: { status: { notIn: ['cancelled', 'payment_failed', 'expired'] } },
    });

    let gmvMinor = 0;
    orders.forEach((o) => {
      gmvMinor += o.totalAmountMinor;
    });

    const sellerOrders = await this.prisma.sellerOrder.findMany({
      where: { status: { notIn: ['cancelled', 'pending_payment'] } },
    });

    let platformCommissionRevenueMinor = 0;
    sellerOrders.forEach((so) => {
      platformCommissionRevenueMinor += so.commissionAmountMinor;
    });

    return {
      totalCustomers,
      totalSellers,
      pendingSellerApplications,
      totalProducts,
      totalOrders,
      gmvMinor,
      platformCommissionRevenueMinor,
    };
  }

  async getSellers(status?: SellerStatus) {
    const where = status ? { onboardingStatus: status } : {};
    return this.prisma.sellerProfile.findMany({
      where,
      include: { user: { select: { email: true, createdAt: true } }, verificationDocs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewSellerApplication(sellerId: string, status: SellerStatus, rejectionReason?: string) {
    const seller = await this.prisma.sellerProfile.findUnique({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const updated = await this.prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        onboardingStatus: status,
        rejectionReason: status === SellerStatus.REJECTED ? rejectionReason : null,
      },
    });

    // Notify Seller
    await this.notificationsService.create({
      userId: seller.userId,
      title: `Seller Application ${status}`,
      message: status === SellerStatus.APPROVED
        ? `Congratulations! Your seller store "${seller.storeName}" has been approved. You can now start listing products.`
        : `Your seller application was rejected: ${rejectionReason || 'Please review requirements and resubmit.'}`,
      type: 'SELLER',
      link: '/seller',
    });

    return updated;
  }

  async getAllVerificationDocs(status?: VerificationDocStatus) {
    const where = status ? { verificationStatus: status } : {};
    return this.prisma.sellerVerificationDoc.findMany({
      where,
      include: { seller: { select: { storeName: true, businessName: true, contactEmail: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewVerificationDoc(docId: string, status: VerificationDocStatus) {
    const doc = await this.prisma.sellerVerificationDoc.findUnique({
      where: { id: docId },
      include: { seller: true },
    });
    if (!doc) throw new NotFoundException('Verification document not found');

    const updated = await this.prisma.sellerVerificationDoc.update({
      where: { id: docId },
      data: { verificationStatus: status },
    });

    // If verified and seller is PENDING_VERIFICATION, approve seller
    if (status === VerificationDocStatus.VERIFIED && doc.seller.onboardingStatus === SellerStatus.PENDING_VERIFICATION) {
      await this.prisma.sellerProfile.update({
        where: { id: doc.sellerId },
        data: { onboardingStatus: SellerStatus.APPROVED },
      });
    }

    await this.notificationsService.create({
      userId: doc.seller.userId,
      title: `KYC Document ${status}`,
      message: `Your uploaded document "${doc.docType}" has been ${status.toLowerCase()} by admin compliance.`,
      type: 'SELLER',
      link: '/seller',
    });

    return updated;
  }

  async getSettings() {
    return this.prisma.marketplaceSetting.findMany();
  }

  async updateSetting(key: string, value: any, description?: string) {
    return this.prisma.marketplaceSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }
}
