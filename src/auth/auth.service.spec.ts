import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from 'src/dto';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);

    //  Mock bcrypt.compare to always return true
    // jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if user does not exist', async () => {
    // Mock findUnique to return null (user not found)
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    const loginDTO: LoginDTO = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    await expect(service.login(loginDTO)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if password does not match', async () => {
    // Mock findUnique to return a user object
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: '$2a$10$DpHVSMV3D1NwHfHTUzAHhuxLuXuPENZ9SHLD5bFG2QKf9tPaQBlri', // encyrpted should be passwordtest
    } as any);

    const loginDTO: LoginDTO = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    await expect(service.login(loginDTO)).rejects.toThrow(
      'Password does not match',
    );
  });

  it('should login a user successfully', async () => {
    // Mock findUnique to return a user object
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: '$2a$10$DpHVSMV3D1NwHfHTUzAHhuxLuXuPENZ9SHLD5bFG2QKf9tPaQBlri', // encyrpted should be passwordtest
    } as any);

    const loginDTO: LoginDTO = {
      email: 'test@example.com',
      password: 'passwordtest',
    };

    const result = await service.login(loginDTO);

    expect(result).toEqual({
      statusCode: 200,
      message: 'Success',
      data: {
        accessToken: 'token',
      },
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { userId: '1' },
      expect.any(Object),
    );
  });

  it('should register a user successfully', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    jest.spyOn(prismaService, '$transaction').mockImplementation(async (fn) => {
      return await fn(prismaService);
    });

    const registerDTO = {
      email: 'test@example.com',
      password: 'passwordtest',
    };

    const result = await service.register(registerDTO);

    expect(result).toEqual({
      statusCode: 201,
      message: 'Success',
      data: {
        id: expect.any(String),
        email: 'test@example.com',
      },
    });
  });
});
