import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService, CreateProductDto } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ProductStatus } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter published products' })
  findAll(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPriceMinor') minPriceMinor?: number,
    @Query('maxPriceMinor') maxPriceMinor?: number,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findAll({ q, categoryId, brandId, minPriceMinor, maxPriceMinor, sort, page, limit });
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  getRecommendations(@Query('categoryId') categoryId?: string) {
    return this.productsService.getRecommendations(categoryId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product with variants (Seller)' })
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    if (!req.user.sellerProfile) {
      throw new ForbiddenException('You must have an active seller profile to list products');
    }
    return this.productsService.create(req.user.sellerProfile.id, dto);
  }

  @Put(':id/moderation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product moderation status (Admin)' })
  updateModeration(
    @Param('id') id: string,
    @Body('status') status: ProductStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.productsService.updateModerationStatus(id, status, rejectionReason);
  }
}
