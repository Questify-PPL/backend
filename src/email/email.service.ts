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
  async sendVerificationMail(userEmail: string): Promise<void> {
    // if(this.prismaService.user.findUnique({where: {email: userEmail}})){

    const recipientEmail = userEmail;
    const supportEmail = 'questifyst.official@gmail.com';

    const verificationToken = this.generateVerificationToken();
    await this.prismaService.verificationToken.create({
      data: {
        email: userEmail,
        token: verificationToken,
        expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      },
    });

    const verificationLink = `http://localhost:3001/api/v1/email/verify-email?token=${verificationToken}`;

    this.mailerService.sendMail({
      to: recipientEmail,
      subject: `Welcome onboard! Please verify your email address.`,
      text: `Welcome onboard! Please verify your email address.`,
      html: `
            <p>Dear User},</p>
            <p>Thank you for choosing Questify. To ensure the security of your account and to complete your registration process, we kindly ask you to verify your email address.</p>
            <p>Please confirm that ${recipientEmail} is your email address by clicking on the following verification link:</p>
            <p><a href="${verificationLink}" target="_blank">Verify Email Address</a></p>
            <p>If you did not initiate this request, please ignore this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a> if you have any questions.</p>
            <p>Warm regards,</p>
            <p>The Questify Team</p>
          `,
    });
  }

  generateVerificationToken(): string {
    const randomBuffer = randomBytes(32);
    const token = randomBuffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return token;
  }

  async verifyUser(token: string) {
    const tokenRecord = await this.prismaService.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prismaService.user.update({
      where: { email: tokenRecord.email },
      data: { isVerified: true },
    });

    await this.prismaService.verificationToken.delete({
      where: { token },
    });

    return { message: 'Email successfully verified' };
  }
}
