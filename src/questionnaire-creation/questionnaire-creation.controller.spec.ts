import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireCreationController } from './questionnaire-creation.controller';
import { QuestionnaireCreationService } from './questionnaire-creation.service';
import { PrizeType } from '@prisma/client';

describe('QuestionnaireCreationController', () => {
  let controller: QuestionnaireCreationController;
  let service: QuestionnaireCreationService;

  beforeEach(async () => {
    const mockQuestionnaireCreationService = {
      createDraft: jest.fn(),
      updateDraft: jest.fn(),
      finalizeQuestionnaire: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireCreationController],
      providers: [
        {
          provide: QuestionnaireCreationService,
          useValue: mockQuestionnaireCreationService,
        },
      ],
    }).compile();

    controller = module.get<QuestionnaireCreationController>(
      QuestionnaireCreationController,
    );
    service = module.get<QuestionnaireCreationService>(
      QuestionnaireCreationService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call controllerService.createDraft with the correct arguments', async () => {
    const dto = {
      creatorId: 'creatorId',
      title: 'Title',
      prizeType: PrizeType.EVEN,
      prize: 100,
      maxParticipant: 100,
      maxWinner: 10,
    };

    const response = {
      statusCode: 201,
      message: 'Draft successfully created.',
      data: {
        formId: 'generatedId',
        ...dto,
        isDraft: true,
        isPublished: false,
      },
    };

    service.createDraft = jest.fn().mockResolvedValue(response);
    expect(await controller.createDraft(dto)).toEqual(response);
  });

  it('should call controllerService.updateDraft with the correct arguments', async () => {
    const formId = 'validFormId';
    const dto = {
      formId,
      creatorId: 'creatorId',
      title: 'Title',
      prizeType: PrizeType.EVEN,
      prize: 100,
      maxParticipant: 100,
      maxWinner: 10,
    };

    const response = {
      statusCode: 200,
      message: 'Draft successfully updated.',
      data: {
        formId,
        ...dto,
        isDraft: true,
        isPublished: false,
      },
    };

    service.updateDraft = jest.fn().mockResolvedValue(response);

    expect(await controller.updateDraft(formId, dto)).toEqual(response);
  });

  it('should call controllerService.finalizeQuestionnaire with the correct arguments', async () => {
    const formId = 'validFormId';

    const response = {
      statusCode: 200,
      message: 'Draft successfully finalized.',
      data: {
        formId,
        isDraft: false,
        isPublished: true,
      },
    };

    service.finalizeQuestionnaire = jest.fn().mockResolvedValue(response);
    expect(await controller.finalizeQuestionnaire(formId)).toEqual(response);
  });
});
