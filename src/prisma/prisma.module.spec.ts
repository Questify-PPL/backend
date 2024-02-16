import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';

describe('PrismaModule', () => {
  let prismaModule: TestingModule;

  beforeEach(async () => {
    prismaModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(prismaModule).toBeDefined();
  });
});
