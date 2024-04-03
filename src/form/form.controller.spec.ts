import { Test, TestingModule } from '@nestjs/testing';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { PrizeType } from '@prisma/client';

describe('FormController', () => {
  let controller: FormController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormController],
      providers: [
        {
          provide: FormService,
          useValue: {
            getAllAvailableForm: jest.fn().mockResolvedValue({}),
            getFormById: jest.fn().mockResolvedValue({}),
            getOwnedForm: jest.fn().mockResolvedValue({}),
            getFilledForm: jest.fn().mockResolvedValue({}),
            createForm: jest.fn().mockResolvedValue({}),
            updateForm: jest.fn().mockResolvedValue({}),
            deleteForm: jest.fn().mockResolvedValue({}),
            deleteSection: jest.fn().mockResolvedValue({}),
            deleteQuestion: jest.fn().mockResolvedValue({}),
            participateOnQuestionnaire: jest.fn().mockResolvedValue({}),
            updateParticipation: jest.fn().mockResolvedValue({}),
            getFormSummary: jest.fn().mockResolvedValue({}),
            getAllQuestionsAnswer: jest.fn().mockResolvedValue({}),
            getAllIndividual: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<FormController>(FormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call formService.getAllAvailableForm with the correct arguments', async () => {
    expect(await controller.getAllAvailableForm('userId')).toEqual({});
  });

  it('should call formService.getFormById with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';

    expect(await controller.getFormById(formId, 'respondent', userId)).toEqual(
      {},
    );
  });

  it('should call formService.getOwnedForm with the correct arguments', async () => {
    const userId = 'userId';

    expect(await controller.getOwnedForm(userId)).toEqual({});
  });

  it('should call formService.getFilledForm with the correct arguments', async () => {
    const userId = 'userId';

    expect(await controller.getFilledForm(userId)).toEqual({});
  });

  it('should call formService.createForm with the correct arguments', async () => {
    const userId = 'userId';
    const createFormDTO = {
      title: '',
      description: '',
      prize: 20000,
      prizeType: PrizeType.LUCKY,
    };

    expect(await controller.createForm(userId, createFormDTO)).toEqual({});
  });

  it('should call formService.updateForm with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    const updateFormDTO = {
      title: '',
      prize: 20000,
      prizeType: PrizeType.LUCKY,
    };

    expect(await controller.updateForm(formId, userId, updateFormDTO)).toEqual(
      {},
    );
  });

  it('should call formService.deleteForm with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';

    expect(await controller.deleteForm(formId, userId)).toEqual({});
  });

  it('should call formService.deleteSection with the correct arguments', async () => {
    const formId = 'formId';
    const sectionId = 1;
    const userId = 'userId';

    expect(await controller.deleteSection(formId, sectionId, userId)).toEqual(
      {},
    );
  });

  it('should call formService.deleteQuestion with the correct arguments', async () => {
    const formId = 'formId';
    const questionId = 1;
    const userId = 'userId';

    expect(await controller.deleteQuestion(formId, questionId, userId)).toEqual(
      {},
    );
  });

  it('should call formService.participateOnQuestionnaire with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    expect(await controller.participateOnQuestionnaire(formId, userId)).toEqual(
      {},
    );
  });

  it('should call formService.updateParticipation with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    const updateParticipationDTO = {
      questionsAnswer: [],
    };

    expect(
      await controller.updateParticipation(
        formId,
        userId,
        updateParticipationDTO,
      ),
    ).toEqual({});
  });

  it('should call formService.getFormSummary with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    expect(await controller.getFormSummary(formId, userId)).toEqual({});
  });

  it('should call formService.getAllQuestionsAnswer with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    expect(await controller.getAllQuestionsAnswer(formId, userId)).toEqual({});
  });

  it('should call formService.getAllIndividualAnswer with the correct arguments', async () => {
    const formId = 'formId';
    const userId = 'userId';
    expect(await controller.getAllIndividual(formId, userId)).toEqual({});
  });
});
