import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalService } from './withdrawal.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExchangeStatus, Role } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WithdrawalService', () => {
  let service: WithdrawalService;
  let prismaService: PrismaService;

  const mockedUser = {
    id: '1',
    email: 'johndoe@gmail.com',
    roles: [Role.CREATOR, Role.RESPONDENT, Role.ADMIN],
    password: null,
    ssoUsername: null,
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: null,
    gender: null,
    companyName: null,
    birthDate: null,
    credit: 500000,
    isVerified: true,
    isBlocked: false,
    hasCompletedProfile: true,
  };

  const CreateWithdrawalDto = {
    amount: 100000,
    payment: 'Debit BCA',
    accountNumber: '00890897262',
  };

  const validateWithdrawalDto = {
    isApproved: true,
  };

  const withdrawals = [
    {
      id: 'i1',
      userId: 'c1',
      userName: 'John Doe',
      status: ExchangeStatus.PENDING,
      createdAt: new Date(),
      validatedAt: null,
      exchange: 'Withdraw',
      amount: 100000,
      payment: 'Debit BCA',
      accountNumber: '00890897262',
    },
    {
      id: 'i2',
      userId: 'c1',
      userName: 'John Doe',
      status: ExchangeStatus.PENDING,
      createdAt: new Date(),
      validatedAt: null,
      exchange: 'Withdraw',
      amount: 200000,
      payment: 'Debit BCA',
      accountNumber: '00890897262',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        {
          provide: PrismaService,
          useValue: {
            withdrawal: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WithdrawalService>(WithdrawalService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWithdrawals', () => {
    it('should return all withdrawals', async () => {
      jest
        .spyOn(prismaService.withdrawal, 'findMany')
        .mockResolvedValue(withdrawals);

      const result = await service.getAllWithdrawals();

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual(withdrawals);
    });

    it('should return an empty array if no withdrawals', async () => {
      jest.spyOn(prismaService.withdrawal, 'findMany').mockResolvedValue([]);

      const result = await service.getAllWithdrawals();

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual([]);
    });
  });

  describe('getAllWithdrawalsOnValidation', () => {
    it('should return all pending withdrawals', async () => {
      jest
        .spyOn(prismaService.withdrawal, 'findMany')
        .mockResolvedValue(withdrawals);

      const result = await service.getAllWithdrawalsOnValidation();

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual(withdrawals);
    });

    it('should return an empty array if no withdrawals are pending', async () => {
      jest.spyOn(prismaService.withdrawal, 'findMany').mockResolvedValue([]);

      const result = await service.getAllWithdrawalsOnValidation();

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual([]);
    });
  });

  describe('getOwnedWithdrawals', () => {
    it('should return withdrawals owned by the user', async () => {
      jest
        .spyOn(prismaService.withdrawal, 'findMany')
        .mockResolvedValue(withdrawals);

      const result = await service.getOwnedWithdrawals(mockedUser.id);

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual(withdrawals);
    });

    it('should return an empty array if the user has no withdrawals', async () => {
      jest.spyOn(prismaService.withdrawal, 'findMany').mockResolvedValue([]);

      const result = await service.getOwnedWithdrawals(mockedUser.id);

      expect(result.statusCode).toEqual(200);
      expect(result.data).toEqual([]);
    });
  });

  describe('createWithdrawal', () => {
    it('should create a withdrawal successfully', async () => {
      jest
        .spyOn(prismaService.withdrawal, 'create')
        .mockResolvedValue(withdrawals[0]);

      const result = await service.createWithdrawal(
        mockedUser,
        CreateWithdrawalDto,
      );

      expect(result.statusCode).toEqual(201);
      expect(result.data).toEqual(withdrawals[0]);
    });

    it('should throw an error for invalid amount', async () => {
      const initialCreateWithdrawalDto = {
        ...CreateWithdrawalDto[0],
        amount: -10,
      };

      jest
        .spyOn(prismaService.withdrawal, 'create')
        .mockResolvedValue(withdrawals[0]);

      await expect(
        service.createWithdrawal(mockedUser, initialCreateWithdrawalDto),
      ).rejects.toThrow(new BadRequestException('Amount cannot be negative'));
    });

    it('should throw an error for insufficient credits', async () => {
      const initialUser = { ...mockedUser, credit: 0 };

      jest
        .spyOn(prismaService.withdrawal, 'create')
        .mockResolvedValue(withdrawals[0]);

      await expect(
        service.createWithdrawal(initialUser, CreateWithdrawalDto),
      ).rejects.toThrow(new BadRequestException('Insufficient credits'));
    });
  });

  describe('validateWithdrawal', () => {
    it('should approve a withdrawal successfully', async () => {
      const updatedWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.APPROVED,
      };

      jest
        .spyOn(prismaService.withdrawal, 'findUnique')
        .mockResolvedValue(withdrawals[0]);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockedUser);
      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(updatedWithdrawal);

      const result = await service.validateWithdrawal(
        withdrawals[0].id,
        validateWithdrawalDto,
      );

      expect(result.statusCode).toEqual(200);
      expect(result.data.status).toEqual(ExchangeStatus.APPROVED);
      expect(prismaService.withdrawal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ExchangeStatus.APPROVED,
          }),
        }),
      );
    });

    it('should reject a withdrawal successfully', async () => {
      const initialValidateWithdrawalDto = {
        ...validateWithdrawalDto,
        isApproved: false,
      };
      const updatedWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.REJECTED,
      };

      jest
        .spyOn(prismaService.withdrawal, 'findUnique')
        .mockResolvedValue(withdrawals[0]);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockedUser);
      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(updatedWithdrawal);

      const result = await service.validateWithdrawal(
        withdrawals[0].id,
        initialValidateWithdrawalDto,
      );

      expect(result.statusCode).toEqual(200);
      expect(result.data.status).toEqual(ExchangeStatus.REJECTED);
      expect(prismaService.withdrawal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ExchangeStatus.REJECTED,
          }),
        }),
      );
    });

    it("should subtract the user's balance successfully on valid withdrawal validation", async () => {
      const updatedWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.APPROVED,
      };

      jest
        .spyOn(prismaService.withdrawal, 'findUnique')
        .mockResolvedValue(withdrawals[0]);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockedUser);
      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(updatedWithdrawal);

      const result = await service.validateWithdrawal(
        withdrawals[0].id,
        validateWithdrawalDto,
      );

      expect(result.statusCode).toEqual(200);
      expect(result.data.status).toEqual(ExchangeStatus.APPROVED);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockedUser.id },
        data: { credit: mockedUser.credit - withdrawals[0].amount },
      });
    });

    it('should throw an error for invalid withdrawal id', async () => {
      const updatedWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.APPROVED,
      };

      jest
        .spyOn(prismaService.withdrawal, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockedUser);
      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(updatedWithdrawal);

      await expect(
        service.validateWithdrawal(withdrawals[0].id, validateWithdrawalDto),
      ).rejects.toThrow(new NotFoundException('The withdrawal is not found'));
    });

    it('should throw an error for revalidation', async () => {
      const initialWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.APPROVED,
      };
      const updatedWithdrawal = {
        ...withdrawals[0],
        status: ExchangeStatus.APPROVED,
      };

      jest
        .spyOn(prismaService.withdrawal, 'findUnique')
        .mockResolvedValue(initialWithdrawal);
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockedUser);
      jest
        .spyOn(prismaService.withdrawal, 'update')
        .mockResolvedValue(updatedWithdrawal);

      await expect(
        service.validateWithdrawal(withdrawals[0].id, validateWithdrawalDto),
      ).rejects.toThrow(
        new BadRequestException('The withdrawal has already been validated'),
      );
    });
  });
});
