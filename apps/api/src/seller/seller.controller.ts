import { Controller, Post, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerService, CreateSellerApplicationDto } from './seller.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Seller')
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit seller application' })
  apply(@Request() req: any, @Body() dto: CreateSellerApplicationDto) {
    return this.sellerService.apply(req.user.id, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.SUPER_ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged in seller profile' })
  getMyProfile(@Request() req: any) {
    return this.sellerService.getMyProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller storefront profile' })
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.sellerService.updateProfile(req.user.id, body);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller dashboard sales & order overview metrics' })
  getOverview(@Request() req: any) {
    if (!req.user.sellerProfile) {
      return { totalProducts: 0, totalOrders: 0, pendingOrdersCount: 0, deliveredOrdersCount: 0, grossSalesMinor: 0, commissionMinor: 0, netEarningsMinor: 0 };
    }
    return this.sellerService.getOverviewMetrics(req.user.sellerProfile.id);
  }

  @Get('store/:slug')
  @ApiOperation({ summary: 'Get public seller store page details & published products' })
  getPublicStore(@Param('slug') slug: string) {
    return this.sellerService.getPublicStore(slug);
  }

  @Post('verification-docs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload verification document (CAC, ID, Proof of Address)' })
  uploadVerificationDoc(
    @Request() req: any,
    @Body('docType') docType: string,
    @Body('docUrl') docUrl: string,
  ) {
    return this.sellerService.uploadVerificationDoc(req.user.id, docType, docUrl);
  }

  @Get('verification-docs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verification documents uploaded by current seller' })
  getMyVerificationDocs(@Request() req: any) {
    return this.sellerService.getMyVerificationDocs(req.user.id);
  }
}

