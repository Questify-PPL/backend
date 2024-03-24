import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateTopupDto {
  @IsNotEmpty()
  @IsInt()
  readonly amount: number;
}
