import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { TopupService } from './topup.service';
import { Role } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('TopupService', () => {
  let service: TopupService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TopupService,
        {
          provide: PrismaService,
          useValue: {
            invoiceTopup: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TopupService>(TopupService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOnValidationInvoice', () => {
    it('should return all pending invoices', async () => {
      const mockInvoices: {
        id: string;
        creatorId: string;
        amount: number;
        status: string;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
      }[] = [
        {
          id: 'invoice1',
          creatorId: 'creator1',
          amount: 100,
          status: 'Pending',
          buktiPembayaranUrl: 'url1',
          createdAt: new Date(),
          validatedAt: new Date(),
        },
        {
          id: 'invoice2',
          creatorId: 'creator2',
          amount: 200,
          status: 'Pending',
          buktiPembayaranUrl: 'url2',
          createdAt: new Date(),
          validatedAt: new Date(),
        },
      ];
      jest
        .spyOn(prismaService.invoiceTopup, 'findMany')
        .mockResolvedValue(mockInvoices);

      const result = await service.getAllOnValidationInvoice();
      expect(result.data).toEqual(mockInvoices);
      expect(prismaService.invoiceTopup.findMany).toHaveBeenCalledWith({
        where: { status: 'Pending' },
      });
    });

    it('should return an empty array if no invoices are pending', async () => {
      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue([]);
      const result = await service.getAllOnValidationInvoice();
      expect(result.data).toEqual([]);
    });
  });

  describe('createTopup', () => {
    const userId = 'user1';
    const type = 'creator';
    const createTopupDto = { amount: 100 };
    const buktiPembayaranUrl = 'https://example.com/path/to/file';

    it('should create a topup invoice successfully', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        roles: [Role.CREATOR],
        password: 'password',
        ssoUsername: 'username',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '123456789',
        gender: 'male',
        companyName: 'Company',
        birthDate: new Date(),
        credit: 100,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: true,
      });
      const invoice = {
        id: 'invoiceId',
        creatorId: userId,
        amount: createTopupDto.amount,
        buktiPembayaranUrl,
        status: 'Pending',
        createdAt: new Date(),
        validatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.invoiceTopup, 'create')
        .mockResolvedValue(invoice);

      const result = await service.createTopup(
        userId,
        type,
        createTopupDto,
        buktiPembayaranUrl,
      );

      expect(result.data).toHaveProperty('id');
      expect(result.statusCode).toEqual(201);
    });

    it("should falied on creating a topup invoice if user doesn't exist", async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createTopup(userId, type, createTopupDto, buktiPembayaranUrl),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if user type is not creator', async () => {
      await expect(
        service.createTopup('userId', 'wrongType', { amount: 100 }, 'url'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateTopup', () => {
    const invoiceId = 'invoice1';
    const type = 'admin';
    const validateTopupDto = { isValidated: true };
    const rejectTopupDto = { isValidated: false };

    const invoice = {
      id: invoiceId,
      status: 'Pending',
      creatorId: 'user1',
      amount: 100,
      buktiPembayaranUrl: 'url',
      createdAt: new Date(),
      validatedAt: new Date(),
    };

    const user = {
      id: 'user1',
      email: 'user@example.com',
      roles: [Role.CREATOR],
      password: 'password',
      ssoUsername: 'username',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123456789',
      gender: 'male',
      companyName: 'Company',
      birthDate: new Date(),
      credit: 100,
      isVerified: true,
      isBlocked: false,
      hasCompletedProfile: true,
    };

    it('should throw an error if user type is not admin', async () => {
      await expect(
        service.validateTopup('invoiceId', 'creator', {
          isValidated: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if invoice does not exist', async () => {
      prismaService.invoiceTopup.findUnique = jest.fn().mockResolvedValue(null);

      expect(
        service.validateTopup('invalidInvoice', 'admin', { isValidated: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate an invoice successfully', async () => {
      jest
        .spyOn(prismaService.invoiceTopup, 'findUnique')
        .mockResolvedValue(invoice);

      const updated = { ...invoice };
      updated.status = 'Validated';
      updated.validatedAt = new Date();

      jest
        .spyOn(prismaService.invoiceTopup, 'update')
        .mockResolvedValue(updated);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.validateTopup(
        invoiceId,
        type,
        validateTopupDto,
      );

      expect(result.data.status).toEqual('Validated');
      expect(result.statusCode).toEqual(200);
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it("should failed on validating an invoice if user doesn't exist", async () => {
      jest
        .spyOn(prismaService.invoiceTopup, 'findUnique')
        .mockResolvedValue(invoice);

      const updated = { ...invoice };
      updated.status = 'Validated';
      updated.validatedAt = new Date();

      jest
        .spyOn(prismaService.invoiceTopup, 'update')
        .mockResolvedValue(updated);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.validateTopup(invoiceId, type, validateTopupDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject an invoice successfully', async () => {
      jest
        .spyOn(prismaService.invoiceTopup, 'findUnique')
        .mockResolvedValue(invoice);

      const updated = { ...invoice };
      updated.status = 'Rejected';
      updated.validatedAt = new Date();

      jest
        .spyOn(prismaService.invoiceTopup, 'update')
        .mockResolvedValue(updated);

      const result = await service.validateTopup(
        invoiceId,
        type,
        rejectTopupDto,
      );

      expect(result.data.status).toEqual('Rejected');
      expect(result.statusCode).toEqual(200);
      expect(user.credit).toBe(100);
    });

    it('should throw BadRequestException if invoice is not in Pending state', async () => {
      prismaService.invoiceTopup.findUnique = jest.fn().mockResolvedValue({
        status: 'Validated',
      });
      await expect(
        service.validateTopup('invoice2', 'admin', { isValidated: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should correctly increase the user's credit on valid invoice validation", async () => {
      const invoiceId = 'invoiceId';
      const userId = 'userId';
      const originalCredit = 100;
      const invoiceAmount = 50;
      const newCredit = originalCredit + invoiceAmount;
      const type = 'admin';
      const validateTopupDto = { isValidated: true };

      jest.spyOn(prismaService.invoiceTopup, 'findUnique').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: invoiceAmount,
        status: 'Pending',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: 0,
        status: 'Validated',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        roles: [Role.CREATOR],
        password: 'password',
        ssoUsername: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        gender: 'male',
        companyName: 'ABC Company',
        birthDate: new Date(),
        credit: originalCredit,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: true,
      });

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        roles: [Role.CREATOR],
        password: 'password',
        ssoUsername: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        gender: 'male',
        companyName: 'ABC Company',
        birthDate: new Date(),
        credit: newCredit,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: true,
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: 0,
        status: 'Validated',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      const result = await service.validateTopup(
        invoiceId,
        type,
        validateTopupDto,
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { credit: newCredit },
      });

      expect(result.data.status).toBe('Validated');
      expect(result.statusCode).toBe(200);
    });

    it("should correctly handled the user's credit if initial value is null", async () => {
      const invoiceId = 'invoiceId';
      const userId = 'userId';
      const originalCredit = null;
      const invoiceAmount = 50;
      const newCredit = 0 + invoiceAmount;
      const type = 'admin';
      const validateTopupDto = { isValidated: true };

      jest.spyOn(prismaService.invoiceTopup, 'findUnique').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: invoiceAmount,
        status: 'Pending',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: 0,
        status: 'Validated',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        roles: [Role.CREATOR],
        password: 'password',
        ssoUsername: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        gender: 'male',
        companyName: 'ABC Company',
        birthDate: new Date(),
        credit: originalCredit,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: true,
      });

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        roles: [Role.CREATOR],
        password: 'password',
        ssoUsername: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        gender: 'male',
        companyName: 'ABC Company',
        birthDate: new Date(),
        credit: newCredit,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: true,
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        amount: 0,
        status: 'Validated',
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
      });

      const result = await service.validateTopup(
        invoiceId,
        type,
        validateTopupDto,
      );

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { credit: newCredit },
      });

      expect(result.data.status).toBe('Validated');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('getOwnedTopupInvoice', () => {
    const userId = 'user1';

    it('should return invoices owned by the user', async () => {
      const mockInvoices = [
        {
          id: 'invoice1',
          creatorId: userId,
          status: 'Pending',
          amount: 0,
          buktiPembayaranUrl: '',
          createdAt: new Date(),
          validatedAt: new Date(),
        },
        {
          id: 'invoice2',
          creatorId: userId,
          status: 'Pending',
          amount: 0,
          buktiPembayaranUrl: '',
          createdAt: new Date(),
          validatedAt: new Date(),
        },
      ];
      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue(
        mockInvoices.map((invoice) => ({
          ...invoice,
          amount: 0,
          buktiPembayaranUrl: '',
          createdAt: new Date(),
          validatedAt: new Date(),
          onValidationCount: undefined,
        })),
      );
      jest
        .spyOn(prismaService.invoiceTopup, 'count')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);

      const result = await service.getOwnedTopupInvoice(userId);
      expect(result.data).toEqual(mockInvoices);
      expect(result.statusCode).toEqual(200);
    });

    it('should handle the case where user has no invoices', async () => {
      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue([]);
      const result = await service.getOwnedTopupInvoice(userId);
      expect(result.data).toEqual([]);
      expect(result.statusCode).toEqual(200);
    });
  });
});
