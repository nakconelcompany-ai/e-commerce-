import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateTicketDto {
  subject: string;
  category: string;
  orderId?: string;
  message: string;
}

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createTicket(customerId: string, dto: CreateTicketDto) {
    const ticketNumber = 'TICK-' + Date.now();
    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        customerId,
        orderId: dto.orderId || null,
        subject: dto.subject,
        category: dto.category,
        messages: {
          create: {
            senderId: customerId,
            senderRole: 'CUSTOMER',
            message: dto.message,
          },
        },
      },
      include: { messages: true },
    });

    // Notify Customer of Ticket Creation
    await this.notificationsService.create({
      userId: customerId,
      title: 'Support Ticket Opened',
      message: `Your ticket #${ticketNumber} ("${ticket.subject}") has been registered and is under review.`,
      type: 'SUPPORT',
      link: '/support',
    });

    return ticket;
  }

  async addMessage(ticketId: string, senderId: string, senderRole: string, message: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Support ticket not found');

    const msg = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        senderRole,
        message,
      },
    });

    // If staff/admin replied, notify customer
    if (senderRole !== 'CUSTOMER') {
      await this.notificationsService.create({
        userId: ticket.customerId,
        title: 'New Support Message',
        message: `A support agent replied to your ticket #${ticket.ticketNumber}.`,
        type: 'SUPPORT',
        link: '/support',
      });
    }

    return msg;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, priority?: TicketPriority) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Support ticket not found');

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(priority ? { priority } : {}),
      },
    });

    await this.notificationsService.create({
      userId: ticket.customerId,
      title: 'Ticket Status Updated',
      message: `Ticket #${ticket.ticketNumber} is now marked as ${status}.`,
      type: 'SUPPORT',
      link: '/support',
    });

    return updated;
  }

  async findMyTickets(customerId: string) {
    return this.prisma.supportTicket.findMany({
      where: { customerId },
      include: { messages: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllTickets() {
    return this.prisma.supportTicket.findMany({
      include: { customer: { select: { email: true } }, messages: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
