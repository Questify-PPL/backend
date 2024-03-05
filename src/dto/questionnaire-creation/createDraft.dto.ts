import { PrizeType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDraftDto {
  @IsNotEmpty()
  @IsUUID()
  creatorId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(PrizeType)
  prizeType: 'EVEN' | 'LUCKY';

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  prize: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxParticipant?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWinner?: number;
}
