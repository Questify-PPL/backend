import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { FormModule } from './form/form.module';
import { QuestionnaireCreationModule } from './questionnaire-creation/questionnaire-creation.module';
import { ShopModule } from './shop/shop.module';
import { TopupModule } from './topup/topup.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { PityModule } from './pity/pity.module';
import { LockModule } from './lock/lock.module';
import { ReportModule } from './report/report.module';
import { LinkModule } from './link/link.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    EmailModule,
    FormModule,
    QuestionnaireCreationModule,
    ShopModule,
    TopupModule,
    WithdrawalModule,
    PityModule,
    LockModule,
    ReportModule,
    LinkModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
