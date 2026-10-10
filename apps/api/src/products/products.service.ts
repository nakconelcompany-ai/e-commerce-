import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

export interface CreateProductDto {
  title: string;
  description: string;
  categoryId: string;
  brandId?: string;
  basePriceMinor: number;
  compareAtPriceMinor?: number;
  sku: string;
  images?: string[];
  specifications?: Record<string, any>;
  isPlatformOwned?: boolean;
  variants: {
    title: string;
    sku: string;
    priceMinor: number;
    compareAtPriceMinor?: number;
    stockQuantity: number;
    attributes?: Record<string, any>;
    isDefault?: boolean;
  }[];
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    q?: string;
    categoryId?: string;
    brandId?: string;
    minPriceMinor?: number;
    maxPriceMinor?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ProductStatus.PUBLISHED,
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.minPriceMinor !== undefined || query.maxPriceMinor !== undefined) {
      where.basePriceMinor = {};
      if (query.minPriceMinor !== undefined) where.basePriceMinor.gte = Number(query.minPriceMinor);
      if (query.maxPriceMinor !== undefined) where.basePriceMinor.lte = Number(query.maxPriceMinor);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { basePriceMinor: 'asc' };
    if (query.sort === 'price_desc') orderBy = { basePriceMinor: 'desc' };
    if (query.sort === 'popularity') orderBy = { totalSales: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          variants: true,
          category: true,
          brand: true,
          seller: { select: { id: true, storeName: true, storeSlug: true, storeLogo: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        category: true,
        brand: true,
        seller: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(sellerId: string, dto: CreateProductDto) {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    return this.prisma.product.create({
      data: {
        sellerId,
        title: dto.title,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        brandId: dto.brandId || null,
        basePriceMinor: dto.basePriceMinor,
        compareAtPriceMinor: dto.compareAtPriceMinor || null,
        sku: dto.sku,
        images: dto.images || [],
        specifications: dto.specifications || {},
        isPlatformOwned: dto.isPlatformOwned || false,
        status: ProductStatus.PUBLISHED, // Auto publish for Phase 1 MVP or pending moderation
        variants: {
          create: dto.variants.map(v => ({
            title: v.title,
            sku: v.sku,
            priceMinor: v.priceMinor,
            compareAtPriceMinor: v.compareAtPriceMinor || null,
            stockQuantity: v.stockQuantity,
            attributes: v.attributes || {},
            isDefault: v.isDefault || false,
          })),
        },
      },
      include: { variants: true },
    });
  }

  async updateModerationStatus(productId: string, status: ProductStatus, rejectionReason?: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        status,
        rejectionReason: rejectionReason || null,
      },
    });
  }

  async getRecommendations(categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { variants: true, seller: true },
      take: 6,
      orderBy: { totalSales: 'desc' },
    });
  }
}
