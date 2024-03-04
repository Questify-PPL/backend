import { Injectable } from '@nestjs/common';
import { CreateFormDTO, UpdateFormDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FormService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllAvailableForm() {
    return {};
  }

  async getOwnedForm(userId: string) {
    return {};
  }

  async getFilledForm(userId: string) {
    return {};
  }

  async createForm(userId: string, createFormDTO: CreateFormDTO) {
    return {};
  }

  async updateForm(
    formId: string,
    userId: string,
    updateFormDTO: UpdateFormDTO,
  ) {
    return {};
  }

  async deleteForm(formId: string, userId: string) {
    return {};
  }

  async deleteQuestion(formId: string, questionId: number, userId: string) {
    return {};
  }
}
