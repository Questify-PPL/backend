import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from 'src/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { FormService } from './form.service';
import { CreateFormDTO, UpdateFormDTO } from 'src/dto';

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
  @Roles(Role.RESPONDENT, Role.CREATOR)
  getOwnedForm(@CurrentUser('id') userId: string) {
    return this.formService.getOwnedForm(userId);
  }

  @Roles(Role.RESPONDENT)
  @Get('/respondent')
  getFilledForm(@CurrentUser('id') userId: string) {
    return this.formService.getFilledForm(userId);
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

  @Delete('/:formId/question/:questionId')
  @Roles(Role.CREATOR)
  deleteQuestion(
    @Param('formId') formId: string,
    @Param('questionId') questionId: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.formService.deleteQuestion(formId, questionId, userId);
  }
}
