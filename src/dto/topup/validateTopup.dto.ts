import { IsNotEmpty, IsBoolean } from 'class-validator';

export class ValidateTopupDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly isApproved: boolean;
}
