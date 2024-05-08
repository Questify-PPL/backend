import { ReportStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';

export class FindQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsString()
  @IsUUID()
  toUserId?: string;
}
