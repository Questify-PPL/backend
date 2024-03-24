import { Test, TestingModule } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

describe('ShopController', () => {
  let controller: ShopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        {
          provide: ShopService,
          useValue: {
            getShopItems: jest.fn().mockResolvedValue({}),
            getInvoices: jest.fn().mockResolvedValue({}),
            buyItem: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ShopController>(ShopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call shopService.getShopItems with the correct arguments', async () => {
    const userId = 'userId';

    expect(await controller.getShopItems(userId)).toEqual({});
  });

  it('should call shopService.getInvoices with the correct arguments', async () => {
    const userId = 'userId';

    expect(await controller.getInvoices(userId)).toEqual({});
  });

  it('should call shopService.buyItem with the correct arguments', async () => {
    const userId = 'userId';
    const buyItemDTO = { itemId: 'itemId', voucherId: 'voucherId' } as any;

    expect(await controller.buyItem(userId, buyItemDTO)).toEqual({});
  });
});
