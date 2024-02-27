import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}

  public async sendVerificationMail(userEmail: string) {
    const supportEmail = process.env.USERNAME_SMTP_GMAIL;
    const user = await this.prismaService.user.findUnique({
      where: { email: userEmail },
    });

    if (userEmail == null || user == null) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    const verificationToken = await this.generateVerificationToken(userEmail);
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register/verification?token=${verificationToken}`;

    this.mailerService.sendMail({
      to: userEmail,
      subject: `Welcome onboard! Please verify your email address.`,
      text: `Welcome onboard! Please verify your email address.`,
      html: `
            <p>Dear User,</p>
            <p>Thank you for choosing Questify. To ensure the security of your account and to complete your registration process, we kindly ask you to verify your email address.</p>
            <p>Please confirm that ${userEmail} is your email address by clicking on the following verification link:</p>
            <p><a href="${verificationLink}" target="_blank">Verify Email Address</a></p>
            <p>If you did not initiate this request, please ignore this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a> if you have any questions.</p>
            <p>Warm regards,</p>
            <p>The Questify Team</p>
          `,
    });

    return {
      statusCode: 200,
      message: 'Email successfully sent for verification',
    };
  }

  private async generateVerificationToken(userEmail: string): Promise<string> {
    const randomBuffer = randomBytes(32);
    const token = randomBuffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    await this.prismaService.verificationToken.create({
      data: {
        email: userEmail,
        token: token,
        expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      },
    });

    return token;
  }

  public async verifyUser(token: string) {
    const tokenRecord = await this.prismaService.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.prismaService.user.findUnique({
      where: { email: tokenRecord.email },
    });

    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    await this.prismaService.user.update({
      where: { email: tokenRecord.email },
      data: { isVerified: true },
    });

    await this.prismaService.verificationToken.delete({
      where: { token },
    });

    return {
      statusCode: 200,
      message: 'Email successfully verified',
    };
  }
}
