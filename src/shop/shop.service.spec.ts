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

    try {
      await service.buyItem(userId, buyItemDTO);
    } catch (e) {
      expect(e.message).toEqual('Item not found');
    }
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

    try {
      await service.buyItem(userId, buyItemDTO);
    } catch (e) {
      expect(e.message).toEqual('Voucher not found');
    }
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

    try {
      await service.buyItem(userId, buyItemDTO);
    } catch (e) {
      expect(e.message).toEqual('Voucher already used');
    }
  });
});
