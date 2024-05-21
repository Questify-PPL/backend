import { Test, TestingModule } from '@nestjs/testing';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';

describe('LinkController', () => {
  let controller: LinkController;
  let linkService: LinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkController],
      providers: [
        {
          provide: LinkService,
          useValue: {
            getLink: jest.fn(),
            getLinkMapping: jest.fn(),
            createLink: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LinkController>(LinkController);
    linkService = module.get<LinkService>(LinkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLink', () => {
    it('should call getLink service method with correct formId', async () => {
      const formId = '123456';
      await controller.getLink(formId);
      expect(linkService.getLink).toHaveBeenCalledWith(formId);
    });
  });

  describe('getLinkMapping', () => {
    it('should call getLinkMapping service method with correct link', async () => {
      const link = 'example-link';
      await controller.getLinkMapping(link);
      expect(linkService.getLinkMapping).toHaveBeenCalledWith(link);
    });
  });

  describe('createLink', () => {
    it('should call createLink service method with correct data', async () => {
      const createLinkDto = { formId: 'f1' };
      await controller.createLink(createLinkDto);
      expect(linkService.createLink).toHaveBeenCalledWith(createLinkDto);
    });
  });
});
