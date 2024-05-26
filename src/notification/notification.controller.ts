import { Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { CurrentUser, Roles } from 'src/decorator';
import { Role } from '@prisma/client';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('notification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Patch('/read')
  @Roles(Role.RESPONDENT)
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
