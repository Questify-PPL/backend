import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendMailAuthDTO } from 'src/dto/auth/sendMailAuth.dto';
import { ContactDataDTO } from 'src/dto/auth/contactData.dto';
import { JwtAuthGuard } from 'src/guard';
import { CurrentUser } from 'src/decorator';
import { User } from '@prisma/client';

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

  @Post('/send-contact-data')
  @UseGuards(JwtAuthGuard)
  async sendContactData(
    @Body() contactDataDTO: ContactDataDTO,
    @CurrentUser() user: User,
  ) {
    return this.emailService.sendContactData(user, contactDataDTO);
  }
}
