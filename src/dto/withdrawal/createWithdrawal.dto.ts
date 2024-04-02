import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsInt()
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly payment: string;

  @IsNotEmpty()
  @IsString()
  readonly accountNumber: string;
}
