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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
