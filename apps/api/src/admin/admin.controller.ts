import { Controller, Get, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, SellerStatus, VerificationDocStatus } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.STAFF)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get marketplace admin dashboard performance metrics' })
  getOverview() {
    return this.adminService.getOverviewMetrics();
  }

  @Get('sellers')
  @ApiOperation({ summary: 'List all seller profiles by onboarding status' })
  getSellers(@Query('status') status?: SellerStatus) {
    return this.adminService.getSellers(status);
  }

  @Put('sellers/:id/review')
  @ApiOperation({ summary: 'Approve or reject a seller application' })
  reviewSeller(
    @Param('id') sellerId: string,
    @Body('status') status: SellerStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.adminService.reviewSellerApplication(sellerId, status, rejectionReason);
  }

  @Get('verification-docs')
  @ApiOperation({ summary: 'List all seller KYC verification documents' })
  getVerificationDocs(@Query('status') status?: VerificationDocStatus) {
    return this.adminService.getAllVerificationDocs(status);
  }

  @Put('verification-docs/:id/review')
  @ApiOperation({ summary: 'Approve or reject a seller verification document' })
  reviewVerificationDoc(
    @Param('id') docId: string,
    @Body('status') status: VerificationDocStatus,
  ) {
    return this.adminService.reviewVerificationDoc(docId, status);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get all marketplace settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Update or create marketplace setting' })
  updateSetting(@Param('key') key: string, @Body('value') value: any, @Body('description') description?: string) {
    return this.adminService.updateSetting(key, value, description);
  }
}
