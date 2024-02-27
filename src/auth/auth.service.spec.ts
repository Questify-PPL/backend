import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO } from 'src/dto';
import { NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let httpService: HttpService;
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
              update: jest.fn(),
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
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
        accessToken: expect.any(String),
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
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      ...dummyUser,
      isVerified: true,
    } as any);

    const registerDTO = {
      email: 'test@example.com',
      password: 'newpassword',
    };

    await expect(service.register(registerDTO)).rejects.toThrow(
      'User already exists',
    );
  });

  it('should update user if user already exists but has not been verified when register', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      ...dummyUser,
      isVerified: false,
    } as any);

    jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue(dummyUser as any);

    const registerDTO = {
      email: 'test@example.com',
      password: 'updatedPassword',
    };

    const result = await service.register(registerDTO);

    expect(result).toEqual({
      statusCode: 201,
      message: 'User successfully created, please verify your email',
      data: expect.any(Object),
    });
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

    const registerDTO = {
      email: 'test@example.com',
      password: 'passwordtest',
    };

    const result = await service.register(registerDTO);

    expect(result).toEqual({
      statusCode: 201,
      message: 'User successfully created, please verify your email',
      data: expect.any(Object),
    });
  });

  it('should send BadRequestException if CAS server is unavailable', async () => {
    const mockResponse: AxiosResponse<any> = {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {
        headers: {} as any,
      },
      data: ``,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const ssoDTO = {
      ticket: 'ticket',
      serviceURL: 'serviceURL',
    };

    await expect(service.loginSSO(ssoDTO)).rejects.toThrow(
      'CAS Server failed to response, please try again later',
    );
  });

  it('should send BadRequestException if parsed XML is invalid', async () => {
    const mockResponse: AxiosResponse<any> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as any,
      },
      data: `Invalid XML`,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const ssoDTO = {
      ticket: 'ticket',
      serviceURL: 'serviceURL',
    };

    await expect(service.loginSSO(ssoDTO)).rejects.toThrow(
      'Failed to parse XML',
    );
  });

  it('should send BadRequestException if authentication failure happens', async () => {
    const mockResponse: AxiosResponse<any> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as any,
      },
      data: `
        <cas:serviceResponse>
          <cas:authenticationFailure code="INVALID_TICKET">
            Invalid ticket
          </cas:authenticationFailure>
        </cas:serviceResponse>
      `,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const ssoDTO = {
      ticket: 'ticket',
      serviceURL: 'serviceURL',
    };

    await expect(service.loginSSO(ssoDTO)).rejects.toThrow('Invalid ticket');
  });

  it('should handle loginSSO correctly and register if user does not exist', async () => {
    // Mock the HTTP request
    const mockResponse: AxiosResponse<any> = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as any,
      },
      data: `
        <cas:serviceResponse>
          <cas:authenticationSuccess>
            <cas:user>user</cas:user>
            <cas:attributes>
              <cas:nama>username</cas:nama>
              <cas:kd_org>kd_org</cas:kd_org>
              <cas:peran_user>peran_user</cas:peran_user>
              <cas:npm>npm</cas:npm>
            </cas:attributes>
          </cas:authenticationSuccess>
        </cas:serviceResponse>
      `,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    // Mock the XML parsing
    const parser = new XMLParser({
      attributeNamePrefix: '',
    });
    jest.spyOn(parser, 'parse').mockReturnValue(mockResponse.data);
    jest.spyOn(prismaService.user, 'findUnique').mockReturnValue(null);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (prisma) => {
        const createdUser = {
          id: 'UI123456',
          email: 'user@ui.ac.id',
          ssoUsername: 'username',
        };

        const createdCreator = {
          userId: createdUser.id,
        };

        const createdRespondent = {
          userId: createdUser.id,
        };

        const prismaMock = {
          user: {
            create: jest.fn().mockResolvedValue(createdUser),
          },
          creator: {
            create: jest.fn().mockResolvedValue(createdCreator),
          },
          respondent: {
            create: jest.fn().mockResolvedValue(createdRespondent),
          },
        } as any;

        return prisma(prismaMock);
      });

    const result = await service.loginSSO({
      ticket: 'ticket',
      serviceURL: 'serviceURL',
    });

    expect(result).toEqual({
      statusCode: 200,
      message: 'Success',
      data: {
        accessToken: expect.any(String),
      },
    });
  });
});
