import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LinkService } from './link.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { Roles } from 'src/decorator';
import { Role } from '@prisma/client';
import { CreateLinkDto } from 'src/dto/link';

@ApiTags('link')
@Controller('link')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get('/:formId')
  @Roles(Role.CREATOR, Role.RESPONDENT)
  getLink(@Param('formId') formId: string) {
    return this.linkService.getLink(formId);
  }

  @Get('/mapping/:link')
  @Roles(Role.CREATOR, Role.RESPONDENT)
  getFormIdByLink(@Param('link') link: string) {
    return this.linkService.getFormIdByLink(link);
  }

  @Post('/create')
  @Roles(Role.ADMIN)
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.linkService.createLink(createLinkDto);
  }
}
