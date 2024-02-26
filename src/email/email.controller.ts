import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendMailAuthDTO } from 'src/dto/auth/sendMailAuth.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('/send-verify-mail')
  async sendVerificationMail(@Body() sendMailAuthDTO: SendMailAuthDTO) {
    return this.emailService.sendVerificationMail(sendMailAuthDTO.email);
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.emailService.verifyUser(token);
  }
}
