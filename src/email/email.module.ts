import { Global, Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.USERNAME_SMTP_GMAIL,
          pass: process.env.PASSWORD_SMTP_GMAIL,
        },
      },
      defaults: {
        from: `"Questify" <${process.env.USERNAME_SMTP_GMAIL}>`,
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
