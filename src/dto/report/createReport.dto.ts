import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  reportToId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  formId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  message: string;
}
