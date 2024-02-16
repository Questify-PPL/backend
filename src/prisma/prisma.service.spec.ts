import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let prismaClientConnectSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest
      .spyOn(PrismaClient.prototype, '$connect')
      .mockImplementation(async () => {}); // Intercept db connection

    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleRef.get(PrismaService);
    prismaClientConnectSpy = jest.spyOn(prismaService, '$connect');
  });

  afterEach(() => {
    // Restore the original $connect method after each test
    jest.restoreAllMocks();
  });

  it('should connect on module init', async () => {
    expect(prismaClientConnectSpy).not.toHaveBeenCalled();
    await prismaService.onModuleInit();
    expect(prismaClientConnectSpy).toHaveBeenCalled();
  });
});
