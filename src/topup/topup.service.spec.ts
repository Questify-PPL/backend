import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { TopupService } from './topup.service';
import { InvoiceStatus, Role } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
        {
          provide: CloudinaryService,
          useValue: {
            uploadBuktiPembayaran: jest
              .fn()
              .mockResolvedValue({ url: 'https://example.com/path/to/file' }),
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
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      }[] = [
        {
          id: 'invoice1',
          creatorId: 'creator1',
          creatorName: 'Creator 1',
          amount: 100,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url1',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 1',
          exchange: 'Exchange 1',
          accountNumber: 'Account Number 1',
        },
        {
          id: 'invoice2',
          creatorId: 'creator2',
          creatorName: 'Creator 2',
          amount: 200,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url2',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 2',
          exchange: 'Exchange 2',
          accountNumber: 'Account Number 2',
        },
      ];
      jest
        .spyOn(prismaService.invoiceTopup, 'findMany')
        .mockResolvedValue(mockInvoices);

      const result = await service.getAllOnValidationInvoice();
      expect(result.data).toEqual(mockInvoices);
      expect(prismaService.invoiceTopup.findMany).toHaveBeenCalledWith({
        where: {
          status: InvoiceStatus.PENDING,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return an empty array if no invoices are pending', async () => {
      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue([]);
      const result = await service.getAllOnValidationInvoice();
      expect(result.data).toEqual([]);
    });
  });

  describe('getAllInvoices', () => {
    it('should return all invoices', async () => {
      const mockInvoices: {
        id: string;
        creatorId: string;
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      }[] = [
        {
          id: 'invoice1',
          creatorId: 'creator1',
          creatorName: 'Creator 1',
          amount: 100,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url1',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 1',
          exchange: 'Exchange 1',
          accountNumber: 'Account Number 1',
        },
        {
          id: 'invoice2',
          creatorId: 'creator2',
          creatorName: 'Creator 2',
          amount: 200,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url2',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 2',
          exchange: 'Exchange 2',
          accountNumber: 'Account Number 2',
        },
      ];
      jest
        .spyOn(prismaService.invoiceTopup, 'findMany')
        .mockResolvedValue(mockInvoices);

      const result = await service.getAllInvoices();
      expect(result.data).toEqual(mockInvoices);
      expect(prismaService.invoiceTopup.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return an empty array if no invoices', async () => {
      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue([]);
      const result = await service.getAllInvoices();
      expect(result.data).toEqual([]);
    });
  });

  describe('createTopup', () => {
    const userId = 'user1';
    const type = 'creator';
    const createTopupDto = {
      amount: 100,
      payment: 'Payment 1',
      exchange: 'Exchange 1',
    };
    const file = {} as Express.Multer.File;

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
        id: 'invoice1',
        creatorId: 'creator1',
        creatorName: 'Creator 1',
        amount: 100,
        status: InvoiceStatus.PENDING,
        buktiPembayaranUrl: 'url1',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: 'Payment 1',
        exchange: 'Exchange 1',
        accountNumber: 'Account Number 1',
      };

      jest
        .spyOn(prismaService.invoiceTopup, 'create')
        .mockResolvedValue(invoice);

      const result = await service.createTopup(
        userId,
        type,
        createTopupDto,
        file,
      );

      expect(result.data).toHaveProperty('id');
      expect(result.statusCode).toEqual(201);
    });

    it("should falied on creating a topup invoice if user doesn't exist", async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createTopup(userId, type, createTopupDto, file),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if user type is not creator', async () => {
      await expect(
        service.createTopup('userId', 'wrongType', createTopupDto, file),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateTopup', () => {
    const invoiceId = 'invoice1';
    const type = 'admin';
    const validateTopupDto = { isApproved: true };
    const rejectTopupDto = { isApproved: false };

    const invoice = {
      id: invoiceId,
      status: InvoiceStatus.PENDING,
      creatorId: 'user1',
      amount: 100,
      buktiPembayaranUrl: 'url',
      createdAt: new Date(),
      validatedAt: new Date(),
      creatorName: 'John Doe',
      payment: 'payment',
      exchange: 'exchange',
      accountNumber: 'accountNumber',
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
          isApproved: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if invoice does not exist', async () => {
      prismaService.invoiceTopup.findUnique = jest.fn().mockResolvedValue(null);

      expect(
        service.validateTopup('invalidInvoice', 'admin', { isApproved: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate an invoice successfully', async () => {
      jest.spyOn(prismaService.invoiceTopup, 'findUnique').mockResolvedValue({
        ...invoice,
        creatorName: 'John Doe',
        payment: 'payment',
        exchange: 'exchange',
        accountNumber: 'accountNumber',
      });

      const updated: {
        id: string;
        creatorId: string;
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      } = {
        ...invoice,
        creatorName: 'John Doe',
        payment: 'payment',
        exchange: 'exchange',
        accountNumber: 'accountNumber',
      };
      updated.status = InvoiceStatus.APPROVED;
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

      expect(result.data.status).toEqual(InvoiceStatus.APPROVED);
      expect(result.statusCode).toEqual(200);
      expect(prismaService.user.update).toHaveBeenCalled();
    });

    it("should failed on validating an invoice if user doesn't exist", async () => {
      jest
        .spyOn(prismaService.invoiceTopup, 'findUnique')
        .mockResolvedValue(invoice);

      const updated: {
        id: string;
        creatorId: string;
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      } = {
        ...invoice,
        creatorName: 'John Doe',
        payment: 'payment',
        exchange: 'exchange',
        accountNumber: 'accountNumber',
      };
      updated.status = InvoiceStatus.APPROVED;
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

      const updated: {
        id: string;
        creatorId: string;
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      } = {
        ...invoice,
        creatorName: 'John Doe',
        payment: 'payment',
        exchange: 'exchange',
        accountNumber: 'accountNumber',
      };
      updated.status = InvoiceStatus.REJECTED;
      updated.validatedAt = new Date();

      jest
        .spyOn(prismaService.invoiceTopup, 'update')
        .mockResolvedValue(updated);

      const result = await service.validateTopup(
        invoiceId,
        type,
        rejectTopupDto,
      );

      expect(result.data.status).toEqual(InvoiceStatus.REJECTED);
      expect(result.statusCode).toEqual(200);
      expect(user.credit).toBe(100);
    });

    it('should throw BadRequestException if invoice is not in Pending state', async () => {
      prismaService.invoiceTopup.findUnique = jest.fn().mockResolvedValue({
        status: InvoiceStatus.APPROVED,
      });
      await expect(
        service.validateTopup('invoice2', 'admin', { isApproved: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should correctly increase the user's credit on valid invoice validation", async () => {
      const invoiceId = 'invoiceId';
      const userId = 'userId';
      const originalCredit = 100;
      const invoiceAmount = 50;
      const newCredit = originalCredit + invoiceAmount;
      const type = 'admin';
      const validateTopupDto = { isApproved: true };

      jest.spyOn(prismaService.invoiceTopup, 'findUnique').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        creatorName: 'John Doe',
        amount: invoiceAmount,
        status: InvoiceStatus.PENDING,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        creatorName: 'John Doe',
        amount: 0,
        status: InvoiceStatus.APPROVED,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
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
        creatorName: 'John Doe',
        amount: 0,
        status: InvoiceStatus.APPROVED,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
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

      expect(result.data.status).toBe(InvoiceStatus.APPROVED);
      expect(result.statusCode).toBe(200);
    });

    it("should correctly handled the user's credit if initial value is null", async () => {
      const invoiceId = 'invoiceId';
      const userId = 'userId';
      const originalCredit = null;
      const invoiceAmount = 50;
      const newCredit = 0 + invoiceAmount;
      const type = 'admin';
      const validateTopupDto = { isApproved: true };

      jest.spyOn(prismaService.invoiceTopup, 'findUnique').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        creatorName: 'John Doe',
        amount: invoiceAmount,
        status: InvoiceStatus.PENDING,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
      });

      jest.spyOn(prismaService.invoiceTopup, 'update').mockResolvedValue({
        id: invoiceId,
        creatorId: userId,
        creatorName: 'John Doe',
        amount: 0,
        status: InvoiceStatus.APPROVED,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
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
        creatorName: 'John Doe',
        amount: 0,
        status: InvoiceStatus.APPROVED,
        buktiPembayaranUrl: '',
        createdAt: new Date(),
        validatedAt: new Date(),
        payment: '',
        exchange: '',
        accountNumber: '',
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

      expect(result.data.status).toBe(InvoiceStatus.APPROVED);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('getOwnedTopupInvoice', () => {
    const userId = 'user1';

    it('should return invoices owned by the user', async () => {
      const mockInvoices: {
        id: string;
        creatorId: string;
        creatorName: string;
        amount: number;
        status: InvoiceStatus;
        buktiPembayaranUrl: string;
        createdAt: Date;
        validatedAt: Date;
        payment: string;
        exchange: string;
        accountNumber: string;
      }[] = [
        {
          id: 'invoice1',
          creatorId: 'creator1',
          creatorName: 'Creator 1',
          amount: 100,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url1',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 1',
          exchange: 'Exchange 1',
          accountNumber: 'Account Number 1',
        },
        {
          id: 'invoice2',
          creatorId: 'creator2',
          creatorName: 'Creator 2',
          amount: 200,
          status: InvoiceStatus.PENDING,
          buktiPembayaranUrl: 'url2',
          createdAt: new Date(),
          validatedAt: new Date(),
          payment: 'Payment 2',
          exchange: 'Exchange 2',
          accountNumber: 'Account Number 2',
        },
      ];

      jest.spyOn(prismaService.invoiceTopup, 'findMany').mockResolvedValue(
        mockInvoices.map((invoice) => ({
          ...invoice,
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
