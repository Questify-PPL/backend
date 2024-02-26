import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendVerificationMail: jest.fn(),
            verifyUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle errors when sending a verification mail', async () => {
    const sendMailAuthDTO = { email: 'invalid@example.com' };
    emailService.sendVerificationMail = jest
      .fn()
      .mockRejectedValue(new Error('User not found'));

    await expect(
      controller.sendVerificationMail(sendMailAuthDTO),
    ).rejects.toThrow('User not found');
  });

  it('should call sendVerificationMail with the provided email', async () => {
    const sendMailAuthDTO = { email: 'test@example.com' };
    await controller.sendVerificationMail(sendMailAuthDTO);
    expect(emailService.sendVerificationMail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should successfully verify the user', async () => {
    const token = 'valid-token';
    await controller.verifyEmail(token);
    expect(emailService.verifyUser).toHaveBeenCalledWith(token);
  });

  it('should handle errors during email verification', async () => {
    const token = 'invalid-token';
    emailService.verifyUser = jest
      .fn()
      .mockRejectedValue(new Error('Invalid or expired token'));

    await expect(controller.verifyEmail(token)).rejects.toThrow(
      'Invalid or expired token',
    );
  });
});
