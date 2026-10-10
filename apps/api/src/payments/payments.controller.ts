import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize Paystack checkout transaction for an order' })
  initializePayment(@Request() req: any, @Body('orderId') orderId: string) {
    return this.paymentsService.initializePayment(orderId, req.user.email);
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify payment status by reference' })
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paystack HMAC signature-verified webhook listener' })
  async handleWebhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    if (body && body.event === 'charge.success' && body.data?.reference) {
      await this.paymentsService.verifyPayment(body.data.reference);
    }
    return { status: 'acknowledged' };
  }
}
