import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateReportDto {
  @IsNotEmpty()
  @IsBoolean()
  isApproved: boolean;
}
