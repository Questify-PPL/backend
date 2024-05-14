import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UpdateReportDto, CreateReportDto } from 'src/dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { User, Role, ReportStatus } from '@prisma/client';

describe('ReportController', () => {
  let controller: ReportController;
  let service: ReportService;
  let respondent: User;

  beforeEach(async () => {
    const reportServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: reportServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    service = module.get<ReportService>(ReportService);

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
    expect(controller).toBeDefined();
  });

  it('should transform and validate correctly CreateReportDto', async () => {
    const plainData = {
      reportToId: '67b1c3d7-d5c0-4eae-8e90-2a28cfb3d03f',
      formId: '67b1c3d7-d5c0-4eae-8e90-2a28cfb3d03f',
      message: 'x'.repeat(200),
    };

    const dtoInstance = plainToClass(CreateReportDto, plainData);
    const errors = await validate(dtoInstance);
    expect(errors).toHaveLength(0);
  });

  it('should transform and validate correctly UpdateReportDto', async () => {
    const plainData = {
      isApproved: true,
    };

    const dtoInstance = plainToClass(UpdateReportDto, plainData);
    const errors = await validate(dtoInstance);
    expect(errors).toHaveLength(0);
  });

  it('should return created report', async () => {
    const createReportDTO = {
      reportToId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
    };

    const report = {
      id: 'someId',
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.PENDING,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };
    jest.spyOn(service, 'create').mockResolvedValue(report);

    const response = await controller.create(respondent, createReportDTO);
    expect(response).toEqual(report);
  });

  it('should return all reports', async () => {
    const reports = [
      {
        id: 'cbdd4315-4b17-4c90-8159-be30de4073d0',
        toUserId: '2dfe14d5-85a8-45d3-8e69-a9955e98dd09',
        fromUserId: '08312d19-51d1-45cc-a4f6-e93786efa59a',
        formId: 'eaf76e52-4d64-4085-a6d1-c7058d402d40',
        message: 'creatornya gk jelas',
        status: ReportStatus.PENDING,
        createdAt: new Date('2024-04-27T11:33:37.906Z'),
        fromUser: {
          id: '08312d19-51d1-45cc-a4f6-e93786efa59a',
          firstName: 'Creator',
          lastName: 'Questify',
          email: 'creator@questify.com',
          roles: ['CREATOR'] as Role[],
        },
        toUser: {
          id: '2dfe14d5-85a8-45d3-8e69-a9955e98dd09',
          firstName: 'Respondent',
          lastName: 'Questify 2',
          email: 'respondent2@questify.com',
          roles: ['RESPONDENT'] as Role[],
          _count: {
            ReportTo: 2,
          },
        },
        form: {
          id: 'eaf76e52-4d64-4085-a6d1-c7058d402d40',
          creatorId: '08312d19-51d1-45cc-a4f6-e93786efa59a',
        },
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(reports);

    const response = await controller.findAll();
    expect(response).toEqual(reports);
  });

  it('should return validated report', async () => {
    const report = {
      id: 'someId',
      toUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      fromUserId: 'b28e00b9-6162-4f8a-93d3-925a62c89f9a',
      formId: 'ba8e528b-1c22-41b8-9ac1-23592d3bce58',
      message: 'creatornya gk jelas',
      status: ReportStatus.APPROVED,
      createdAt: new Date('2024-04-27T06:36:41.861Z'),
    };

    jest.spyOn(service, 'update').mockResolvedValue(report);

    const response = await controller.update('someId', {
      isApproved: true,
    });
    expect(response).toEqual(report);
  });
});
