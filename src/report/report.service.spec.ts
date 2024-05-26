import { Test, TestingModule } from '@nestjs/testing';
import { ReportService, totalAcceptedReportForBanned } from './report.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Role, ReportStatus } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ReportService', () => {
  let service: ReportService;
  let prismaService: PrismaService;
  let respondent: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrismaService,
          useValue: {
            report: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn().mockResolvedValue(null),
            },
            form: {
              findFirst: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    prismaService = module.get<PrismaService>(PrismaService);

    enum Gender {
      MALE = 'MALE',
      FEMALE = 'FEMALE',
    }

    respondent = {
      id: 'someUserId',
      email: '',
      password: '',
      ssoUsername: '',
      firstName: 'Grace',
      lastName: 'Elizabeth Smith',
      phoneNumber: '123456789',
      gender: Gender.FEMALE,
      companyName: 'Example Inc.',
      birthDate: new Date('1990-01-05'),
      credit: null,
      isVerified: false,
      isBlocked: false,
      hasCompletedProfile: false,
      roles: ['RESPONDENT'] as Role[],
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update respondentIsReported attr when respondent is reported', async () => {
    const createReportDTO = {
      reportToId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
    };

    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const createReportMock = prismaService.report.findFirst as jest.Mock;
    createReportMock.mockResolvedValue(null);

    let prismaMock;

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        prismaMock = {
          report: {
            create: jest.fn().mockResolvedValue(report),
          },
          participation: {
            update: jest.fn(),
          },
        };

        return prisma(prismaMock as any);
      });

    jest.spyOn(service, 'creatorIsReported').mockResolvedValue(false);

    const response = await service.create(respondent, createReportDTO);
    expect(response).toEqual(report);

    expect(prismaMock.participation.update).toHaveBeenCalledWith({
      where: {
        respondentId_formId: {
          formId: createReportDTO.formId,
          respondentId: createReportDTO.reportToId,
        },
      },
      data: { respondentIsReported: true },
    });
  });

  it('should return bad request error when report already exists', async () => {
    const createReportDTO = {
      reportToId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
    };

    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const findFirstMock = prismaService.report.findFirst as jest.Mock;
    findFirstMock.mockResolvedValue(report);

    await expect(service.create(respondent, createReportDTO)).rejects.toThrow(
      new BadRequestException('You have reported this user before'),
    );
  });

  it('should return all reports', async () => {
    const reports = [
      {
        toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
        fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
        formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
        message: 'creatornya gk jelas',
        status: ReportStatus.PENDING,
        createdAt: new Date('2024-04-27T06:36:41.861Z'),
      },
      {
        toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
        fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
        formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
        message: 'creatornya aneh',
        status: ReportStatus.APPROVED,
        createdAt: new Date('2024-04-27T06:36:41.861Z'),
      },
    ];

    const findAllReportsMock = prismaService.report.findMany as jest.Mock;

    findAllReportsMock.mockResolvedValue(reports);
    const response = await service.findAll();
    expect(response).toEqual(reports);
  });

  it('should update specific report', async () => {
    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const id = 'someId';

    const updateReportDto = {
      isApproved: true,
    };

    const findUniqueMock = prismaService.report.findUnique as jest.Mock;
    findUniqueMock.mockResolvedValue(report);

    const updateReportMock = prismaService.report.update as jest.Mock;
    updateReportMock.mockResolvedValue(report);

    jest.spyOn(prismaService, '$transaction').mockResolvedValueOnce(report);

    const response = await service.update(id, updateReportDto);

    expect(response).toEqual(report);
  });

  it('should update specific report when report is rejected', async () => {
    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const updatedReport = {
      ...report,
      status: ReportStatus.REJECTED,
    };

    const findUniqueMock = prismaService.report.findUnique as jest.Mock;
    findUniqueMock.mockResolvedValue(report);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const prismaMock = {
          report: {
            update: jest.fn().mockResolvedValue(updatedReport),
            aggregate: jest.fn(),
          },
          user: {
            update: jest.fn(),
          },
        };

        return prisma(prismaMock as any);
      });

    const id = 'someId';

    const updateReportDto = {
      isApproved: false,
    };

    const response = await service.update(id, updateReportDto);
    expect(response).toEqual(updatedReport);
  });

  it('should throw not found error when update invalid report', async () => {
    const id = 'someId';
    const updateReportDto = {
      isApproved: true,
    };

    const updateReportMock = prismaService.report.findUnique as jest.Mock;
    updateReportMock.mockResolvedValue(null);

    await expect(service.update(id, updateReportDto)).rejects.toThrow(
      new NotFoundException('The report not found'),
    );
  });

  it('should throw bad request error when update already processed report', async () => {
    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.APPROVED,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const id = 'someId';

    const updateReportDto = {
      isApproved: true,
    };

    const findUniqueMock = prismaService.report.findUnique as jest.Mock;
    findUniqueMock.mockResolvedValue(report);

    await expect(service.update(id, updateReportDto)).rejects.toThrow(
      new BadRequestException('The report has been approved/rejected'),
    );
  });

  it('should return updated report when report is rejected', async () => {
    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const updatedReport = {
      ...report,
      status: ReportStatus.REJECTED,
    };

    const findUniqueMock = prismaService.report.findUnique as jest.Mock;
    findUniqueMock.mockResolvedValue(report);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const prismaMock = {
          report: {
            update: jest.fn().mockResolvedValue(updatedReport),
            aggregate: jest.fn(),
          },
          user: {
            update: jest.fn(),
          },
        };

        return prisma(prismaMock as any);
      });

    const id = 'someId';

    const updateReportDto = {
      isApproved: true,
    };

    // Call method
    const response = await service.update(id, updateReportDto);
    expect(response).toEqual(updatedReport);
  });

  it('should blocked user when user has total accepted report for banned', async () => {
    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const updatedReport = {
      ...report,
      status: ReportStatus.APPROVED,
    };

    const findUniqueMock = prismaService.report.findUnique as jest.Mock;
    findUniqueMock.mockResolvedValue(report);

    // Mock transaction
    let prismaMock;

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        prismaMock = {
          report: {
            update: jest.fn().mockResolvedValue(updatedReport),
          },
          user: {
            update: jest.fn(),
          },
          $queryRaw: jest
            .fn()
            .mockResolvedValue([{ count: totalAcceptedReportForBanned }]),
        };

        return prisma(prismaMock as any);
      });

    const id = 'someId';

    const updateReportDto = {
      isApproved: true,
    };

    // Call method
    const response = await service.update(id, updateReportDto);
    expect(response).toEqual(updatedReport);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: {
        id: report.toUserId,
      },
      data: {
        isBlocked: true,
      },
    });
  });

  it('should return true when creator is reported', async () => {
    const findFormMock = prismaService.form.findFirst as jest.Mock;
    findFormMock.mockResolvedValue(null);

    const result = await service.creatorIsReported(
      'someCreatorId',
      'someFormId',
    );

    expect(result).toBeFalsy();
  });

  it('should update formIsReported attr when creator is reported', async () => {
    const createReportDTO = {
      reportToId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
    };

    const report = {
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    const createReportMock = prismaService.report.findFirst as jest.Mock;
    createReportMock.mockResolvedValue(null);

    let prismaMock;

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        prismaMock = {
          report: {
            create: jest.fn().mockResolvedValue(report),
          },
          participation: {
            update: jest.fn(),
          },
        };

        return prisma(prismaMock as any);
      });

    jest.spyOn(service, 'creatorIsReported').mockResolvedValue(true);

    const response = await service.create(respondent, createReportDTO);
    expect(response).toEqual(report);

    expect(prismaMock.participation.update).toHaveBeenCalledWith({
      where: {
        respondentId_formId: {
          formId: createReportDTO.formId,
          respondentId: respondent.id,
        },
      },
      data: { formIsReported: true },
    });
  });
});
