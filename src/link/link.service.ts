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
    const linkMapping = await this.prismaService.link.findUnique({
      where: { formId },
    });

    if (!linkMapping) {
      throw new NotFoundException(`Form id ${formId} has no mapping to link`);
    }

    return {
      statusCode: 200,
      message: `Successfully map form id ${formId} to link`,
      data: linkMapping.shortLink,
    };
  }

  async getLinkMapping(link: string) {
    const linkMapping = await this.prismaService.link.findUnique({
      where: { shortLink: link },
    });

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

    const linkMapping = await this.prismaService.link.findUnique({
      where: { formId: createLinkDto.formId },
    });

    if (linkMapping) {
      throw new BadRequestException(
        `Link mapping to form id ${createLinkDto.formId} has already exists`,
      );
    }

    let shortLink: string;
    do {
      shortLink = this.generateRandomString();
    } while (await this.isLinkExist(shortLink));

    await this.prismaService.link.create({
      data: {
        formId: createLinkDto.formId,
        shortLink,
      },
    });

    return {
      statusCode: 201,
      message: `Successfully create short link for form id ${createLinkDto.formId}`,
      data: shortLink,
    };
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

  private async isLinkExist(shortLink: string): Promise<boolean> {
    const linkMapping = await this.prismaService.link.findUnique({
      where: { shortLink },
    });
    return linkMapping !== null;
  }
}
