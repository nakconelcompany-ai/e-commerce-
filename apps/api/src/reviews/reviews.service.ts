import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5 stars');
    }

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        customerId,
        rating: Math.round(dto.rating),
        title: dto.title,
        comment: dto.comment,
        verifiedPurchase: true,
      },
    });

    // Recalculate Product average rating & review count
    const allReviews = await this.prisma.review.findMany({ where: { productId: dto.productId } });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await this.prisma.product.update({
      where: { id: dto.productId },
      data: {
        ratingAverage: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return review;
  }

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { customer: { select: { email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
