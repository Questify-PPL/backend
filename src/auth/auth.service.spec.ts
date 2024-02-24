import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from 'src/dto';
import { NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const dummyUser = {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$DpHVSMV3D1NwHfHTUzAHhuxLuXuPENZ9SHLD5bFG2QKf9tPaQBlri', // encyrpted should be passwordtest
  };

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
            $transaction: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
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

  it('should throw BadRequestException if user is an SSO user when login', async () => {
    const loginDTO: LoginDTO = {
      email: 'test@ui.ac.id',
      password: 'testpassword',
    };

    await expect(service.login(loginDTO)).rejects.toThrow(
      'Please sign in with SSO instead',
    );
  });

  it('should throw NotFoundException if user does not exist when login', async () => {
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
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(dummyUser as any);

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
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(dummyUser as any);

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

  it('should throw BadRequestException if user is an SSO user when register', async () => {
    const registerDTO = {
      email: 'test@ui.ac.id',
      password: 'testpassword',
    };

    await expect(service.register(registerDTO)).rejects.toThrow(
      'Please sign up with SSO instead',
    );
  });

  it('should throw BadRequestException if user already exists when register', async () => {
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(dummyUser as any);

    const registerDTO = {
      email: 'test@example.com',
      password: 'newpassword',
    };

    await expect(service.register(registerDTO)).rejects.toThrow(
      'User already exists',
    );
  });

  it('should register a user successfully', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        // Simulate the creation of a user
        const createdUser = {
          id: '1',
          email: 'test@example.com',
          password:
            '$2a$10$DpHVSMV3D1NwHfHTUzAHhuxLuXuPENZ9SHLD5bFG2QKf9tPaQBlri',
        };

        // Simulate the creation of a Creator role
        const createdCreator = {
          userId: createdUser.id,
        };

        const prismaMock = {
          user: {
            create: jest.fn().mockResolvedValue(createdUser),
          },
          creator: {
            create: jest.fn().mockResolvedValue(createdCreator),
          },
        } as any;

        return prisma(prismaMock);
      });

    // TODO: MOCK EMAIL SERVICE USAGE

    const registerDTO = {
      email: 'test@example.com',
      password: 'passwordtest',
    };

    const result = await service.register(registerDTO);

    expect(result).toEqual({
      statusCode: 201,
      message: 'User created',
      data: {
        id: expect.any(String),
        email: 'test@example.com',
      },
    });
  });
});
