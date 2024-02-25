import { Body, Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendMailAuthDTO } from 'src/dto/auth/sendMailAuth.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('/send-verify-mail')
  async sendMail(@Body() sendMailAuthDTO: SendMailAuthDTO): Promise<void> {
    return this.emailService.sendVerificationMail(sendMailAuthDTO.email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      await this.emailService.verifyUser(token);
    } catch (error) {
      console.error(error);
    }
  }
}
