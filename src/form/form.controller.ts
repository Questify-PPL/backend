import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from 'src/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { FormService } from './form.service';
import { CreateFormDTO, UpdateFormDTO, UpdateParticipationDTO } from 'src/dto';
import { Response } from 'express';

@ApiTags('form')
@Controller('form')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get('/')
  @Roles(Role.RESPONDENT)
  getAllAvailableForm() {
    return this.formService.getAllAvailableForm();
  }

  @Get('/creator')
  @Roles(Role.CREATOR)
  getOwnedForm(
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
  ) {
    return this.formService.getOwnedForm(userId, type);
  }

  @Roles(Role.RESPONDENT)
  @Get('/respondent')
  getFilledForm(@CurrentUser('id') userId: string) {
    return this.formService.getFilledForm(userId);
  }

  @Get('/:formId')
  @Roles(Role.RESPONDENT, Role.CREATOR)
  getFormById(
    @Param('formId') formId: string,
    @Query('type') type: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.getFormById(formId, type, userId);
  }

  @Post()
  @Roles(Role.CREATOR)
  createForm(
    @CurrentUser('id') userId: string,
    @Body() createFormDTO: CreateFormDTO,
  ) {
    return this.formService.createForm(userId, createFormDTO);
  }

  @Patch('/:formId')
  @Roles(Role.CREATOR)
  updateForm(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
    @Body() updateFormDTO: UpdateFormDTO,
  ) {
    return this.formService.updateForm(formId, userId, updateFormDTO);
  }

  @Delete('/:formId')
  @Roles(Role.CREATOR)
  deleteForm(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.deleteForm(formId, userId);
  }

  @Delete('/:formId/section/:sectionId')
  @Roles(Role.CREATOR)
  deleteSection(
    @Param('formId') formId: string,
    @Param('sectionId') sectionId: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.deleteSection(formId, sectionId, userId);
  }

  @Delete('/:formId/question/:questionId')
  @Roles(Role.CREATOR)
  deleteQuestion(
    @Param('formId') formId: string,
    @Param('questionId') questionId: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.deleteQuestion(formId, questionId, userId);
  }

  @Roles(Role.RESPONDENT)
  @Post('/participate/:formId')
  participateOnQuestionnaire(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.participateOnQuestionnaire(formId, userId);
  }

  @Roles(Role.RESPONDENT)
  @Patch('/participate/:formId')
  updateParticipation(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
    @Body() updateParticipationDTO: UpdateParticipationDTO,
  ) {
    return this.formService.updateParticipation(
      formId,
      userId,
      updateParticipationDTO,
    );
  }

  @Roles(Role.CREATOR)
  @Get('/summary/:formId/statistics')
  getFormSummary(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.getFormSummary(formId, userId);
  }

  @Roles(Role.CREATOR)
  @Get('/summary/:formId/questions')
  getAllQuestionsAnswer(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.getAllQuestionsAnswer(formId, userId);
  }

  @Roles(Role.CREATOR)
  @Get('/summary/:formId/individual')
  getAllIndividual(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.getAllIndividual(formId, userId);
  }

  @Roles(Role.CREATOR)
  @Get('/summary/:formId/export')
  exportFormAsCSV(
    @Param('formId') formId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    return this.formService.exportFormAsCSV(formId, userId, res);
  }
}
