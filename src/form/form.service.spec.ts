import { Test, TestingModule } from '@nestjs/testing';
import { FormService } from './form.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('FormService', () => {
  let service: FormService;
  let prismaService: PrismaService;

  const dummyForm = {
    title: '',
    prize: 20000,
    creatorId: 'userId',
    prizeType: 'LUCKY',
    questions: [],
    Question: [
      {
        questionType: 'RADIO',
        isRequired: true,
        question: 'Question 1',
        Radio: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Checkbox: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Answer: [
          {
            respondentId: 'userId',
            answer: ['A'],
          },
          {
            respondentId: 'userId',
            answer: ['B'],
          },
        ],
      },
      {
        questionType: 'CHECKBOX',
        sectionId: 1,
        isRequired: true,
        question: 'Question 2',
        Radio: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Checkbox: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Answer: [
          {
            respondentId: 'userId',
            answer: ['A'],
          },
          {
            respondentId: 'userId',
            answer: ['A'],
          },
        ],
      },
      {
        questionType: 'TEXT',
        sectionId: 1,
        isRequired: true,
        question: 'Question 3',
        Answer: [
          {
            respondentId: 'userId',
            answer: 'A',
          },
          {
            respondentId: 'userId',
            answer: {
              answer: 'B',
            },
          },
          {
            respondentId: 'userId',
            answer: 'A',
          },
        ],
      },
      {
        questionType: 'RADIO',
        sectionId: 1,
        isRequired: true,
        question: 'Question 2',
        Radio: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Checkbox: {
          choice: ['A', 'B', 'C', 'D', 'E'],
        },
        Answer: [],
      },
    ],
    Section: [
      {
        name: 'Section 1',
        sectionId: 1,
        description: 'Description',
        Question: [
          {
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 1',
            Radio: {
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
            Checkbox: {
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
            Answer: [
              {
                respondentId: 'userId',
                answer: ['A'],
              },
              {
                respondentId: 'userId',
                answer: ['B'],
              },
            ],
          },
        ],
      },
    ],
    Winner: [
      {
        respondentId: 'userId',
      },
    ],
  };

  const dummyForms = [
    {
      ...dummyForm,
    },
  ];

  const updateParticipationDTO = {
    questionsAnswer: [
      {
        questionId: 1,
        answer: 'A',
      },
      {
        questionId: 1,
        answer: ['A'],
      },
    ],
    isCompleted: true,
    emailNotificationActive: true,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormService,
        {
          provide: PrismaService,
          useValue: {
            form: {
              findMany: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            participation: {
              findMany: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue({}),
              count: jest.fn().mockResolvedValue(0),
              upsert: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
            },
            question: {
              findMany: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            section: {
              findMany: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            text: {
              findMany: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            radio: {
              findMany: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            checkbox: {
              findMany: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            answer: {
              upsert: jest.fn().mockResolvedValue({}),
              count: jest.fn().mockResolvedValue(0),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FormService>(FormService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prismaService.form.findMany with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService.participation, 'findMany').mockResolvedValueOnce([
      {
        formId: 'formId',
      },
    ] as any);

    expect(await service.getAllAvailableForm('userId')).toEqual({
      statusCode: 200,
      message: 'Successfully get all available form',
      data: expect.any(Object),
    });
  });

  it('should call prismaService.form.findMany with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService, '$transaction').mockResolvedValueOnce([1, 1]);

    expect(await service.getOwnedForm('userId')).toEqual(expect.any(Object));
  });

  it('should call prismaService.form.findMany with forms type with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService, '$transaction').mockResolvedValueOnce([1, 1]);

    expect(await service.getOwnedForm('userId', 'PUBLISHED')).toEqual(
      expect.any(Object),
    );
  });

  it('should call prismaService.form.findMany with forms type with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService, '$transaction').mockResolvedValueOnce([1, 1]);

    expect(await service.getOwnedForm('userId', 'UNPUBLISHED')).toEqual(
      expect.any(Object),
    );
  });

  it('should call prismaService.form.findMany with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService.participation, 'findMany').mockResolvedValue(
      dummyForms.map((dummyForm) => ({
        form: dummyForm,
        isCompleted: true,
        questionAnswered: 0,
      })) as any,
    );

    expect(await service.getFilledForm('userId')).toEqual(expect.any(Object));
  });

  it('should call prismaService.form.findMany with the correct arguments and form has yet to finish', async () => {
    jest
      .spyOn(prismaService.form, 'findMany')
      .mockResolvedValue(dummyForms as any);

    jest.spyOn(prismaService.participation, 'findMany').mockResolvedValue(
      dummyForms.map((dummyForm) => ({
        form: {
          ...dummyForm,
          endedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
        },
        isCompleted: false,
        questionAnswered: 0,
      })) as any,
    );

    expect(await service.getFilledForm('userId')).toEqual(expect.any(Object));
  });

  it('should throw error if form is not found in getFormById', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);
    const userId = 'userId';

    await expect(
      service.getFormById('formId', 'respondent', userId),
    ).rejects.toThrow('Form not found');
  });

  it('should throw an error on prismaService.form.findUnique if the type is not creator or respondent', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue(dummyForm as any);
    const userId = 'userId';

    await expect(
      service.getFormById('formId', 'invalid', userId),
    ).rejects.toThrow('Type must be creator or respondent');
  });

  it('should call prismaService.form.findUnique as creator with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue(dummyForm as any);
    const userId = 'userId';

    expect(await service.getFormById('formId', 'creator', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get form',
      data: expect.any(Object),
    });
  });

  it('should call prismaService.form.findUnique as respondent with the correct arguments if iscomplete true but endedat is greater than current time', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      endedAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    } as any);
    const userId = 'userId';

    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: userId,
      isCompleted: true,
    } as any);

    expect(await service.getFormById('formId', 'respondent', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get form',
      data: expect.any(Object),
    });
  });

  it('should call prismaService.form.findUnique as respondent with the correct arguments if iscomplete true but endedat is lesser than current time', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      endedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
    } as any);
    const userId = 'userId';

    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: userId,
      isCompleted: true,
    } as any);

    expect(await service.getFormById('formId', 'respondent', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get form',
      data: expect.any(Object),
    });
  });

  it('should call prismaService.form.findUnique as respondent with the correct arguments if iscomplete false but endedat is greater than current time', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      endedAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    } as any);
    const userId = 'userId';

    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: userId,
      isCompleted: false,
    } as any);

    expect(await service.getFormById('formId', 'respondent', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get form',
      data: expect.any(Object),
    });
  });

  it('should throw an error if prizeType is LUCKY and maxWinner is not provided in create form', async () => {
    const createDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
    };

    await expect(
      service.createForm('userId', createDTO as any),
    ).rejects.toThrow('Max winner is required for LUCKY prize type');
  });

  it('should call prismaService.form.create with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'create')
      .mockResolvedValue(dummyForm as any);

    const createDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
    };

    expect(await service.createForm('userId', createDTO as any)).toEqual({
      statusCode: 201,
      message: 'Successfully create form',
      data: dummyForm,
    });
  });

  it('should throw an error if prizeType is LUCKY and maxWinner is not provided in update form', async () => {
    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('Max winner is required for LUCKY prize type');
  });

  it('should throw an error if form is not found in update form', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('Form not found');
  });

  it('should throw an error if user is not the creator of the form in update form', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('User is not authorized to modify form');
  });

  it('should throw an error if some of the form question is not labeled as SECTION or DEFAULT', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'INVALID',
          question: {
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('Type must be SECTION or DEFAULT');
  });

  it('should throw an error if some of the form question is labeled as SECTION but does not have sectionName or questions', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionName: 'Section 1',
        },
      ],
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('SECTION Type must have sectionName and questions');
  });

  it('should throw an error if some of the form question is labeled as DEFAULT but does not have question', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'DEFAULT',
        },
      ],
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('Question is required for DEFAULT type');
  });

  it('should throw an error if the form is already been published in update form', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId', isPublished: true } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'DEFAULT',
          question: {
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    await expect(
      service.updateForm('formId', 'userId', updateDTO as any),
    ).rejects.toThrow('Form is already published');
  });

  it('should call prismaService.form.update with the correct arguments to make form drafted again', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      isDraft: true,
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should call prismaService.form.update with the correct arguments to make form published', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      isPublished: true,
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should handle error when creating form questions if sectionId and questionId does not exists on database', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    jest
      .spyOn(prismaService.section, 'update')
      .mockRejectedValue(new BadRequestException('Section not found'));

    jest
      .spyOn(prismaService.question, 'update')
      .mockRejectedValue(new BadRequestException('Question not found'));

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionId: 1,
          sectionName: 'Section 1',
          sectionDescription: 'Description',
          questions: [
            {
              questionType: 'RADIO',
              isRequired: true,
              question: 'Question 1',
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
          ],
        },
        {
          type: 'DEFAULT',
          question: {
            questionId: 2,
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should handle error when creating form questions if questionId on sections does not exists on database', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    jest.spyOn(prismaService.section, 'update').mockResolvedValue({
      id: 1,
      name: 'Section 1',
      formId: 'formId',
    } as any);

    jest
      .spyOn(prismaService.question, 'update')
      .mockRejectedValue(new BadRequestException('Question not found'));

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionName: 'Section 1',
          sectionDescription: 'Description',
          questions: [
            {
              questionId: 1,
              questionType: 'RADIO',
              isRequired: true,
              question: 'Question 1',
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
          ],
        },
        {
          type: 'DEFAULT',
          question: {
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should process form questions correctly, creating question in action', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    jest.spyOn(prismaService.section, 'create').mockResolvedValue({
      id: 1,
      name: 'Section 1',
      formId: 'formId',
    } as any);

    jest.spyOn(prismaService.question, 'create').mockResolvedValue({
      questionId: 1,
      questionType: 'RADIO',
      isRequired: true,
      question: 'Question 1',
    } as any);

    jest.spyOn(prismaService.radio, 'create').mockResolvedValue({
      questionId: 1,
      formId: 'formId',
      choice: ['A', 'B', 'C', 'D', 'E'],
    } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionName: 'Section 1',
          sectionDescription: 'Description',
          questions: [
            {
              questionType: 'RADIO',
              isRequired: true,
              question: 'Question 1',
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
          ],
        },
        {
          type: 'DEFAULT',
          question: {
            questionType: 'RADIO',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should process form questions correctly, updating question in action', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    jest.spyOn(prismaService.section, 'create').mockResolvedValue({
      id: 1,
      name: 'Section 1',
      formId: 'formId',
    } as any);

    jest.spyOn(prismaService.question, 'create').mockResolvedValue({
      questionId: 1,
      questionType: 'RADIO',
      isRequired: true,
      question: 'Question 1',
    } as any);

    jest.spyOn(prismaService.radio, 'create').mockResolvedValue({
      questionId: 1,
      formId: 'formId',
      choice: ['A', 'B', 'C', 'D', 'E'],
    } as any);

    jest.spyOn(prismaService.question, 'update').mockResolvedValue({
      questionId: 2,
      questionType: 'RADIO',
      isRequired: true,
      question: 'Question 2',
    } as any);

    jest.spyOn(prismaService.question, 'findUnique').mockResolvedValue({
      questionId: 2,
      questionType: 'TEXT',
      description: 'Description',
      isRequired: true,
      question: 'Question 2',
    } as any);

    jest.spyOn(prismaService.radio, 'create').mockResolvedValue({
      questionId: 2,
      formId: 'formId',
      choice: ['A', 'B', 'C', 'D', 'E'],
    } as any);

    jest.spyOn(prismaService.text, 'delete').mockResolvedValue({} as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionName: 'Section 1',
          questions: [
            {
              questionType: 'RADIO',
              isRequired: true,
              question: 'Question 1',
              description: 'Description',
              choice: ['A', 'B', 'C', 'D', 'E'],
            },
          ],
        },
        {
          type: 'DEFAULT',
          question: {
            questionId: 2,
            questionType: 'RADIO',
            description: 'Description',
            isRequired: true,
            question: 'Question 2',
            choice: ['A', 'B', 'C', 'D', 'E'],
          },
        },
      ],
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should process form questions correctly, updating section in action and question inside section', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.form, 'update')
      .mockResolvedValue(dummyForm as any);

    jest.spyOn(prismaService.section, 'create').mockResolvedValue({
      id: 1,
      name: 'Section 1',
      formId: 'formId',
    } as any);

    jest.spyOn(prismaService.section, 'update').mockResolvedValue({
      id: 1,
      name: 'Section 2',
      formId: 'formId',
      description: 'New Description',
    } as any);

    jest.spyOn(prismaService.question, 'findUnique').mockResolvedValue({
      questionId: 1,
      questionType: 'RADIO',
      isRequired: true,
      question: 'Question X',
      choice: ['A', 'B', 'C', 'D', 'E'],
    } as any);

    jest.spyOn(prismaService.question, 'update').mockResolvedValue({
      questionId: 1,
      questionType: 'RADIO',
      description: 'Description',
      isRequired: true,
      question: 'Question 1',
    } as any);

    jest.spyOn(prismaService.radio, 'update').mockResolvedValue({
      questionId: 1,
      formId: 'formId',
      choice: ['A', 'B', 'C', 'D', 'E', 'F'],
    } as any);

    const updateDTO = {
      title: '',
      prize: 20000,
      prizeType: 'LUCKY',
      maxWinner: 1,
      formQuestions: [
        {
          type: 'SECTION',
          sectionId: 1,
          sectionName: 'Section 2',
          sectionDescription: 'New Description',
          questions: [
            {
              questionType: 'RADIO',
              questionId: 1,
              description: 'Description',
              isRequired: true,
              question: 'Question 1',
              choice: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
          ],
        },
      ],
    };

    expect(
      await service.updateForm('formId', 'userId', updateDTO as any),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update form',
      data: expect.any(Object),
    });
  });

  it('should throw an error if form is not found in delete form', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);

    await expect(service.deleteForm('formId', 'userId')).rejects.toThrow(
      'Form not found',
    );
  });

  it('should throw an error if user is not the creator of the form in delete form', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    await expect(service.deleteForm('formId', 'userId')).rejects.toThrow(
      'User is not authorized to modify form',
    );
  });

  it('should call prismaService.form.delete with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest.spyOn(prismaService.form, 'delete').mockResolvedValue({} as any);

    expect(await service.deleteForm('formId', 'userId')).toEqual({
      statusCode: 200,
      message: 'Successfully delete form',
      data: {},
    });
  });

  it('should throw an error if form is not found in delete question', async () => {
    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);

    await expect(service.deleteQuestion('formId', 1, 'userId')).rejects.toThrow(
      'Form not found',
    );
  });

  it('should throw an error if user is not the creator of the form in delete question', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    await expect(service.deleteQuestion('formId', 1, 'userId')).rejects.toThrow(
      'User is not authorized to modify form',
    );
  });

  it('should throw an error if section is not found in form', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.section, 'findUnique')
      .mockResolvedValue(null as any);

    await expect(service.deleteSection('formId', 1, 'userId')).rejects.toThrow(
      'Section not found',
    );
  });

  it('should call prismaService.section.delete with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue(dummyForm as any);

    jest
      .spyOn(prismaService.section, 'findUnique')
      .mockResolvedValue({} as any);

    jest.spyOn(prismaService.section, 'delete').mockResolvedValue({} as any);

    expect(await service.deleteSection('formId', 1, 'userId')).toEqual({
      statusCode: 200,
      message: 'Successfully delete section',
      data: expect.any(Object),
    });
  });

  it('should throw an error if question is not found in delete question', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId' } as any);

    jest
      .spyOn(prismaService.question, 'findUnique')
      .mockResolvedValue(null as any);

    await expect(service.deleteQuestion('formId', 1, 'userId')).rejects.toThrow(
      'Question not found',
    );
  });

  it('should call prismaService.question.delete with the correct arguments', async () => {
    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue(dummyForm as any);

    jest
      .spyOn(prismaService.question, 'findUnique')
      .mockResolvedValue({} as any);

    jest.spyOn(prismaService.question, 'delete').mockResolvedValue({} as any);

    expect(await service.deleteQuestion('formId', 1, 'userId')).toEqual({
      statusCode: 200,
      message: 'Successfully delete question',
      data: expect.any(Object),
    });
  });

  it('should be able to participate should respondent is found', async () => {
    jest
      .spyOn(prismaService.participation, 'upsert')
      .mockResolvedValue({} as any);

    expect(
      await service.participateOnQuestionnaire('formId', 'userId'),
    ).toEqual({
      statusCode: 201,
      message: 'Successfully participate in form',
      data: {},
    });
  });

  it('should log the error should prisma service throw an error', async () => {
    jest
      .spyOn(prismaService.participation, 'upsert')
      .mockRejectedValue(new BadRequestException('Error'));

    expect(
      await service.participateOnQuestionnaire('formId', 'userId'),
    ).toEqual(undefined);
  });

  it('should throw error if participation is not found', async () => {
    jest
      .spyOn(prismaService.participation, 'findUnique')
      .mockResolvedValue(null as any);

    expect(
      service.updateParticipation('formId', 'userId', updateParticipationDTO),
    ).rejects.toThrow('Participation not found');
  });

  it('should throw error if respondent is not the authorized', async () => {
    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: 'otherUserId',
    } as any);

    expect(
      service.updateParticipation('formId', 'userId', updateParticipationDTO),
    ).rejects.toThrow('User is not authorized to modify participation');
  });

  it('should throw error if respondent has completed the form', async () => {
    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: 'userId',
      isCompleted: true,
    } as any);

    const updateParticipationDTO = {
      questionsAnswer: [],
    };

    expect(
      service.updateParticipation('formId', 'userId', updateParticipationDTO),
    ).rejects.toThrow('You have completed this form');
  });

  it('should throw an error if processing answer throw an error', async () => {
    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: 'userId',
      isCompleted: false,
    } as any);

    jest.spyOn(prismaService.answer, 'upsert').mockRejectedValue({} as any);

    jest
      .spyOn(prismaService.participation, 'update')
      .mockResolvedValue({} as any);

    expect(
      await service.updateParticipation(
        'formId',
        'userId',
        updateParticipationDTO,
      ),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update participation',
      data: {},
    });
  });

  it('should throw an error if updating participation throw an error', async () => {
    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: 'userId',
      isCompleted: false,
    } as any);

    jest
      .spyOn(prismaService.participation, 'update')
      .mockRejectedValue({} as any);

    jest.spyOn(prismaService.answer, 'upsert').mockResolvedValue({} as any);

    expect(
      await service.updateParticipation(
        'formId',
        'userId',
        updateParticipationDTO,
      ),
    ).toEqual(undefined);
  });

  it('should call prismaService.participation.update with the correct arguments', async () => {
    jest.spyOn(prismaService.participation, 'findUnique').mockResolvedValue({
      respondentId: 'userId',
      isCompleted: false,
    } as any);

    jest
      .spyOn(prismaService.participation, 'update')
      .mockResolvedValue({} as any);

    jest.spyOn(prismaService.answer, 'upsert').mockResolvedValue({} as any);

    expect(
      await service.updateParticipation(
        'formId',
        'userId',
        updateParticipationDTO,
      ),
    ).toEqual({
      statusCode: 200,
      message: 'Successfully update participation',
      data: {},
    });
  });

  it('should call getFormSummary with the correct arguments', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      isPublished: true,
    } as any);

    expect(await service.getFormSummary('formId', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get questionnaire summary',
      data: expect.any(Object),
    });
  });

  it('should throw an error if form is not found in getFormSummary', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);

    await expect(service.getFormSummary('formId', userId)).rejects.toThrow(
      'Form not found',
    );
  });

  it('should throw an error if user is not the creator of the form in getFormSummary', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    await expect(service.getFormSummary('formId', userId)).rejects.toThrow(
      'User is not authorized to view form summary',
    );
  });

  it('should throw an error if form is not published in getFormSummary', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId', isPublished: false } as any);

    await expect(service.getFormSummary('formId', userId)).rejects.toThrow(
      'Form is not published',
    );
  });

  it('should call getAllQuestionsAnswer with the correct arguments', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      isPublished: true,
    } as any);

    expect(await service.getAllQuestionsAnswer('formId', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get all questions answer',
      data: expect.any(Object),
    });
  });

  it('should throw an error if participation is not found in getAllQuestionsAnswer', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null);

    await expect(
      service.getAllQuestionsAnswer('formId', userId),
    ).rejects.toThrow('Form not found');
  });

  it('should throw an error if respondent is not the authorized in getAllQuestionsAnswer', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    await expect(
      service.getAllQuestionsAnswer('formId', userId),
    ).rejects.toThrow('User is not authorized to view form summary');
  });

  it('should throw an error if form is not published in getAllQuestionsAnswer', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId', isPublished: false } as any);

    await expect(
      service.getAllQuestionsAnswer('formId', userId),
    ).rejects.toThrow('Form is not published');
  });

  it('should call getAllIndividual with the correct arguments', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue({
      ...dummyForm,
      isPublished: true,
    } as any);

    jest.spyOn(prismaService.participation, 'findMany').mockResolvedValue([
      {
        respondentId: 'userId',
      },
    ] as any);

    expect(await service.getAllIndividual('formId', userId)).toEqual({
      statusCode: 200,
      message: 'Successfully get all individual',
      data: expect.any(Object),
    });
  });

  it('should throw an error if form is not found in getAllIndividual', async () => {
    const userId = 'userId';

    jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null as any);

    await expect(service.getAllIndividual('formId', userId)).rejects.toThrow(
      'Form not found',
    );
  });

  it('should throw an error if user is not the creator of the form in getAllIndividual', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'otherUserId' } as any);

    await expect(service.getAllIndividual('formId', userId)).rejects.toThrow(
      'User is not authorized to view form summary',
    );
  });

  it('should throw an error if form is not published in getAllIndividual', async () => {
    const userId = 'userId';

    jest
      .spyOn(prismaService.form, 'findUnique')
      .mockResolvedValue({ creatorId: 'userId', isPublished: false } as any);

    await expect(service.getAllIndividual('formId', userId)).rejects.toThrow(
      'Form is not published',
    );
  });
});
