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
            deleteQuestion: jest.fn().mockResolvedValue({}),
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
    expect(await controller.getAllAvailableForm()).toEqual({});
  });

  it('should call formService.getFormById with the correct arguments', async () => {
    const formId = 'formId';

    expect(await controller.getFormById(formId)).toEqual({});
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

  it('should call formService.deleteQuestion with the correct arguments', async () => {
    const formId = 'formId';
    const questionId = 1;
    const userId = 'userId';

    expect(await controller.deleteQuestion(formId, questionId, userId)).toEqual(
      {},
    );
  });
});
