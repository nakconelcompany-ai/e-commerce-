import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService, CreateOrderDto } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, SellerOrderStatus } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Checkout cart and create parent + seller orders' })
  createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer order history' })
  getCustomerOrders(@Request() req: any) {
    return this.ordersService.getCustomerOrders(req.user.id);
  }

  @Get('seller-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders assigned to logged in seller' })
  getSellerOrders(@Request() req: any) {
    if (!req.user.sellerProfile) {
      throw new ForbiddenException('Seller profile missing');
    }
    return this.ordersService.getSellerOrders(req.user.sellerProfile.id);
  }

  @Put('seller-orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller sub-order fulfillment status (Seller)' })
  updateSellerOrderStatus(
    @Request() req: any,
    @Param('id') sellerOrderId: string,
    @Body('status') status: SellerOrderStatus,
    @Body('trackingNumber') trackingNumber?: string,
    @Body('carrierName') carrierName?: string,
  ) {
    if (!req.user.sellerProfile) throw new ForbiddenException('Seller profile missing');
    return this.ordersService.updateSellerOrderStatus(sellerOrderId, req.user.sellerProfile.id, status, trackingNumber, carrierName);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by order ID' })
  getOrderById(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user.id, req.user.role);
  }
}
