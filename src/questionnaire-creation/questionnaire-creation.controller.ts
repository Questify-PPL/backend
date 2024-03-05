import { Body, Controller, Post, Put, Param } from '@nestjs/common';
import { QuestionnaireCreationService } from './questionnaire-creation.service';
import { CreateDraftDto } from 'src/dto/questionnaire-creation/createDraft.dto';
import { UpdateDraftDto } from 'src/dto/questionnaire-creation/updateDraft.dto';

@Controller('questionnaires')
export class QuestionnaireCreationController {
  constructor(
    private readonly questionnaireCreationService: QuestionnaireCreationService,
  ) {}

  @Post('/create-draft/')
  async createDraft(@Body() createDraftDto: CreateDraftDto) {
    return this.questionnaireCreationService.createDraft(
      createDraftDto.creatorId,
      createDraftDto.title,
      createDraftDto.prizeType,
      createDraftDto.prize,
      createDraftDto.maxParticipant,
      createDraftDto.maxWinner,
    );
  }

  @Put('/update/:formId')
  async updateDraft(
    @Param('formId') formId: string,
    @Body() updateDraftDto: UpdateDraftDto,
  ) {
    return this.questionnaireCreationService.updateDraft(
      formId,
      updateDraftDto.creatorId,
      updateDraftDto.title,
      updateDraftDto.prizeType,
      updateDraftDto.prize,
      updateDraftDto.maxParticipant,
      updateDraftDto.maxWinner,
    );
  }

  @Put('/finalize/:formId')
  async finalizeQuestionnaire(@Param('formId') formId: string) {
    return this.questionnaireCreationService.finalizeQuestionnaire(formId);
  }
}
