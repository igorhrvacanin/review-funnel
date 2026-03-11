import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Overall KPI summary for the current user' })
  getSummary(@GetUser('id') userId: string) {
    return this.analyticsService.getSummary(userId);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Daily scan counts for the last N days' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  getTimeline(
    @GetUser('id') userId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getTimeline(userId, days);
  }

  @Get('qr/:id')
  @ApiOperation({ summary: 'Analytics for a specific QR code' })
  getQrStats(@GetUser('id') userId: string, @Param('id') qrId: string) {
    return this.analyticsService.getQrStats(userId, qrId);
  }
}
