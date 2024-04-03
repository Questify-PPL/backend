import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExchangeStatus, Role } from '@prisma/client';

describe('WithdrawalController', () => {
  let controller: WithdrawalController;
  let withdrawalService: WithdrawalService;

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

  const createWithdrawalDto = {
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
      controllers: [WithdrawalController],
      providers: [
        {
          provide: WithdrawalService,
          useValue: {
            getAllWithdrawals: jest.fn(),
            getAllWithdrawalsOnValidation: jest.fn(),
            getOwnedWithdrawals: jest.fn(),
            createWithdrawal: jest.fn(),
            validateWithdrawal: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WithdrawalController>(WithdrawalController);
    withdrawalService = module.get<WithdrawalService>(WithdrawalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllWithdrawals', () => {
    it('should call getAllWithdrawals without arguments', async () => {
      jest.spyOn(withdrawalService, 'getAllWithdrawals').mockImplementation();

      await controller.getAllWithdrawals();

      expect(withdrawalService.getAllWithdrawals).toHaveBeenCalledWith();
    });

    it('should return all withdrawals', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get all withdrawals',
        data: withdrawals,
      };

      jest
        .spyOn(withdrawalService, 'getAllWithdrawals')
        .mockImplementation(async () => result);

      expect(await controller.getAllWithdrawals()).toBe(result);
    });

    it('should return an empty array if no withdrawals', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get all withdrawals',
        data: [],
      };

      jest
        .spyOn(withdrawalService, 'getAllWithdrawals')
        .mockImplementation(async () => result);

      expect(await controller.getAllWithdrawals()).toBe(result);
    });
  });

  describe('getAllWithdrawalsOnValidation', () => {
    it('should call getAllWithdrawalsOnValidation without arguments', async () => {
      jest
        .spyOn(withdrawalService, 'getAllWithdrawalsOnValidation')
        .mockImplementation();

      await controller.getAllWithdrawalsOnValidation();

      expect(
        withdrawalService.getAllWithdrawalsOnValidation,
      ).toHaveBeenCalledWith();
    });

    it('should return all pending withdrawals', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get all withdrawals on validation',
        data: withdrawals,
      };

      jest
        .spyOn(withdrawalService, 'getAllWithdrawalsOnValidation')
        .mockImplementation(async () => result);

      expect(await controller.getAllWithdrawalsOnValidation()).toBe(result);
    });

    it('should return an empty array if no withdrawals are pending', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get all withdrawals on validation',
        data: [],
      };

      jest
        .spyOn(withdrawalService, 'getAllWithdrawalsOnValidation')
        .mockImplementation(async () => result);

      expect(await controller.getAllWithdrawalsOnValidation()).toBe(result);
    });
  });

  describe('getOwnedWithdrawals', () => {
    it('should call getOwnedWithdrawals with the current user id', async () => {
      jest.spyOn(withdrawalService, 'getOwnedWithdrawals').mockImplementation();

      await controller.getOwnedWithdrawals(mockedUser.id);

      expect(withdrawalService.getOwnedWithdrawals).toHaveBeenCalledWith(
        mockedUser.id,
      );
    });

    it('should return withdrawals owned by the user', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get owned withdrawals',
        data: withdrawals,
      };

      jest
        .spyOn(withdrawalService, 'getOwnedWithdrawals')
        .mockImplementation(async () => result);

      expect(await controller.getOwnedWithdrawals(mockedUser.id)).toBe(result);
    });

    it('should return an empty array if the user has no withdrawals', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully get owned withdrawals',
        data: [],
      };

      jest
        .spyOn(withdrawalService, 'getOwnedWithdrawals')
        .mockImplementation(async () => result);

      expect(await controller.getOwnedWithdrawals(mockedUser.id)).toBe(result);
    });
  });

  describe('createWithdrawal', () => {
    it('should call createWithdrawal with the current user and withdrawal data', async () => {
      jest.spyOn(withdrawalService, 'createWithdrawal').mockImplementation();

      await controller.createWithdrawal(createWithdrawalDto, mockedUser);

      expect(withdrawalService.createWithdrawal).toHaveBeenCalledWith(
        mockedUser,
        createWithdrawalDto,
      );
    });

    it('should create a withdrawal successfully', async () => {
      const result = {
        statusCode: 201,
        message: 'Successfully create a withdrawal',
        data: withdrawals[0],
      };

      jest
        .spyOn(withdrawalService, 'createWithdrawal')
        .mockImplementation(async () => result);

      expect(
        await controller.createWithdrawal(createWithdrawalDto, mockedUser),
      ).toBe(result);
    });

    it('should handle invalid amount when withdrawal creation', async () => {
      jest
        .spyOn(withdrawalService, 'createWithdrawal')
        .mockRejectedValue(
          new BadRequestException('Amount cannot be negative'),
        );

      await expect(
        controller.createWithdrawal(createWithdrawalDto, mockedUser),
      ).rejects.toThrow(new BadRequestException('Amount cannot be negative'));
    });

    it('should handle insufficient credits when withdrawal creation', async () => {
      jest
        .spyOn(withdrawalService, 'createWithdrawal')
        .mockRejectedValue(new BadRequestException('Insufficient credits'));

      await expect(
        controller.createWithdrawal(createWithdrawalDto, mockedUser),
      ).rejects.toThrow(new BadRequestException('Insufficient credits'));
    });
  });

  describe('validateWithdrawal', () => {
    it('should call validateWithdrawal with the withdrawal id and validation data', async () => {
      jest.spyOn(withdrawalService, 'validateWithdrawal').mockImplementation();

      await controller.validateWithdrawal(validateWithdrawalDto, '1');

      expect(withdrawalService.validateWithdrawal).toHaveBeenCalledWith(
        '1',
        validateWithdrawalDto,
      );
    });

    it('should validate a withdrawal successfully', async () => {
      const result = {
        statusCode: 200,
        message: 'Successfully validate the withdrawal',
        data: withdrawals[0],
      };

      jest
        .spyOn(withdrawalService, 'validateWithdrawal')
        .mockImplementation(async () => result);

      expect(
        await controller.validateWithdrawal(validateWithdrawalDto, '1'),
      ).toBe(result);
    });

    it('should handle invalid withdrawal id when validation', async () => {
      jest
        .spyOn(withdrawalService, 'validateWithdrawal')
        .mockRejectedValue(
          new NotFoundException('The withdrawal is not found'),
        );

      await expect(
        controller.validateWithdrawal(validateWithdrawalDto, '1'),
      ).rejects.toThrow(new NotFoundException('The withdrawal is not found'));
    });

    it('should handle revalidation', async () => {
      jest
        .spyOn(withdrawalService, 'validateWithdrawal')
        .mockRejectedValue(
          new BadRequestException('The withdrawal has already been validated'),
        );

      await expect(
        controller.validateWithdrawal(validateWithdrawalDto, '1'),
      ).rejects.toThrow(
        new BadRequestException('The withdrawal has already been validated'),
      );
    });
  });
});
