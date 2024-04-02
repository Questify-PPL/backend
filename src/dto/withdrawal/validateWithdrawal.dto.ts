import { IsNotEmpty, IsBoolean } from 'class-validator';

export class ValidateWithdrawalDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly isApproved: boolean;
}
