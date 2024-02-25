import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('EmailService', () => {
  let service: EmailService;
  let prismaService: PrismaService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            verificationToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a verification email to an unverified user', async () => {
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      isVerified: false,
      email: 'test@example.com',
    });
    prismaService.verificationToken.create = jest.fn().mockResolvedValue({});
    mailerService.sendMail = jest.fn().mockResolvedValue(true);

    await service.sendVerificationMail('test@example.com');

    expect(mailerService.sendMail).toHaveBeenCalled();
  });

  it('should verify a user with a valid token', async () => {
    prismaService.verificationToken.findUnique = jest.fn().mockResolvedValue({
      email: 'test@example.com',
      expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    });
    prismaService.user.update = jest
      .fn()
      .mockResolvedValue({ isVerified: true });

    const result = await service.verifyUser('valid-token');

    expect(result).toEqual({ message: 'Email successfully verified' });
    expect(prismaService.user.update).toHaveBeenCalled();
  });

  it('should throw an error if user does not exist', async () => {
    prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      service.sendVerificationMail('nonexistent@example.com'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if user is already verified', async () => {
    prismaService.user.findUnique = jest
      .fn()
      .mockResolvedValue({ isVerified: true });

    await expect(
      service.sendVerificationMail('verified@example.com'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if the token is expired', async () => {
    prismaService.verificationToken.findUnique = jest.fn().mockResolvedValue({
      email: 'test@example.com',
      expiresAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    });

    await expect(service.verifyUser('expired-token')).rejects.toThrow(
      BadRequestException,
    );
  });
});
