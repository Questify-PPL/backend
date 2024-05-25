import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { CreateLinkDto } from 'src/dto/link';

@Injectable()
export class LinkService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLink(formId: string) {
    const linkMapping = await this.getLinkMappingByFormId(formId);

    if (!linkMapping) {
      throw new NotFoundException(`Form id ${formId} has no mapping to link`);
    }

    return {
      statusCode: 200,
      message: `Successfully map form id ${formId} to link`,
      data: linkMapping.link,
    };
  }

  async getFormIdByLink(link: string) {
    const linkMapping = await this.getLinkMappingByLink(link);

    if (!linkMapping) {
      throw new NotFoundException(`Link ${link} has no mapping to form id`);
    }

    return {
      statusCode: 200,
      message: `Successfully map link ${link} to form id`,
      data: linkMapping.formId,
    };
  }

  async createLink(createLinkDto: CreateLinkDto) {
    const form = await this.prismaService.form.findUnique({
      where: { id: createLinkDto.formId },
    });

    if (!form) {
      throw new NotFoundException(
        `Form id ${createLinkDto.formId} is not valid`,
      );
    }

    const linkMapping = await this.getLinkMappingByFormId(createLinkDto.formId);

    if (linkMapping) {
      throw new BadRequestException(
        `Link mapping to form id ${createLinkDto.formId} has already exists`,
      );
    }

    const existingLinks = await this.getAllLinks();

    let link: string;
    do {
      link = this.generateRandomString();
    } while (existingLinks.includes(link));

    await this.prismaService.link.create({
      data: {
        formId: createLinkDto.formId,
        link,
      },
    });

    return {
      statusCode: 201,
      message: `Successfully create a link for form id ${createLinkDto.formId}`,
      data: link,
    };
  }

  async isLinkExistByFormId(formId: string) {
    return !!(await this.getLinkMappingByFormId(formId));
  }

  private generateRandomString() {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$-_.+!*()';
    const randomBytesArray = randomBytes(7);
    const randomString = [...randomBytesArray]
      .map((byte) => characters[byte % characters.length])
      .join('');
    return randomString;
  }

  private async getAllLinks() {
    const linkMappings = await this.prismaService.link.findMany({
      select: { link: true },
    });
    return linkMappings.map((mapping) => mapping.link);
  }

  private async getLinkMappingByFormId(formId: string) {
    return await this.prismaService.link.findUnique({
      where: { formId },
    });
  }

  private async getLinkMappingByLink(link: string) {
    return await this.prismaService.link.findUnique({
      where: { link },
    });
  }
}
