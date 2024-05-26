import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async markAllAsRead(userId: string) {
    try {
      const participations = await this.prismaService.participation.updateMany({
        where: {
          respondentId: userId,
          form: {
            isWinnerProcessed: true,
          },
          notificationRead: false,
        },
        data: {
          notificationRead: true,
        },
      });

      return {
        statusCode: 200,
        message:
          "Successfully marked all ended participation's notification as read",
        data: participations,
      };
    } catch (error) {
      throw new BadRequestException(`Got Notification Error: ${error}`);
    }
  }
}
