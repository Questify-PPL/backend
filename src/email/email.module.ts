import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'questifyst.official@gmail.com',
          pass: 'ytbe jkdy drtm bpfj',
        },
      },
      defaults: {
        from: `"Questify" <${process.env.USERNAME_SMTP_GMAIL}>`,
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
