import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { FunnelService } from './funnel.service';
import { RecordSentimentDto } from './dto/record-sentiment.dto';

@ApiTags('Funnel (Public)')
@Controller('f')
export class FunnelController {
  constructor(private funnelService: FunnelService) {}

  /** Returns branding & config for the public funnel page */
  @Get(':slug')
  @ApiOperation({ summary: 'Get funnel page data by QR slug' })
  getFunnelData(@Param('slug') slug: string) {
    return this.funnelService.getFunnelData(slug);
  }

  /** Called when customer picks a smiley face */
  @Post(':slug/sentiment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record customer sentiment choice' })
  recordSentiment(
    @Param('slug') slug: string,
    @Body() dto: RecordSentimentDto,
    @Req() req: Request,
  ) {
    return this.funnelService.recordSentiment(slug, dto, req);
  }

  /** Called when customer taps the Google Review link */
  @Post(':slug/review-click/:sentimentEventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record that a customer clicked the Google Review link' })
  recordReviewClick(
    @Param('slug') slug: string,
    @Param('sentimentEventId') sentimentEventId: string,
  ) {
    return this.funnelService.recordReviewClick(slug, sentimentEventId);
  }
}
