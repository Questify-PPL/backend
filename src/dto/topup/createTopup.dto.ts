import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateTopupDto {
  @IsNotEmpty()
  @IsInt()
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly payment: string;

  @IsNotEmpty()
  @IsString()
  readonly exchange: string;
}
