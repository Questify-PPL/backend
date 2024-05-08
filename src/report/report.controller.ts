import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser, Roles } from 'src/decorator';
import { CreateReportDto, UpdateReportDto, FindQueryDto } from 'src/dto';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { ReportService } from './report.service';

@ApiTags('report')
@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createReportDto: CreateReportDto) {
    return this.reportService.create(user, createReportDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: FindQueryDto = {}) {
    return this.reportService.findAll(query);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportService.update(id, updateReportDto);
  }
}
