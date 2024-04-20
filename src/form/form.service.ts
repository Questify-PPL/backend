import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Section,
  Question as QuestionPrisma,
  QuestionType,
  Form,
  Radio,
  Checkbox,
  Answer,
} from '@prisma/client';
import {
  CreateFormDTO,
  FormQuestion,
  Question,
  QuestionAnswer,
  UpdateFormDTO,
  UpdateParticipationDTO,
} from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Parser } from 'json2csv';
import { Response } from 'express';

@Injectable()
export class FormService {
  constructor(private readonly prismaService: PrismaService) {}

  /*  ======================================================
        Pembubatan Kuesioner
      ======================================================
  */

  async getAllAvailableForm(userId: string) {
    const forms = await this.prismaService.form.findMany({
      where: {
        isPublished: true,
        isDraft: false,
        endedAt: {
          gte: new Date(),
        },
      },
    });

    const participatingForms = await this.prismaService.participation.findMany({
      where: {
        respondentId: userId,
      },
      select: {
        formId: true,
      },
    });

    const filteredForms = forms.filter((form) => {
      return !participatingForms.some(
        (participatingForm) => participatingForm.formId === form.id,
      );
    });

    return {
      statusCode: 200,
      message: 'Successfully get all available form',
      data: filteredForms,
    };
  }

  async getOwnedForm(userId: string, type?: string) {
    const forms = await this.processFormsForCreator(userId, type);

    return {
      statusCode: 200,
      message: 'Successfully get form as creator',
      data: forms,
    };
  }

  async getFilledForm(userId: string) {
    const forms = await this.processFormsForRespondent(userId);

    return {
      statusCode: 200,
      message: 'Successfully get form as respondent',
      data: forms,
    };
  }

  async getFormById(formId: string, type: string, userId: string) {
    if (type !== 'creator' && type !== 'respondent') {
      throw new BadRequestException('Type must be creator or respondent');
    }

    const form = await this.returnLatestForm(formId);

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    const formattedForm =
      type === 'creator'
        ? await this.processFormInGeneral(form)
        : await this.processFormInGeneral(form, userId, false);

    return {
      statusCode: 200,
      message: 'Successfully get form',
      data: formattedForm,
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
    const { formQuestions, isPublished, isDraft, endedAt, ...rest } =
      updateFormDTO;

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
        ...(isPublished && {
          isPublished: isPublished,
          isDraft: !isPublished,
        }),
        ...(isDraft && {
          isDraft: isDraft,
          isPublished: !isDraft,
        }),
        ...(endedAt && {
          endedAt: endedAt,
        }),
      },
      include: {
        Question: {
          include: {
            Radio: true,
            Checkbox: true,
            Answer: true,
          },
        },
        Section: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully update form',
      data: await this.processFormInGeneral(updatedForm),
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

  async deleteSection(formId: string, sectionId: number, userId: string) {
    await this.validateUserOnForm(formId, userId);

    await this.validateSectionExist(formId, sectionId);

    await this.prismaService.section.delete({
      where: {
        formId_sectionId: {
          formId,
          sectionId,
        },
      },
    });

    const returnLatestForm = await this.returnLatestForm(formId);

    return {
      statusCode: 200,
      message: 'Successfully delete section',
      data: this.processFormInGeneral(returnLatestForm),
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

    const returnLatestForm = await this.returnLatestForm(formId);

    return {
      statusCode: 200,
      message: 'Successfully delete question',
      data: this.processFormInGeneral(returnLatestForm),
    };
  }

  /*  ======================================================
        Partisipasi Kuesioner
      ======================================================
  */

  async participateOnQuestionnaire(formId: string, userId: string) {
    try {
      const createdParticipation =
        await this.prismaService.participation.upsert({
          where: {
            respondentId_formId: {
              formId,
              respondentId: userId,
            },
          },
          update: {},
          create: {
            formId,
            respondentId: userId,
            isCompleted: false,
          },
        });

      return {
        statusCode: 201,
        message: 'Successfully participate in form',
        data: createdParticipation,
      };
    } catch (error) {
      console.log(error.response);
    }
  }

  async updateParticipation(
    formId: string,
    userId: string,
    updateParticipationDTO: UpdateParticipationDTO,
  ) {
    const { questionsAnswer, isCompleted, emailNotificationActive } =
      updateParticipationDTO;

    await this.validateParticipation(formId, userId);

    if (questionsAnswer) {
      await this.addRespondentAnswerToQuestion(formId, userId, questionsAnswer);
    }

    try {
      const participation = await this.prismaService.participation.update({
        where: {
          respondentId_formId: {
            formId,
            respondentId: userId,
          },
        },
        data: {
          ...(isCompleted && {
            isCompleted: isCompleted,
          }),
          ...(emailNotificationActive && {
            emailNotificationActive: emailNotificationActive,
          }),
        },
      });

      return {
        statusCode: 200,
        message: 'Successfully update participation',
        data: participation,
      };
    } catch (error) {
      console.log(error.response);
    }
  }

  /*  ======================================================
        Questionnaire Summary and Statistics
      ======================================================
  */

  async getFormSummary(formId: string, userId: string) {
    const form = await this.validateVisibility(formId, userId);

    const questionStatistics = [];

    form.Question.forEach((question) => {
      const questionType = question.questionType;
      const questionAnswers = question.Answer.map((answer) => {
        return answer.answer;
      });

      let statistics;

      if (questionType === 'RADIO' || questionType === 'CHECKBOX') {
        const choices =
          questionType === 'RADIO'
            ? question.Radio.choice
            : question.Checkbox.choice;

        const questionAnswersToBeProcessed = (
          questionAnswers as string[][]
        ).flat();

        const amounts = [];

        choices.map((choice) => {
          const amount = questionAnswersToBeProcessed.reduce((acc, answer) => {
            return answer === choice ? acc + 1 : acc;
          }, 0);

          amounts.push(amount);
        });

        statistics = {
          choices: choices,
          amounts: amounts,
        };
      }

      if (questionType === 'TEXT') {
        const typedAnswer = questionAnswers as {
          answer: string;
        }[];

        statistics = typedAnswer.map((answer) => answer.answer);
      }

      const questionToBePut = this.excludeKeys(
        {
          ...question,
          statistics: statistics,
        },
        ['Radio', 'Checkbox', 'formId', 'Answer'],
      );

      this.groupBySectionId(
        form.Section,
        questionStatistics,
        question,
        questionToBePut,
      );
    });

    const formStatistics = this.excludeKeys(
      {
        ...form,
        questionsStatistics: questionStatistics,
      },
      ['Question', 'Section'],
    );

    return {
      statusCode: 200,
      message: 'Successfully get questionnaire summary',
      data: formStatistics,
    };
  }

  async getAllQuestionsAnswer(formId: string, userId: string) {
    const form = await this.validateVisibility(formId, userId);

    const questionsAnswer = [];

    form.Question.forEach((question) => {
      const occurenceDict = {};

      question.Answer.map((answer) => {
        if (
          question.questionType === 'RADIO' ||
          question.questionType === 'CHECKBOX'
        ) {
          (answer.answer as string[]).forEach((chosenAnswer) => {
            if (!occurenceDict[chosenAnswer]) {
              occurenceDict[chosenAnswer] = 1;
            } else {
              occurenceDict[chosenAnswer]++;
            }
          });
        } else {
          const chosenAnswer = (
            answer.answer as {
              answer: string;
            }
          ).answer;

          if (!occurenceDict[chosenAnswer]) {
            occurenceDict[chosenAnswer] = 1;
          } else {
            occurenceDict[chosenAnswer]++;
          }
        }

        return occurenceDict;
      });

      const questionToBePut = this.excludeKeys(
        {
          ...question,
          occurence: occurenceDict,
        },
        ['Radio', 'Checkbox', 'formId', 'Answer'],
      );

      this.groupBySectionId(
        form.Section,
        questionsAnswer,
        question,
        questionToBePut,
      );
    });

    return {
      statusCode: 200,
      message: 'Successfully get all questions answer',
      data: questionsAnswer,
    };
  }

  async getAllIndividual(formId: string, userId: string) {
    await this.validateVisibility(formId, userId);

    const allIndividuals = await this.prismaService.participation.findMany({
      where: {
        formId: formId,
        isCompleted: true,
      },
      select: {
        respondentId: true,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get all individual',
      data: allIndividuals.map((individual) => individual.respondentId),
    };
  }

  async exportFormAsCSV(formId: string, userId: string, res: Response) {
    try {
      const form = await this.validateVisibility(formId, userId);

      const csv = await this.generateCSV(form, formId);

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${form.title}.csv`,
      );

      // Send response

      res.status(201).send(csv);
    } catch (error) {
      console.log(error.response);

      throw new BadRequestException(
        error.message ? error.message : 'Failed to export form as CSV',
      );
    }
  }

  /*  ======================================================
        Utils
      ======================================================
  */

  private async validateVisibility(formId: string, userId: string) {
    const form = await this.returnLatestForm(formId);

    if (!form) {
      throw new BadRequestException('Form not found');
    }

    if (form.creatorId !== userId) {
      throw new BadRequestException(
        'User is not authorized to view form summary',
      );
    }

    if (!form.isPublished) {
      throw new BadRequestException('Form is not published');
    }

    return form;
  }

  private async processQuestions(
    formQuestions: FormQuestion[],
    formId: string,
  ) {
    for (const formQuestion of formQuestions) {
      try {
        if (formQuestion.type === 'SECTION') {
          const section = await this.processSection(formId, formQuestion);

          for (const question of formQuestion.questions) {
            try {
              await this.processQuestion(formId, section.sectionId, question);
            } catch (error) {
              console.log(error.response);
            }
          }
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
    }
  }

  private async returnLatestForm(formId: string) {
    const returnLatestForm = await this.prismaService.form.findUnique({
      where: {
        id: formId,
      },
      include: {
        Question: {
          include: {
            Radio: true,
            Checkbox: true,
            Answer: true,
          },
        },
        Section: true,
      },
    });

    return returnLatestForm;
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

  private async validateSectionExist(formId: string, sectionId: number) {
    const section = await this.prismaService.section.findUnique({
      where: {
        formId_sectionId: {
          formId,
          sectionId,
        },
      },
    });

    if (!section) {
      throw new BadRequestException('Section not found');
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
          questionTypeName: question.questionTypeName,
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

  private async processFormsForCreator(userId: string, type?: string) {
    const forms = await this.prismaService.form.findMany({
      where: {
        creatorId: userId,
        ...(type && {
          isPublished: type === 'PUBLISHED',
        }),
      },
      include: {
        Question: true,
      },
    });

    const formsWithStats = forms.map(async (form) => {
      const [ongoingParticipation, completedParticipation] =
        await this.prismaService.$transaction([
          this.prismaService.participation.count({
            where: {
              formId: form.id,
              isCompleted: false,
            },
          }),
          this.prismaService.participation.count({
            where: {
              formId: form.id,
              isCompleted: true,
            },
          }),
        ]);

      return this.excludeKeys(
        {
          ...form,
          ongoingParticipation,
          completedParticipation,
          questionAmount: form.Question.length,
          isCompleted: form.endedAt !== null && form.endedAt < new Date(),
        },
        ['Question'],
      );
    });

    return Promise.all(formsWithStats);
  }

  private async processFormsForRespondent(userId: string) {
    const participations = await this.prismaService.participation.findMany({
      where: {
        respondentId: userId,
      },
      select: {
        form: {
          include: {
            Question: true,
            Winner: true,
          },
        },
        questionsAnswered: true,
        isCompleted: true,
      },
    });

    const forms = participations.map(async (participation) => {
      const winningChance = this.decideWinningChance();

      const winningStatus = participation.form.Winner.some(
        (winner) => winner.respondentId === userId,
      );

      return this.excludeKeys(
        {
          ...(this.excludeKeys(participation.form, [
            'Question',
            'Winner',
          ]) as Form),
          questionFilled: participation.questionsAnswered,
          isCompleted:
            participation.isCompleted ||
            (participation.form.endedAt !== null &&
              participation.form.endedAt < new Date()),
          questionAmount: participation.form.Question.length,
          winningChance,
          winningStatus,
        },
        ['isDraft', 'isPublished', 'maxParticipant', 'updatedAt'],
      );
    });

    return Promise.all(forms);
  }

  private async processFormInGeneral(
    form: Form & {
      Question: (QuestionPrisma & {
        Radio: Radio;
        Checkbox: Checkbox;
        Answer: Answer[];
      })[];
      Section: Section[];
    },
    userId?: string,
    removeAnswer = true,
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
            ...(!removeAnswer && {
              answer:
                question.Answer.map((answer) => {
                  const typedAnswer = answer as {
                    answer?: { answer?: string };
                  };

                  return {
                    respondentId: answer.respondentId,
                    answer: typedAnswer.answer?.answer
                      ? typedAnswer.answer.answer
                      : answer.answer,
                  };
                })
                  .filter((answer) => {
                    return answer.respondentId === userId;
                  })
                  .map((answer) => answer.answer)[0] || null,
            }),
          },
          ['Answer', 'Radio', 'Checkbox', 'formId'],
        );

        this.groupBySectionId(form.Section, acc, question, questionWithChoice);

        return acc;
      },
      [],
    );

    let participation;

    if (userId) {
      participation = await this.prismaService.participation.findUnique({
        where: {
          respondentId_formId: {
            formId: form.id,
            respondentId: userId,
          },
        },
      });
    }

    return this.excludeKeys(
      {
        ...form,
        questions: groupQuestionBySectionIfExist,
        ...(participation && {
          canRespond:
            !participation.isCompleted &&
            (!form.endedAt || form.endedAt >= new Date()),
        }),
        questionAmount: form.Question.length,
      },
      ['Question', 'Section'],
    );
  }

  private excludeKeys<T, K extends keyof T>(form: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(form).filter(([key]) => !keys.includes(key as K)),
    ) as Omit<T, K>;
  }

  private async validateParticipation(formId: string, userId: string) {
    const participation = await this.prismaService.participation.findUnique({
      where: {
        respondentId_formId: {
          formId,
          respondentId: userId,
        },
      },
    });

    if (!participation) {
      throw new BadRequestException('Participation not found');
    }

    if (participation.respondentId !== userId) {
      throw new BadRequestException(
        'User is not authorized to modify participation',
      );
    }

    if (participation.isCompleted) {
      throw new BadRequestException('You have completed this form');
    }
  }

  private async addRespondentAnswerToQuestion(
    formId: string,
    userId: string,
    questionsAnswer: QuestionAnswer[],
  ) {
    try {
      for (const questionAnswer of questionsAnswer) {
        try {
          await this.processAnswer(
            formId,
            userId,
            questionAnswer.questionId,
            questionAnswer.answer,
          );
        } catch (error) {
          console.log(error.response);
        }
      }

      await this.updateQuestionsFilledAmount(formId, userId);
    } catch (error) {
      console.log(error.response);
    }
  }

  private async processAnswer(
    formId: string,
    userId: string,
    questionId: number,
    answer: any,
  ) {
    if (typeof answer === 'string') {
      answer = {
        answer: answer,
      };
    }

    await this.prismaService.answer.upsert({
      where: {
        respondentId_questionId_formId: {
          respondentId: userId,
          questionId: questionId,
          formId: formId,
        },
      },
      create: {
        respondentId: userId,
        questionId: questionId,
        formId: formId,
        answer: answer,
      },
      update: {
        answer: answer,
      },
    });
  }

  private async updateQuestionsFilledAmount(formId: string, userId: string) {
    const filledQuestionsAmount = await this.prismaService.answer.count({
      where: {
        respondentId: userId,
        formId: formId,
      },
    });

    await this.prismaService.participation.update({
      where: {
        respondentId_formId: {
          formId,
          respondentId: userId,
        },
      },
      data: {
        questionsAnswered: filledQuestionsAmount,
      },
    });
  }

  private decideWinningChance() {
    return 0;
  }

  private async groupBySectionId(
    Section: Section[],
    acc: any[],
    question: QuestionPrisma & {
      Radio: Radio;
      Checkbox: Checkbox;
      Answer: Answer[];
    },
    toPut: any,
  ) {
    if (question.sectionId) {
      const sectionId = question.sectionId;

      const section = Section.find(
        (section) => section.sectionId === sectionId,
      );

      // group by sectionId
      const sectionIndex = acc.findIndex(
        (question) => question.sectionId === sectionId,
      );

      if (sectionIndex === -1) {
        acc.push({
          ...(this.excludeKeys(section, ['formId']) as Section),
          questions: [toPut],
        });
      } else {
        acc[sectionIndex].questions.push(toPut);
      }
    } else {
      acc.push(toPut);
    }
  }

  async generateCSV(
    form: Form & {
      Question: (QuestionPrisma & {
        Radio: Radio;
        Checkbox: Checkbox;
        Answer: Answer[];
      })[];
      Section: Section[];
    },
    formId: string,
  ) {
    const header = form.Question.map((question) => ({
      id: question.questionId,
      title: question.question,
    }));

    // Retrieve all respondent ID
    const respondentIds = await this.prismaService.participation.findMany({
      where: {
        formId: formId,
        isCompleted: true,
      },
      select: {
        respondentId: true,
      },
    });

    const rows = [];

    // ITerate through respondentID and get their answer

    for (const respondentId of respondentIds) {
      const answers = await this.prismaService.answer.findMany({
        where: {
          respondentId: respondentId.respondentId,
          formId: formId,
        },
      });

      const row = {};

      // Initialize all question with empty string

      form.Question.forEach((question) => {
        row[question.questionId] = '';
      });

      answers.forEach((answer) => {
        const typedAnswer = answer.answer as string[] | { answer: string };

        row[answer.questionId] = (
          typedAnswer as {
            answer?: { answer?: string };
          }
        ).answer
          ? (
              typedAnswer as {
                answer?: { answer?: string };
              }
            ).answer
          : (typedAnswer as string[]).join(', ');
      });

      rows.push(row);
    }

    const fields = header.map((h) => ({
      label: h.title,
      value: h.id.toString(),
    }));

    const json2csvParser = new Parser({
      fields,
    });

    const csv = json2csvParser.parse(rows);

    return csv;
  }
}
