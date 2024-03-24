import { Test } from '@nestjs/testing';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { CreateTopupDto } from 'src/dto/topup/createTopup.dto';
import { ValidateTopupDto } from 'src/dto/topup/validateTopup.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('TopupController', () => {
  let controller: TopupController;
  let topupService: TopupService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TopupController],
      providers: [
        {
          provide: TopupService,
          useValue: {
            getAllOnValidationInvoice: jest.fn(),
            getOwnedTopupInvoice: jest.fn(),
            createTopup: jest.fn(),
            validateTopup: jest.fn(),
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

    controller = module.get<TopupController>(TopupController);
    topupService = module.get<TopupService>(TopupService);
  });

  describe('getAllInvoices', () => {
    it('should return an array of empty invoices', async () => {
      const result = { statusCode: 200, message: 'Success', data: [] };
      jest
        .spyOn(topupService, 'getAllOnValidationInvoice')
        .mockImplementation(async () => result);

      expect(await controller.getAllInvoices()).toBe(result);
    });

    it('should return all invoices for an admin', async () => {
      const expectedResult = {
        statusCode: 200,
        message: 'Successfully get all on validation invoice',
        data: ['invoice1', 'invoice2'],
      };

      (topupService.getAllOnValidationInvoice as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getAllInvoices();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getOwnedTopupInvoice', () => {
    it('should return an array of owned topup invoices', async () => {
      const userId = 'user123';
      const result = { statusCode: 200, message: 'Success', data: [] };
      jest
        .spyOn(topupService, 'getOwnedTopupInvoice')
        .mockImplementation(async () => result);

      expect(await controller.getOwnedTopupInvoice(userId)).toBe(result);
    });
  });

  describe('createTopup', () => {
    it('should create a topup invoice successfully', async () => {
      const createTopupDto = new CreateTopupDto();
      const userId = 'user123';
      const type = 'creator';
      const file = {} as Express.Multer.File;
      const result = {
        statusCode: 201,
        message: 'Invoice created',
        data: {
          id: 'invoiceId',
          creatorId: 'creatorId',
          amount: 100,
          status: 'Pending',
          buktiPembayaranUrl: 'https://example.com',
          createdAt: new Date(),
          validatedAt: null,
        },
      };

      jest.spyOn(topupService, 'createTopup').mockImplementation(async () => {
        return result;
      });

      expect(
        await controller.createTopup(file, createTopupDto, userId, type),
      ).toBe(result);
    });

    it('should handle service exceptions', async () => {
      const userId = 'user1';
      const type = 'wrongType';
      const createTopupDto = { amount: 100 };
      const file = {} as Express.Multer.File;

      jest
        .spyOn(topupService, 'createTopup')
        .mockRejectedValue(new BadRequestException('Type must be creator'));

      await expect(
        controller.createTopup(file, createTopupDto, userId, type),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateInvoice', () => {
    it('should validate an invoice successfully', async () => {
      const validateTopupDto = new ValidateTopupDto();
      const type = 'admin';
      const invoiceId = 'invoice123';
      const result = {
        statusCode: 200,
        message: 'Invoice validated',
        data: {
          id: 'invoiceId',
          creatorId: 'creatorId',
          amount: 100,
          status: 'Validated',
          buktiPembayaranUrl: 'https://example.com',
          createdAt: new Date(),
          validatedAt: new Date(),
        },
      };

      jest
        .spyOn(topupService, 'validateTopup')
        .mockImplementation(async () => result);

      expect(
        await controller.validateInvoice(validateTopupDto, type, invoiceId),
      ).toBe(result);
    });

    it('should handle service exceptions', async () => {
      const invoiceId = 'invoice1';
      const type = 'wrongType';
      const validateTopupDto = { isValidated: true };

      jest
        .spyOn(topupService, 'validateTopup')
        .mockRejectedValue(new BadRequestException('Type must be an admin'));

      await expect(
        controller.validateInvoice(validateTopupDto, type, invoiceId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
