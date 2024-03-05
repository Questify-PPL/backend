import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireCreationService } from './questionnaire-creation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrizeType } from '@prisma/client';

const mockPrismaService = {
  form: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('QuestionnaireCreationService', () => {
  let service: QuestionnaireCreationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireCreationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<QuestionnaireCreationService>(
      QuestionnaireCreationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDraft', () => {
    it('should successfully create a draft', async () => {
      const form = {
        creatorId: 'creatorId',
        title: 'Title',
        prizeType: PrizeType.EVEN,
        prize: 100,
        maxParticipant: undefined,
        maxWinner: undefined,
        isDraft: true,
        isPublished: false,
      };
      mockPrismaService.form.create.mockResolvedValue(form);

      expect(
        await service.createDraft(
          form.creatorId,
          form.title,
          form.prizeType,
          form.prize,
        ),
      ).toEqual({
        data: form,
        message: 'Draft successfully created.',
        statusCode: 201,
      });
      expect(mockPrismaService.form.create).toHaveBeenCalledWith({
        data: form,
      });
    });

    it('should create a draft with minimal required fields', async () => {
      const minimalFormData = {
        creatorId: 'creatorId',
        title: 'Minimal Draft',
        prizeType: PrizeType.EVEN,
        prize: 1,
        isDraft: true,
        isPublished: false,
        maxParticipant: undefined,
        maxWinner: undefined,
      };
      mockPrismaService.form.create.mockResolvedValue({
        ...minimalFormData,
        isDraft: true,
        isPublished: false,
      });

      const result = await service.createDraft(
        minimalFormData.creatorId,
        minimalFormData.title,
        minimalFormData.prizeType,
        minimalFormData.prize,
      );
      expect(result).toEqual({
        data: minimalFormData,
        message: 'Draft successfully created.',
        statusCode: 201,
      });
      expect(mockPrismaService.form.create).toHaveBeenCalledWith({
        data: expect.objectContaining(minimalFormData),
      });
    });
  });

  describe('updateDraft', () => {
    it('should successfully update a draft', async () => {
      const formId = 'validFormId';
      const updateData = {
        creatorId: 'creatorId',
        title: 'Updated Title',
        prizeType: PrizeType.EVEN,
        prize: 200,
        maxParticipant: 100,
        maxWinner: 10,
        isDraft: true,
        isPublished: false,
      };
      mockPrismaService.form.findUnique.mockResolvedValue({
        id: formId,
        isPublished: false,
      });

      mockPrismaService.form.update.mockResolvedValue({
        id: formId,
        ...updateData,
      });

      const result = await service.updateDraft(
        formId,
        updateData.creatorId,
        updateData.title,
        updateData.prizeType,
        updateData.prize,
        updateData.maxParticipant,
        updateData.maxWinner,
      );
      expect(result).toEqual({
        data: { formId, ...updateData },
        message: 'Draft successfully updated.',
        statusCode: 200,
      });

      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: formId },
        data: expect.objectContaining({
          title: updateData.title,
          prizeType: updateData.prizeType,
          prize: updateData.prize,
          maxParticipant: updateData.maxParticipant,
          maxWinner: updateData.maxWinner,
          isDraft: true,
          isPublished: false,
        }),
      });
    });

    it('should throw NotFoundException if form does not exist', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);
      await expect(
        service.updateDraft(
          'nonExistingFormId',
          'validCreatorId',
          'Title',
          'EVEN',
          100,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if form is already published', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue({
        isPublished: true,
      });
      await expect(
        service.updateDraft(
          'existingFormId',
          'validCreatorId',
          'Title',
          'EVEN',
          100,
        ),
      ).rejects.toThrow(BadRequestException);
    });
    it('should update the draft with minimal prize', async () => {
      const formId = 'existingFormId';

      const updateData = {
        title: 'Updated Title',
        prizeType: PrizeType.EVEN,
        prize: 1,
        isDraft: true,
        isPublished: false,
        maxParticipant: undefined,
        maxWinner: undefined,
      };
      mockPrismaService.form.findUnique.mockResolvedValue({
        id: formId,
        isPublished: false,
      });
      mockPrismaService.form.update.mockResolvedValue({
        id: formId,
        ...updateData,
        isDraft: true,
        isPublished: false,
      });

      const result = await service.updateDraft(
        formId,
        'validCreatorId',
        updateData.title,
        updateData.prizeType,
        updateData.prize,
      );
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            formId,
            creatorId: 'validCreatorId',
            isDraft: true,
            isPublished: false,
            maxParticipant: undefined,
            maxWinner: undefined,
            prize: 1,
            prizeType: 'EVEN',
            title: 'Updated Title',
          },
          message: 'Draft successfully updated.',
          statusCode: 200,
        }),
      );
    });
  });

  describe('finalizeQuestionnaire', () => {
    it('should successfully finalize a questionnaire', async () => {
      const formId = 'validFormId';
      mockPrismaService.form.findUnique.mockResolvedValue({
        id: formId,
        isPublished: false,
      });
      mockPrismaService.form.update.mockResolvedValue({
        id: formId,
        isDraft: false,
        isPublished: true,
      });

      const result = await service.finalizeQuestionnaire(formId);
      expect(result).toEqual(
        expect.objectContaining({
          data: { formId, isDraft: false, isPublished: true },
          message: 'Draft successfully finalized.',
          statusCode: 200,
        }),
      );
      expect(mockPrismaService.form.update).toHaveBeenCalledWith({
        where: { id: formId },
        data: { isDraft: false, isPublished: true },
      });
    });
  });

  describe('findQuestionnaireById', () => {
    it('should return a form if it exists', async () => {
      const formId = 'existingFormId';
      const expectedForm = { id: formId, title: 'Existing Form' };
      mockPrismaService.form.findUnique.mockResolvedValue(expectedForm);

      const form = await service.findQuestionnaireById(formId);
      expect(form).toEqual(expectedForm);
    });

    it('should return null if form does not exist', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue(null);
      const form = await service.findQuestionnaireById('nonExistingFormId');
      expect(form).toBeNull();
    });

    it('should throw BadRequestException when trying to update/finalize an already published form', async () => {
      mockPrismaService.form.findUnique.mockResolvedValue({
        id: 'formId',
        isPublished: true,
      });

      await expect(
        service.updateDraft('formId', 'validCreatorId', 'Title', 'EVEN', 100),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
