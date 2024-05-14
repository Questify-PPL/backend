import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from './shop.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ShopService', () => {
  let service: ShopService;
  let prismaService: PrismaService;

  const dummyItem = {
    id: 'itemId',
    name: 'itemName',
    price: 100,
  };

  const dummyItems = [dummyItem];

  const dummyVoucher = {
    id: 'voucherId',
    name: 'voucherName',
    discount: 10,
  };

  const dummyVouchers = [dummyVoucher];

  const dummyPayment = {
    id: 'paymentId',
    amount: 100,
  };

  const dummyPayments = [dummyPayment];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        {
          provide: PrismaService,
          useValue: {
            item: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            voucher: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            payment: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getShopItems', () => {
    it('should call prismaService.item.findMany with the correct arguments', async () => {
      const userId = 'userId';

      jest
        .spyOn(prismaService.item, 'findMany')
        .mockResolvedValueOnce(dummyItems as any);

      jest
        .spyOn(prismaService.voucher, 'findMany')
        .mockResolvedValueOnce(dummyVouchers as any);

      expect(await service.getShopItems(userId)).toEqual({
        statusCode: 200,
        message: 'Successfully retrieved shop items',
        data: {
          shopItems: dummyItems,
          vouchers: dummyVouchers,
        },
      });
    });
  });

  describe('getInvoices', () => {
    it('should call prismaService.payment.findMany with the correct arguments', async () => {
      const userId = 'userId';

      jest
        .spyOn(prismaService.payment, 'findMany')
        .mockResolvedValueOnce(dummyPayments as any);

      expect(await service.getInvoices(userId)).toEqual({
        statusCode: 200,
        message: 'Successfully retrieved invoices',
        data: dummyPayments,
      });
    });
  });

  describe('buyItem', () => {
    it('should call prismaService.$transaction with the correct arguments', async () => {
      const userId = 'userId';
      const buyItemDTO = {
        itemId: 'itemId',
        voucherId: 'voucherId',
      } as any;

      const mockUser = {
        id: userId,
        credit: 1000,
        emptyForms: 0,
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockUser as any);

      jest
        .spyOn(prismaService.item, 'findUnique')
        .mockResolvedValueOnce(dummyItem as any);

      jest
        .spyOn(prismaService.voucher, 'findUnique')
        .mockResolvedValueOnce(dummyVoucher as any);

      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (prisma) => {
          const prismaMock = {
            user: {
              update: jest.fn().mockResolvedValue({
                id: userId,
              }),
            },
            creator: {
              update: jest.fn().mockResolvedValue({
                userId: userId,
              }),
            },
            payment: {
              create: jest.fn().mockResolvedValue(dummyPayment),
            },
            voucher: {
              findUnique: jest.fn().mockResolvedValue(dummyVoucher),
              update: jest.fn().mockResolvedValue(dummyVoucher),
            },
          };

          return prisma(prismaMock as any);
        });

      expect(await service.buyItem(userId, buyItemDTO)).toEqual({
        statusCode: 200,
        message: 'Successfully bought item',
        data: dummyPayment,
      });
    });
  });

  it('should throw an error if the item does not exist', async () => {
    const userId = 'userId';
    const buyItemDTO = {
      itemId: 'itemId',
      voucherId: 'voucherId',
    } as any;

    jest
      .spyOn(prismaService.item, 'findUnique')
      .mockResolvedValueOnce(null as any);

    await expect(service.buyItem(userId, buyItemDTO)).rejects.toThrow(
      'Item not found',
    );
  });

  it('should throw an error if the voucher does not exist', async () => {
    const userId = 'userId';
    const buyItemDTO = {
      itemId: 'itemId',
      voucherId: 'voucherId',
    } as any;

    jest
      .spyOn(prismaService.item, 'findUnique')
      .mockResolvedValueOnce(dummyItem as any);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const prismaMock = {
          voucher: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };

        return prisma(prismaMock as any);
      });

    await expect(service.buyItem(userId, buyItemDTO)).rejects.toThrow(
      'Voucher not found',
    );
  });

  it('should throw an error if the voucher is used', async () => {
    const userId = 'userId';
    const buyItemDTO = {
      itemId: 'itemId',
      voucherId: 'voucherId',
    } as any;

    jest
      .spyOn(prismaService.item, 'findUnique')
      .mockResolvedValueOnce(dummyItem as any);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const prismaMock = {
          voucher: {
            findUnique: jest.fn().mockResolvedValue({
              ...dummyVoucher,
              isUsed: true,
            }),
          },
        };

        return prisma(prismaMock as any);
      });

    await expect(service.buyItem(userId, buyItemDTO)).rejects.toThrow(
      'Voucher already used',
    );
  });

  it('should throw an error if credit is not enough', async () => {
    const userId = 'userId';
    const buyItemDTO = {
      itemId: 'itemId',
      voucherId: 'voucherId',
    } as any;

    const mockUser = {
      id: userId,
      credit: 0,
      emptyForms: 0,
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValueOnce(mockUser as any);

    jest.spyOn(prismaService.item, 'findUnique').mockResolvedValueOnce({
      ...dummyItem,
      price: 1000,
    } as any);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const prismaMock = {
          user: {
            update: jest.fn().mockResolvedValue({
              id: userId,
            }),
          },
          creator: {
            update: jest.fn().mockResolvedValue({
              userId: userId,
            }),
          },
          payment: {
            create: jest.fn().mockResolvedValue(dummyPayment),
          },
          voucher: {
            findUnique: jest.fn().mockResolvedValue(dummyVoucher),
            update: jest.fn().mockResolvedValue(dummyVoucher),
          },
        };

        return prisma(prismaMock as any);
      });

    await expect(service.buyItem(userId, buyItemDTO)).rejects.toThrow(
      'Insufficient credit',
    );
  });
});
