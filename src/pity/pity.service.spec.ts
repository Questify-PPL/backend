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
      },
      {
        respondentId: 'u2',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
      },
      {
        respondentId: 'u3',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
      },
      {
        respondentId: 'u4',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
      },
      {
        respondentId: 'u5',
        formId: 'f1',
        isCompleted: true,
        emailNotificationActive: false,
        questionsAnswered: 25,
        finalWinningChance: 0,
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
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
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
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
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
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
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
    });

    it('should not process EVEN or LUCKY for ended form with 0 maxWinner', async () => {
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
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
    });

    it('should process EVEN for ended form with isWinnerProcessed false and prizeType EVEN', async () => {
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();

      await service.processWinner({
        ...forms[1],
        endedAt: new Date(2024, 3, 18),
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).toHaveBeenCalledTimes(1);
      expect((service as any).randomPickWithWeights).not.toHaveBeenCalled();
    });

    it('should process LUCKY for ended form with isWinnerProcessed false and prizeType LUCKY', async () => {
      jest.spyOn(service as any, 'updatePityAndCreditsForEven');
      jest.spyOn(service as any, 'randomPickWithWeights').mockImplementation();
      jest.spyOn(service as any, 'updatePityAndCreditsForLucky');

      await service.processWinner({
        ...forms[0],
        endedAt: new Date(2024, 3, 18),
        Participation: participations,
      });

      expect(
        (service as any).updatePityAndCreditsForEven,
      ).not.toHaveBeenCalled();
      expect((service as any).randomPickWithWeights).toHaveBeenCalledTimes(1);
      expect((service as any).randomPickWithWeights).toHaveBeenCalledWith(
        forms[0].maxWinner,
        respondentIds,
      );
      expect(
        (service as any).updatePityAndCreditsForLucky,
      ).toHaveBeenCalledTimes(1);
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
      const respondent = { ...respondents[0], pity: 0 };
      const form = { ...forms[1], prizeType: PrizeType.LUCKY, totalPity: 0 };
      const participation = { ...participations[0], isCompleted: false };

      const result = service.calculateWinningChance(
        respondent,
        form,
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe(100);
    });

    it('should return 100 and not throw error when division by zero', () => {
      const participation = { ...participations[0], isCompleted: false };

      const { pity: respondentPity } = respondents[0];
      const { totalPity: totalPity } = forms[0];

      const result = service.calculateWinningChance(
        respondents[0],
        forms[0],
        participation.isCompleted,
        participation.finalWinningChance,
      );
      expect(result).toBe(
        (respondentPity / (respondentPity + totalPity)) * 100,
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
                increment: respondents[0].pity,
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

  describe('generateRandomValue', () => {
    it('should generate a random value between 0 and 1', () => {
      const randomValue = (service as any).generateRandomValue();

      expect(randomValue).toBeLessThan(1);
    });
  });
});
