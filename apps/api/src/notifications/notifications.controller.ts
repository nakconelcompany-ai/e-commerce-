import { Controller, Get, Put, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications and unread counter' })
  findMyNotifications(@Request() req: any) {
    return this.notificationsService.findMyNotifications(req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Post('test')
  @ApiOperation({ summary: 'Trigger a test notification for the authenticated user' })
  createTestNotification(@Request() req: any, @Body() body: Partial<CreateNotificationDto>) {
    return this.notificationsService.create({
      userId: req.user.id,
      title: body.title || 'Welcome to Nuvora Support & Notifications!',
      message: body.message || 'Phase 5 real-time in-app notification center is now active.',
      type: body.type || 'INFO',
      link: body.link || '/support',
    });
  }
}
