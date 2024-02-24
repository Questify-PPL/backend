import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTDTO } from 'src/dto';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('yourJwtSecret'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  it('should validate a user', async () => {
    const userPayload: JWTDTO = { sub: '12345', userId: '1' };
    const user = { id: '1', email: 'test@example.com' };

    jest
      .spyOn(prismaService.user, 'findUniqueOrThrow')
      .mockResolvedValue(user as any);

    const result = await jwtStrategy.validate(userPayload);

    expect(result).toEqual(user);
    expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: userPayload.userId },
    });
  });

  it('should return null if user not found', async () => {
    const userPayload: JWTDTO = { sub: '12345', userId: '1' };

    jest.spyOn(prismaService.user, 'findUniqueOrThrow').mockResolvedValue(null);

    const result = await jwtStrategy.validate(userPayload);

    expect(result).toBeNull();
  });
});
