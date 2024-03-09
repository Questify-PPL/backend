import { Module } from '@nestjs/common';
import { QuestionnaireCreationService } from './questionnaire-creation.service';
import { QuestionnaireCreationController } from './questionnaire-creation.controller';

@Module({
  providers: [QuestionnaireCreationService],
  controllers: [QuestionnaireCreationController],
})
export class QuestionnaireCreationModule {}
