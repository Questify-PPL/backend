import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateParticipationDTO {
  @ApiProperty({
    title: 'Question Answer Array',
    type: Array,
  })
  @IsArray()
  @IsOptional()
  questionsAnswer?: QuestionAnswer[];

  @ApiProperty({
    title: 'Is Completed',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({
    title: 'Email Notif Enabled',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailNotificationActive?: boolean;
}

export class QuestionAnswer {
  @ApiProperty({
    title: 'Question Id',
    type: Number,
  })
  @IsNumber()
  questionId: number;

  @ApiProperty({
    title: 'Answer',
    type: Object,
  })
  @IsObject()
  answer: object;
}
