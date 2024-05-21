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
  getLinkMapping(@Param('link') link: string) {
    return this.linkService.getLinkMapping(link);
  }

  @Post('/create')
  @Roles(Role.CREATOR, Role.RESPONDENT)
  createLink(@Body() createLinkDto: CreateLinkDto) {
    return this.linkService.createLink(createLinkDto);
  }
}
