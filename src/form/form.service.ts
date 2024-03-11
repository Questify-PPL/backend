import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Section,
  Question as QuestionPrisma,
  QuestionType,
  Form,
  Radio,
  Checkbox,
} from '@prisma/client';
import {
  CreateFormDTO,
  FormQuestion,
  Question,
  UpdateFormDTO,
  UpdateParticipationDTO,
} from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FormService {
  constructor(private readonly prismaService: PrismaService) {}

  /*  ======================================================
        Pembubatan Kuesioner
      ======================================================
  */

  async getAllAvailableForm() {
    const forms = await this.prismaService.form.findMany({
      where: {
        isPublished: true,
        isDraft: false,
        endedAt: {
          gte: new Date(),
        },
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get all available form',
      data: forms,
    };
  }

  async getOwnedForm(userId: string) {
    const forms = await this.processFormsForCreator(userId);

    return {
      statusCode: 200,
      message: 'Successfully get form as creator',
      data: forms,
    };
  }

  async getFilledForm(userId: string) {
    const forms = await this.prismaService.participation.findMany({
      where: {
        respondentId: userId,
      },
      select: {
        form: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get form as respondent',
      data: forms,
    };
  }

  async getFormById(formId: string, type: string, userId: string) {
    const form = await this.prismaService.form.findUnique({
      where: {
        id: formId,
      },
      include: {
        Question: {
          include: {
            Radio: true,
            Checkbox: true,
          },
        },
        Section: true,
      },
    });

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    return {
      statusCode: 200,
      message: 'Successfully get form',
      data: this.processFormForCreator(form),
    };
  }

  async createForm(userId: string, createFormDTO: CreateFormDTO) {
    const { prizeType, maxWinner } = createFormDTO;

    this.validatePrizeType(prizeType, maxWinner);

    const form = await this.prismaService.form.create({
      data: {
        ...createFormDTO,
        creatorId: userId,
      },
    });

    return {
      statusCode: 201,
      message: 'Successfully create form',
      data: form,
    };
  }

  async updateForm(
    formId: string,
    userId: string,
    updateFormDTO: UpdateFormDTO,
  ) {
    const { formQuestions, ...rest } = updateFormDTO;

    this.validatePrizeType(rest.prizeType, rest.maxWinner);

    await this.validateUserOnForm(formId, userId, true);

    if (updateFormDTO.formQuestions) this.validateFormQuestions(formQuestions);

    if (formQuestions) {
      await this.processQuestions(formQuestions, formId);
    }

    const updatedForm = await this.prismaService.form.update({
      where: {
        id: formId,
        creatorId: userId,
      },
      data: {
        ...rest,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully update form',
      data: updatedForm,
    };
  }

  async deleteForm(formId: string, userId: string) {
    await this.validateUserOnForm(formId, userId);

    await this.prismaService.form.delete({
      where: {
        id: formId,
        creatorId: userId,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully delete form',
      data: {},
    };
  }

  async deleteQuestion(formId: string, questionId: number, userId: string) {
    await this.validateUserOnForm(formId, userId);

    await this.validateQuestionExist(formId, questionId);

    await this.prismaService.question.delete({
      where: {
        formId_questionId: {
          formId,
          questionId,
        },
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully delete question',
      data: {},
    };
  }

  /*  ======================================================
        Partisipasi Kuesioner
      ======================================================
  */

  async participateOnQuestionnaire(formId: string, userId: string) {
    return null;
  }

  async updateParticipation(
    formId: string,
    userId: string,
    updateParticipationDTO: UpdateParticipationDTO,
  ) {
    return null;
  }

  /*  ======================================================
        Utils
      ======================================================
  */

  private async processQuestions(
    formQuestions: FormQuestion[],
    formId: string,
  ) {
    formQuestions.map(async (formQuestion) => {
      try {
        if (formQuestion.type === 'SECTION') {
          const section = await this.processSection(formId, formQuestion);

          formQuestion.questions.map(async (question) => {
            try {
              await this.processQuestion(formId, section.sectionId, question);
            } catch (error) {
              console.log(error.response);
            }
          });
        } else {
          await this.processQuestion(
            formId,
            formQuestion.sectionId,
            formQuestion.question,
          );
        }
      } catch (error) {
        console.log(error.response);
      }
    });
  }

  private async validateUserOnForm(
    formId: string,
    userId: string,
    isUpdating = false,
  ) {
    const form = await this.prismaService.form.findUnique({
      where: {
        id: formId,
        creatorId: userId,
      },
    });

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    if (form.creatorId !== userId) {
      throw new BadRequestException('User is not authorized to modify form');
    }

    if (isUpdating && form.isPublished) {
      throw new BadRequestException('Form is already published');
    }
  }

  private async validateQuestionExist(formId: string, questionId: number) {
    const question = await this.prismaService.question.findUnique({
      where: {
        formId_questionId: {
          formId,
          questionId,
        },
      },
    });

    if (!question) {
      throw new BadRequestException('Question not found');
    }
  }

  private validatePrizeType(prizeType: string, maxWinner: number) {
    if (prizeType === 'LUCKY' && !maxWinner) {
      throw new BadRequestException(
        'Max winner is required for LUCKY prize type',
      );
    }
  }

  private validateFormQuestions(formQuestions: FormQuestion[]) {
    formQuestions.map((formQuestion) => {
      if (formQuestion.type !== 'SECTION' && formQuestion.type !== 'DEFAULT') {
        throw new BadRequestException('Type must be SECTION or DEFAULT');
      }

      if (
        formQuestion.type === 'SECTION' &&
        (!formQuestion.sectionName || !formQuestion.questions)
      ) {
        throw new BadRequestException(
          'SECTION Type must have sectionName and questions',
        );
      }

      if (formQuestion.type === 'DEFAULT' && !formQuestion.question) {
        throw new BadRequestException('Question is required for DEFAULT type');
      }
    });
  }

  private async processSection(formId: string, formQuestion: FormQuestion) {
    let section: Section;
    if (!formQuestion.sectionId) {
      // Create section
      section = await this.prismaService.section.create({
        data: {
          name: formQuestion.sectionName,
          ...(formQuestion.sectionDescription && {
            description: formQuestion.sectionDescription,
          }),
          formId: formId,
        },
      });
    } else {
      // Update section
      try {
        section = await this.prismaService.section.update({
          where: {
            formId_sectionId: {
              formId: formId,
              sectionId: formQuestion.sectionId,
            },
          },
          data: {
            name: formQuestion.sectionName,
            ...(formQuestion.sectionDescription && {
              description: formQuestion.sectionDescription,
            }),
          },
        });
      } catch (error) {
        throw new BadRequestException('Got Section Error:', error);
      }
    }

    return section;
  }

  private async processQuestion(
    formId: string,
    sectionId: number | undefined,
    question: Question,
  ) {
    let newOrUpdatedQuestion: QuestionPrisma;
    let previousQuestionType: QuestionType;

    if (!question.questionId) {
      // Create question
      newOrUpdatedQuestion = await this.prismaService.question.create({
        data: {
          question: question.question,
          questionTypeName: question.questionType,
          ...(question.description && {
            description: question.description,
          }),
          ...(question.isRequired && {
            isRequired: question.isRequired,
          }),
          questionType: question.questionType,
          sectionId: sectionId,
          formId: formId,
        },
      });
    } else {
      // Update question
      try {
        const previousQuestion = await this.prismaService.question.findUnique({
          where: {
            formId_questionId: {
              formId: formId,
              questionId: question.questionId,
            },
          },
          select: {
            questionType: true,
          },
        });

        if (previousQuestion) {
          previousQuestionType = previousQuestion.questionType;
        }

        newOrUpdatedQuestion = await this.prismaService.question.update({
          where: {
            formId_questionId: {
              formId: formId,
              questionId: question.questionId,
            },
          },
          data: {
            question: question.question,
            ...(question.description && {
              description: question.description,
            }),
            ...(question.questionType && {
              questionType: question.questionType,
            }),
            ...(question.isRequired && {
              isRequired: question.isRequired,
            }),
            sectionId: sectionId,
          },
        });
      } catch (error) {
        throw new BadRequestException('Got Question Error:', error);
      }
    }

    await this.processQuestionType(
      question.questionType,
      previousQuestionType,
      formId,
      newOrUpdatedQuestion.questionId,
      question.choice,
    );
  }

  private async processQuestionType(
    questionType: string,
    previousQuestionType: string,
    formId: string,
    questionId: number,
    choice?: string[],
  ) {
    async function updateOrDelete(
      prismaService: PrismaService,
      type: string,
      action: 'update' | 'delete' | 'create',
    ) {
      const service = prismaService[type.toLowerCase()];
      const operation = service[action];

      if (action === 'update') {
        await operation({
          where: {
            formId_questionId: {
              formId,
              questionId,
            },
          },
          data: {
            ...(choice && {
              choice: choice,
            }),
          },
        });
      } else if (action === 'delete') {
        await operation({
          where: {
            formId_questionId: {
              formId,
              questionId,
            },
          },
        });
      } else if (action === 'create') {
        await operation({
          data: {
            question: {
              connect: {
                formId_questionId: {
                  formId,
                  questionId,
                },
              },
            },
            ...(choice && {
              choice: choice,
            }),
          },
        });
      }
    }

    if (questionType !== previousQuestionType) {
      if (previousQuestionType) {
        await updateOrDelete(
          this.prismaService,
          previousQuestionType,
          'delete',
        );
      }
      await updateOrDelete(this.prismaService, questionType, 'create');

      return;
    }

    await updateOrDelete(this.prismaService, questionType, 'update');
  }

  private async processFormsForCreator(userId: string) {
    const forms = await this.prismaService.form.findMany({
      where: {
        creatorId: userId,
      },
    });

    const formsWithStats = forms.map(async (form) => {
      const ongoingParticipation = await this.prismaService.participation.count(
        {
          where: {
            formId: form.id,
            isCompleted: false,
          },
        },
      );

      const completedParticipation =
        await this.prismaService.participation.count({
          where: {
            formId: form.id,
            isCompleted: true,
          },
        });

      return {
        ...form,
        ongoingParticipation,
        completedParticipation,
      };
    });

    return Promise.all(formsWithStats);
  }

  private processFormForCreator(
    form: Form & {
      Question: (QuestionPrisma & { Radio: Radio; Checkbox: Checkbox })[];
      Section: Section[];
    },
  ) {
    const groupQuestionBySectionIfExist = form.Question.reduce(
      (acc, question) => {
        const questionWithChoice = this.excludeKeys(
          {
            ...question,
            ...(question.questionType === 'RADIO' && {
              choice: question.Radio.choice,
            }),
            ...(question.questionType === 'CHECKBOX' && {
              choice: question.Checkbox.choice,
            }),
          },
          ['Radio', 'Checkbox'],
        );

        if (question.sectionId) {
          const section = form.Section.find(
            (section) => section.sectionId === question.sectionId,
          );
          const sectionIndex = acc.findIndex(
            (section) => section.sectionId === question.sectionId,
          );

          if (sectionIndex === -1) {
            acc.push({
              ...section,
              questions: [questionWithChoice],
            });
          } else {
            acc[sectionIndex].questions.push(questionWithChoice);
          }
        } else {
          acc.push(questionWithChoice);
        }

        return acc;
      },
      [],
    );

    return this.excludeKeys(
      {
        ...form,
        questions: groupQuestionBySectionIfExist,
      },
      ['Question', 'Section'],
    );
  }

  private excludeKeys<T, K extends keyof T>(form: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(form).filter(([key]) => !keys.includes(key as K)),
    ) as Omit<T, K>;
  }
}
