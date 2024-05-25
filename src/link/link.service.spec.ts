import { Test, TestingModule } from '@nestjs/testing';
import { LinkService } from './link.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrizeType } from '@prisma/client';

describe('LinkService', () => {
  let service: LinkService;
  let prismaService: PrismaService;

  const validLink = 'abcdefg';
  const invalidLink = 'abcdefgh';

  const validFormId = 'f1';
  const invalidFormId = 'f2';

  const linkMapping = {
    formId: validFormId,
    link: validLink,
  };

  const validCreateLinkDto = {
    formId: validFormId,
  };

  const invalidCreateLinkDto = {
    formId: validFormId,
  };

  const form = {
    id: validFormId,
    creatorId: 'c1',
    title: 'Form 1',
    prize: 100000,
    isDraft: false,
    isPublished: true,
    maxParticipant: 20,
    prizeType: PrizeType.LUCKY,
    maxWinner: 2,
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date(2024, 3, 16),
    endedAt: new Date(2100, 0, 1),
    isWinnerProcessed: false,
    totalPity: 170,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkService,
        {
          provide: PrismaService,
          useValue: {
            link: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            form: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LinkService>(LinkService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLink', () => {
    it('should return the link for a valid formId', async () => {
      jest
        .spyOn(prismaService.link, 'findUnique')
        .mockResolvedValue(linkMapping);

      const result = await service.getLink(validFormId);

      expect(result.statusCode).toEqual(200);
      expect(result.message).toContain('Successfully map form id');
      expect(result.data).toEqual(linkMapping.link);
    });

    it('should throw NotFoundException if formId has no mapping to link', async () => {
      jest.spyOn(prismaService.link, 'findUnique').mockResolvedValue(null);

      await expect(service.getLink(invalidFormId)).rejects.toThrow(
        new NotFoundException(
          `Form id ${invalidFormId} has no mapping to link`,
        ),
      );
    });
  });

  describe('getFormIdByLink', () => {
    it('should return the formId for a valid link', async () => {
      jest
        .spyOn(prismaService.link, 'findUnique')
        .mockResolvedValue(linkMapping);

      const result = await service.getFormIdByLink(validFormId);

      expect(result.statusCode).toEqual(200);
      expect(result.message).toContain('Successfully map link');
      expect(result.data).toEqual(linkMapping.formId);
    });

    it('should throw NotFoundException if link has no mapping to form id', async () => {
      jest.spyOn(prismaService.link, 'findUnique').mockResolvedValue(null);

      await expect(service.getFormIdByLink(invalidLink)).rejects.toThrow(
        new NotFoundException(`Link ${invalidLink} has no mapping to form id`),
      );
    });
  });

  describe('createLink', () => {
    it('should create a new link mapping', async () => {
      jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(form);
      jest.spyOn(prismaService.link, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.link, 'findMany').mockResolvedValue([]);
      jest.spyOn(service as any, 'getAllLinks');

      const result = await service.createLink(validCreateLinkDto);

      expect(prismaService.link.create).toHaveBeenCalled();
      expect((service as any).getAllLinks).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toEqual(201);
      expect(result.message).toContain('Successfully create a link');
      expect(result.data).toHaveLength(7);
    });

    it('should create a new link mapping if the previous created mapping already exists', async () => {
      jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(form);
      jest.spyOn(prismaService.link, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.link, 'findMany')
        .mockResolvedValueOnce([linkMapping])
        .mockResolvedValueOnce([]);
      jest
        .spyOn(service as any, 'generateRandomString')
        .mockReturnValueOnce(linkMapping.link);

      const result = await service.createLink(validCreateLinkDto);

      expect(prismaService.link.create).toHaveBeenCalled();
      expect((service as any).generateRandomString).toHaveBeenCalledTimes(2);
      expect(result.statusCode).toEqual(201);
      expect(result.message).toContain('Successfully create a link');
      expect(result.data).toHaveLength(7);
    });

    it('should throw NotFoundException if formId is not valid', async () => {
      jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(null);

      await expect(service.createLink(invalidCreateLinkDto)).rejects.toThrow(
        new NotFoundException(
          `Form id ${invalidCreateLinkDto.formId} is not valid`,
        ),
      );
    });

    it('should throw BadRequestException if link mapping already exists', async () => {
      jest.spyOn(prismaService.form, 'findUnique').mockResolvedValue(form);
      jest
        .spyOn(prismaService.link, 'findUnique')
        .mockResolvedValue(linkMapping);

      await expect(service.createLink(validCreateLinkDto)).rejects.toThrow(
        new BadRequestException(
          `Link mapping to form id ${validCreateLinkDto.formId} has already exists`,
        ),
      );
    });
  });

  describe('isLinkExistByFormId', () => {
    it('should return true if the form has link', async () => {
      jest
        .spyOn(prismaService.link, 'findUnique')
        .mockResolvedValue(linkMapping);

      const result = await service.isLinkExistByFormId(validFormId);

      expect(prismaService.link.findUnique).toHaveBeenCalledWith({
        where: { formId: validFormId },
      });
      expect(result).toBe(true);
    });

    it('should return false if the form has no link', async () => {
      jest.spyOn(prismaService.link, 'findUnique').mockResolvedValue(null);

      const result = await service.isLinkExistByFormId(validFormId);

      expect(prismaService.link.findUnique).toHaveBeenCalledWith({
        where: { formId: validFormId },
      });
      expect(result).toBe(false);
    });
  });
});
