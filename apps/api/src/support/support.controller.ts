import { Controller, Post, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService, CreateTicketDto } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, TicketStatus, TicketPriority } from '@prisma/client';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Open a new customer support ticket' })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, dto);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Post a reply message to a support ticket' })
  addMessage(@Request() req: any, @Param('id') ticketId: string, @Body('message') message: string) {
    return this.supportService.addMessage(ticketId, req.user.id, req.user.role, message);
  }

  @Put('tickets/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Update ticket status and priority (Staff/Admin)' })
  updateTicketStatus(
    @Param('id') ticketId: string,
    @Body('status') status: TicketStatus,
    @Body('priority') priority?: TicketPriority,
  ) {
    return this.supportService.updateTicketStatus(ticketId, status, priority);
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Get current customer support tickets' })
  findMyTickets(@Request() req: any) {
    return this.supportService.findMyTickets(req.user.id);
  }

  @Get('all-tickets')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'List all support tickets (Admin)' })
  findAllTickets() {
    return this.supportService.findAllTickets();
  }
}
