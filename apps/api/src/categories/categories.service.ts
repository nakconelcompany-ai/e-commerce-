import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { children: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          where: { status: 'PUBLISHED' },
          include: { variants: true, seller: true, brand: true },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string; slug?: string; description?: string; imageUrl?: string; parentId?: string; displayOrder?: number }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        parentId: data.parentId || null,
        displayOrder: data.displayOrder || 0,
      },
    });
  }
}
