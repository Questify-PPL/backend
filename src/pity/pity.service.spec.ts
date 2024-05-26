import { Test, TestingModule } from '@nestjs/testing';
import { PityService } from './pity.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Participation, PrizeType, Respondent } from '@prisma/client';

describe('PityService', () => {
  let service: PityService;
  let prismaService: PrismaService;
  let participations: Participation[];
  let respondents: (Respondent & { Participation: Participation[] })[];
  let respondentIds: string[];
  const forms = [
    {
      id: 'f1',
      creatorId: 'c1',
      title: 'Form 1',
      prize: 100000,
      isDraft: false,
      isPublished: true,
      maxParticipant: 20,
      prizeType: PrizeType.LUCKY,
      maxWinner: 2,
      createdAt: new Date(2024, 3, 15),
      updatedAt: new Date(2024, 3, 16),
      endedAt: new Date(2100, 0, 1),
      isWinnerProcessed: false,
      totalPity: 170,
    },
    {
      id: 'f2',
      creatorId: 'c2',
      title: 'Form 2',
      prize: 100000,
      isDraft: false,
      isPublished: true,
      maxParticipant: 20,
      prizeType: PrizeType.EVEN,
      maxWinner: 2,
      createdAt: new Date(2024, 3, 15),
      updatedAt: new Date(2024, 3, 16),
      endedAt: new Date(2100, 0, 1),
      isWinnerProcessed: false,
      totalPity: 0,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PityService,
        {
          provide: PrismaService,
          useValue: {
            respondent: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            form: {
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PityService>(PityService);
    prismaService = module.get<PrismaService>(PrismaService);
    participations = [
      {
        respondentId: 'u1',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
        respondentIsReported: false,
        formIsReported: false,
      },
      {
        respondentId: 'u2',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
        respondentIsReported: false,
        formIsReported: false,
      },
      {
        respondentId: 'u3',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
        respondentIsReported: false,
        formIsReported: false,
      },
      {
        respondentId: 'u4',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
        respondentIsReported: false,
        formIsReported: false,
      },
      {
        respondentId: 'u5',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
        respondentIsReported: false,
        formIsReported: false,
      },
    ];
    respondents = [
      {
        userId: 'u1',
        pity: 10,
        Participation: [participations[0]],
      },
      {
        userId: 'u2',
        pity: 70,
        Participation: [participations[1]],
      },
      {
        userId: 'u3',
        pity: 30,
        Participation: [participations[2]],
      },
      {
        userId: 'u4',
        pity: 20,
        Participation: [participations[3]],
      },
      {
        userId: 'u5',
        pity: 50,
        Participation: [participations[4]],
      },
    ];
    respondentIds = participations.map(
      (participation) => participation.respondentId,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processWinner', () => {
    it('should not processWinner for ongoing form', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
    });

    it('should not processWinner for ended form with isWinnerProcessed true', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        endedAt: new Date(2024, 3, 18),
        isWinnerProcessed: true,
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
    });

    it('should not process EVEN or LUCKY for ended form with 0 participants', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        endedAt: new Date(2024, 3, 18),
        maxWinner: 2,
        Participation: [],
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: {
          id: forms[1].id,
        },
        data: {
          isWinnerProcessed: true,
        },
      });
    });

    it('should not process EVEN or LUCKY for ended form with 0 maxWinner', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        endedAt: new Date(2024, 3, 18),
        maxWinner: 0,
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: {
          id: forms[1].id,
        },
        data: {
          isWinnerProcessed: true,
        },
      });
    });

    it('should process EVEN for ended form with isWinnerProcessed false and prizeType EVEN', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        endedAt: new Date(2024, 3, 18),
        Participation: participations,
      });

      expect((service as any).updatePityAndCreditsForEven).toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: {
          id: forms[1].id,
        },
        data: {
          isWinnerProcessed: true,
        },
      });
    });

    it('should process LUCKY for ended form with isWinnerProcessed false and prizeType LUCKY', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();
      jest
        .spyOn(service as any, 'updatePityAndCreditsForLucky')
        .mockImplementation();

      await service.processWinner({
        ...forms[0],
        endedAt: new Date(2024, 3, 18),
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).toHaveBeenCalledWith(
        forms[0].maxWinner,
        respondentIds,
      );
      expect((service as any).updatePityAndCreditsForLucky).toHaveBeenCalled();
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: {
          id: forms[0].id,
        },
        data: {
          isWinnerProcessed: true,
        },
      });
    });

    it('should not process EVEN or LUCKY for ended form with no completed participation', async () => {
      jest
        .spyOn(service as any, 'updatePityAndCreditsForEven')
        .mockImplementation();
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[0],
        endedAt: new Date(2024, 3, 18),
        Participation: participations.map((participation) => ({
          ...participation,
          isCompleted: false,
        })),
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: {
          id: forms[0].id,
        },
        data: {
          isWinnerProcessed: true,
        },
      });
    });
  });

  describe('calculateWinningChance', () => {
    it('should return finalWinningChance when isWinnerProcessed is true', () => {
      const form = { ...forms[0], isWinnerProcessed: true };
      const participation = {
        ...participations[0],
        isCompleted: true,
        finalWinningChance: 50,
      };

      const result = service.calculateWinningChance(
        respondents[0],
        form,
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe(participation.finalWinningChance);
    });

    it('should return 100 when prizeType is EVEN', () => {
      const form = { ...forms[0], prizeType: PrizeType.EVEN };

      const result = service.calculateWinningChance(
        respondents[0],
        form,
        participations[0].isCompleted,
        participations[0].finalWinningChance,
      );

      expect(result).toBe(100);
    });

    it('should calculate winning chance correctly when has completed the form', () => {
      const participation = { ...participations[0], isCompleted: true };

      const { pity: respondentPity } = respondents[0];
      const { totalPity: totalPity } = forms[0];

      const result = service.calculateWinningChance(
        respondents[0],
        forms[0],
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe((respondentPity / totalPity) * 100);
    });

    it("should calculate winning chance correctly when hasn't completed the form", () => {
      const form = { ...forms[1], prizeType: PrizeType.LUCKY, totalPity: 150 };
      const participation = { ...participations[0], isCompleted: false };

      const { pity: respondentPity } = respondents[0];
      const { totalPity: totalPity } = form;

      const result = service.calculateWinningChance(
        respondents[0],
        form,
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe(
        ((respondentPity + 1) / (respondentPity + 1 + totalPity)) * 100,
      );
    });

    it('should calculate winning chance correctly for form with zero total pity', () => {
      const form = { ...forms[1], prizeType: PrizeType.LUCKY, totalPity: 0 };
      const participation = { ...participations[0], isCompleted: false };

      const { pity: respondentPity } = respondents[0];
      const { totalPity: totalPity } = form;

      const result = service.calculateWinningChance(
        respondents[0],
        form,
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe(
        ((respondentPity + 1) / (respondentPity + 1 + totalPity)) * 100,
      );
    });
  });

  describe('updatePityAfterParticipation', () => {
    it('should update pity after participation', async () => {
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (prisma) => {
          const mockPrisma = {
            respondent: {
              update: jest.fn().mockResolvedValue({
                ...respondents[0],
                pity: respondents[0].pity + 1,
              }),
            },
            form: {
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          } as any;

          await prisma(mockPrisma);

          expect(mockPrisma.respondent.update).toHaveBeenCalledWith({
            where: {
              userId: respondents[0].userId,
            },
            data: {
              pity: {
                increment: 1,
              },
            },
          });
          expect(mockPrisma.form.update).toHaveBeenCalledWith({
            where: {
              id: forms[0].id,
            },
            data: {
              totalPity: {
                increment: respondents[0].pity + 1,
              },
            },
          });
          expect(mockPrisma.form.updateMany).toHaveBeenCalledWith({
            where: {
              NOT: {
                id: forms[0].id,
              },
              Participation: {
                some: {
                  respondentId: respondents[0].userId,
                  isCompleted: true,
                },
              },
              isWinnerProcessed: false,
            },
            data: {
              totalPity: {
                increment: 1,
              },
            },
          });
        });

      await service.updatePityAfterParticipation(
        forms[0].id,
        respondents[0].userId,
      );

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('randomPickWithWeights', () => {
    it('should return all participant IDs if maxWinner is equal or greater than the number of participants', async () => {
      const maxWinner = 5;

      jest.spyOn(service as any, 'findWinnerIndex').mockImplementation();

      const result = await (service as any).randomPickWithWeights(
        maxWinner,
        respondentIds,
      );

      expect(result).toEqual(['u1', 'u2', 'u3', 'u4', 'u5']);
      expect((service as any).findWinnerIndex).not.toHaveBeenCalled();
    });

    it.each([
      [0.5, ['u3', 'u2', 'u5', 'u4']],
      [0.1, ['u2', 'u3', 'u1', 'u4']],
    ])(
      'should return expected winners when random is mocked with %f and maxWinner is 4',
      async (randomValue, expectedWinnerIds) => {
        const maxWinner = 4;

        jest
          .spyOn(prismaService.respondent, 'findMany')
          .mockResolvedValue(respondents);
        jest
          .spyOn(service as any, 'generateRandomValue')
          .mockReturnValue(randomValue);

        const result = await (service as any).randomPickWithWeights(
          maxWinner,
          respondentIds,
        );

        expect(result).toEqual(expectedWinnerIds);
      },
    );
  });

  describe('updatePityAndCreditsForEven', () => {
    it('should update pity and credits for even distribution', async () => {
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (prisma) => {
          const mockPrisma = {
            user: {
              updateMany: jest.fn(),
            },
            participation: {
              updateMany: jest.fn(),
            },
            winner: {
              createMany: jest.fn(),
            },
          } as any;

          await prisma(mockPrisma);

          expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
            where: {
              id: {
                in: respondentIds,
              },
            },
            data: {
              credit: {
                increment: forms[0].prize / respondentIds.length,
              },
            },
          });

          expect(mockPrisma.participation.updateMany).toHaveBeenCalledWith({
            where: {
              respondentId: {
                in: respondentIds,
              },
              formId: forms[0].id,
            },
            data: {
              finalWinningChance: 100,
            },
          });

          expect(mockPrisma.winner.createMany).toHaveBeenCalledWith({
            data: respondentIds.map((winnerId) => ({
              respondentId: winnerId,
              formId: forms[0].id,
            })),
          });
        });

      await (service as any).updatePityAndCreditsForEven(
        forms[0].prize,
        respondentIds,
        forms[0].id,
      );

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('updatePityAndCreditsForLucky', () => {
    it('should update pity and credits for lucky distribution', async () => {
      const winnerIds = ['u3', 'u2', 'u5', 'u4'];

      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (prisma) => {
          const mockPrisma = {
            user: {
              updateMany: jest.fn(),
            },
            respondent: {
              findMany: jest.fn().mockResolvedValue(respondents),
              updateMany: jest.fn(),
            },
            participation: {
              update: jest.fn(),
            },
            winner: {
              createMany: jest.fn(),
            },
          } as any;

          await prisma(mockPrisma);

          expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
            where: {
              id: {
                in: winnerIds,
              },
            },
            data: {
              credit: {
                increment: forms[0].prize / winnerIds.length,
              },
            },
          });

          for (const respondent of respondents) {
            expect(mockPrisma.participation.update).toHaveBeenCalledWith({
              where: {
                respondentId_formId: {
                  formId: forms[0].id,
                  respondentId: respondent.userId,
                },
              },
              data: {
                finalWinningChance:
                  (respondent.pity / forms[0].totalPity) * 100,
              },
            });
          }

          expect(mockPrisma.respondent.updateMany).toHaveBeenCalledWith({
            where: {
              userId: {
                in: winnerIds,
              },
            },
            data: {
              pity: 1,
            },
          });

          expect(mockPrisma.respondent.updateMany).toHaveBeenCalledWith({
            where: {
              userId: {
                in: respondentIds.filter((id) => !winnerIds.includes(id)),
              },
            },
            data: {
              pity: {
                increment: 2,
              },
            },
          });

          expect(mockPrisma.winner.createMany).toHaveBeenCalledWith({
            data: winnerIds.map((winnerId) => ({
              respondentId: winnerId,
              formId: forms[0].id,
            })),
          });
        });

      await (service as any).updatePityAndCreditsForLucky(
        forms[0].prize,
        winnerIds,
        respondentIds,
        forms[0].id,
        forms[0].totalPity,
      );

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('generateRandomValue', () => {
    it('should generate a random value between 0 and 1', () => {
      const randomValue = (service as any).generateRandomValue();

      expect(randomValue).toBeLessThan(1);
    });
  });
});
