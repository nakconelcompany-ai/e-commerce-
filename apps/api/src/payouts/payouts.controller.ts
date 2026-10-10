import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, PayoutStatus } from '@prisma/client';

@ApiTags('Payouts')
@Controller('payouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  @UseGuards(RolesGuard)
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Request seller earnings payout transfer' })
  requestPayout(@Request() req: any, @Body('amountMinor') amountMinor: number) {
    if (!req.user.sellerProfile) throw new ForbiddenException('Seller profile missing');
    return this.payoutsService.requestPayout(req.user.sellerProfile.id, Number(amountMinor));
  }

  @Get('my-payouts')
  @UseGuards(RolesGuard)
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get logged in seller payout history' })
  getSellerPayouts(@Request() req: any) {
    if (!req.user.sellerProfile) throw new ForbiddenException('Seller profile missing');
    return this.payoutsService.getSellerPayouts(req.user.sellerProfile.id);
  }

  @Get('all-payouts')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'List all seller payout requests (Admin)' })
  getAllPayouts() {
    return this.payoutsService.getAllPayouts();
  }

  @Put(':id/process')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Mark payout as PAID or FAILED (Admin)' })
  processPayout(@Param('id') id: string, @Body('status') status: PayoutStatus) {
    return this.payoutsService.processPayout(id, status);
  }
}
