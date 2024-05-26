import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;

  const userId = 'u1';
  const participations = [
    {
      respondentId: 'u1',
      formId: 'f1',
      isCompleted: true,
      emailNotificationActive: false,
      questionsAnswered: 25,
      finalWinningChance: 0,
      respondentIsReported: false,
      notificationRead: false,
    },
    {
      respondentId: 'u1',
      formId: 'f2',
      isCompleted: true,
      emailNotificationActive: false,
      questionsAnswered: 25,
      finalWinningChance: 0,
      respondentIsReported: false,
      notificationRead: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            participation: {
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markAllAsRead', () => {
    it('should call prismaService.participation.updateMany with the correct parameters', async () => {
      jest
        .spyOn(prismaService.participation, 'updateMany')
        .mockResolvedValue(participations as any);

      expect(await service.markAllAsRead(userId)).toEqual({
        statusCode: 200,
        message:
          "Successfully marked all ended participation's notification as read",
        data: expect.arrayContaining(participations),
      });

      expect(prismaService.participation.updateMany).toHaveBeenCalledWith({
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
    });

    it("should only update ended participation's notification", async () => {
      const modifiedParticipations = [
        participations[0],
        { ...participations[1], notificationRead: true },
      ];

      jest
        .spyOn(prismaService.participation, 'updateMany')
        .mockResolvedValue(modifiedParticipations as any);

      expect(await service.markAllAsRead(userId)).toEqual({
        statusCode: 200,
        message:
          "Successfully marked all ended participation's notification as read",
        data: expect.arrayContaining([
          expect.objectContaining(participations[0]),
          expect.not.objectContaining(participations[1]),
        ]),
      });
    });

    it('should throw BadRequestException when prismaService.participation.updateMany fails', async () => {
      const error = new Error('Database connection error');

      jest
        .spyOn(prismaService.participation, 'updateMany')
        .mockRejectedValue(error);

      await expect(service.markAllAsRead(userId)).rejects.toThrow(
        new BadRequestException(`Got Notification Error: ${error}`),
      );

      expect(prismaService.participation.updateMany).toHaveBeenCalledWith({
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
    });
  });
});
