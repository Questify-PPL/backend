import { Injectable, NotFoundException } from '@nestjs/common';
import { Form, PrizeType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionnaireCreationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createDraft(
    creatorId: string,
    title: string,
    prizeType: PrizeType,
    prize: number,
    maxParticipant?: number,
    maxWinner?: number,
  ) {
    const form = await this.prismaService.form.create({
      data: {
        creatorId,
        title,
        prizeType,
        prize,
        maxParticipant,
        maxWinner,
        isDraft: true,
        isPublished: false,
      },
    });

    return {
      statusCode: 201,
      message: 'Draft successfully created.',
      data: {
        formId: form.id,
        creatorId,
        title,
        prizeType,
        prize,
        maxParticipant,
        maxWinner,
        isDraft: true,
        isPublished: false,
      },
    };
  }

  async updateDraft(
    formId: string,
    creatorId: string,
    title: string,
    prizeType: PrizeType,
    prize: number,
    maxParticipant?: number,
    maxWinner?: number,
  ) {
    const form = await this.prismaService.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Questionnaire with ID ${formId} not found.`);
    }

    this.prismaService.form.update({
      where: { id: formId },
      data: {
        title,
        prizeType,
        prize,
        maxParticipant,
        maxWinner,
        isDraft: true,
        isPublished: false,
      },
    });

    return {
      statusCode: 200,
      message: 'Draft successfully updated.',
      data: {
        formId,
        creatorId,
        title,
        prizeType,
        prize,
        maxParticipant,
        maxWinner,
        isDraft: true,
        isPublished: false,
      },
    };
  }

  async finalizeQuestionnaire(formId: string) {
    const form = await this.prismaService.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Questionnaire with ID ${formId} not found.`);
    }

    this.prismaService.form.update({
      where: { id: formId },
      data: { isDraft: false, isPublished: true },
    });

    return {
      statusCode: 200,
      message: 'Draft successfully finalized.',
      data: {
        formId,
        isDraft: false,
        isPublished: true,
      },
    };
  }

  async findQuestionnaireById(formId: string): Promise<Form | null> {
    return this.prismaService.form.findUnique({
      where: { id: formId },
    });
  }
}
