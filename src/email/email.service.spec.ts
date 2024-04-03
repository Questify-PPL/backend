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

    await expect(
      service.sendVerificationMail('test@example.com'),
    ).resolves.toEqual({
      statusCode: 200,
      message: 'Email successfully sent for verification',
    });

    expect(mailerService.sendMail).toHaveBeenCalled();
  });

  it('should throw BadRequestException if user email is null', async () => {
    await expect(service.sendVerificationMail(null)).rejects.toThrow(
      new BadRequestException('User not found'),
    );
  });

  it('should verify the user successfully', async () => {
    const token = 'validToken';
    const userEmail = 'test@example.com';
    prismaService.verificationToken.findUnique = jest.fn().mockResolvedValue({
      email: userEmail,
      token: token,
      expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    });
    prismaService.user.findUnique = jest.fn().mockResolvedValue({
      email: userEmail,
      isVerified: false,
    });

    const response = await service.verifyUser(token);

    expect(response).toEqual({
      statusCode: 200,
      message: 'Email successfully verified',
    });
    expect(prismaService.user.update).toHaveBeenCalled();
    expect(prismaService.verificationToken.delete).toHaveBeenCalledWith({
      where: { token },
    });
  });

  it('should throw an error if user does not exist', async () => {
    prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      service.sendVerificationMail('nonexistent@example.com'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if user is already verified while sending verification mail', async () => {
    prismaService.user.findUnique = jest
      .fn()
      .mockResolvedValue({ isVerified: true });

    await expect(
      service.sendVerificationMail('verified@example.com'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw an error if trying to verify an already verified user', async () => {
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
      isVerified: true,
    });
    prismaService.verificationToken.findUnique = jest.fn().mockResolvedValue({
      email: 'test@example.com',
      expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    });

    await expect(service.verifyUser('valid-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw an error if the token is expired', async () => {
    prismaService.verificationToken.findUnique = jest.fn().mockResolvedValue({
      email: 'test@example.com',
      expiresAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    });
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
      isVerified: false,
    });

    await expect(service.verifyUser('expired-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should send the contact data with the user data to Questify', async () => {
    enum Role {
      CREATOR = 'CREATOR',
      RESPONDENT = 'RESPONDENT',
    }
    const mockedUser = {
      id: '1',
      email: 'johndoe@gmail.com',
      roles: [Role.CREATOR, Role.RESPONDENT],
      password: null,
      ssoUsername: null,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null,
      gender: null,
      companyName: null,
      birthDate: null,
      credit: 0,
      isVerified: true,
      isBlocked: false,
      hasCompletedProfile: true,
    };
    const contactDataDTO = { subject: 'Test Subject', message: 'Test Message' };

    mailerService.sendMail = jest.fn().mockResolvedValue(true);

    const result = await service.sendContactData(mockedUser, contactDataDTO);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'questifyst.official@gmail.com',
      subject: 'New Message from Contact Us',
      html: `
        <p>Hello Questify Team,</p>
        <p>A user has sent a message through the Contact Us feature with the following details:</p>
        <p>Name: ${mockedUser.firstName} ${mockedUser.lastName}</p>
        <p>Email: ${mockedUser.email}</p>
        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
          <p><strong>${contactDataDTO.subject}</strong></p>
          <div style="border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px;">
            <p>${contactDataDTO.message}</p>
          </div>
        </div>
        <p>Please respond to the user's inquiry or feedback as soon as possible.</p>
        <p>Thank you.</p>
      `,
    });

    expect(result).toEqual({
      statusCode: 201,
      message: 'Email successfully sent to Questify',
    });
  });

  it('should throw an error if the user is null', async () => {
    const mockedUser = null;
    const contactDataDTO = { subject: 'Test Subject', message: 'Test Message' };

    await expect(
      service.sendContactData(mockedUser, contactDataDTO),
    ).rejects.toThrow(new BadRequestException('Invalid User'));
  });

  it('should throw an error if the user has no name', async () => {
    enum Role {
      CREATOR = 'CREATOR',
      RESPONDENT = 'RESPONDENT',
    }
    const mockedUser = {
      id: '1',
      email: 'johndoe@gmail.com',
      roles: [Role.CREATOR, Role.RESPONDENT],
      password: null,
      ssoUsername: null,
      firstName: '',
      lastName: '',
      phoneNumber: null,
      gender: null,
      companyName: null,
      birthDate: null,
      credit: 0,
      isVerified: true,
      isBlocked: false,
      hasCompletedProfile: true,
    };
    const contactDataDTO = { subject: 'Test Subject', message: 'Test Message' };

    await expect(
      service.sendContactData(mockedUser, contactDataDTO),
    ).rejects.toThrow(new BadRequestException('Invalid User'));
  });
});
