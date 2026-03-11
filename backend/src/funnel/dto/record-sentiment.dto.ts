import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sentiment } from '@prisma/client';

export class RecordSentimentDto {
  @ApiProperty({ enum: Sentiment, example: 'POSITIVE' })
  @IsEnum(Sentiment)
  sentiment: Sentiment;
}
