import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService, CreateReturnRequestDto } from './returns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an order return request' })
  create(@Request() req: any, @Body() dto: CreateReturnRequestDto) {
    return this.returnsService.create(req.user.id, dto);
  }

  @Get('my-returns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer return requests' })
  findByCustomer(@Request() req: any) {
    return this.returnsService.findByCustomer(req.user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update return request status (Approve/Reject/Complete Refund)' })
  updateStatus(@Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED' | 'COMPLETED') {
    return this.returnsService.updateStatus(id, status);
  }
}
