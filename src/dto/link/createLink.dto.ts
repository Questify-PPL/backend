import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLinkDto {
  @IsNotEmpty()
  @IsString()
  readonly formId: string;
}
