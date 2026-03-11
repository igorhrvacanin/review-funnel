import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  /** Public — called from FeedbackFormView (no auth) */
  @Post()
  @ApiOperation({ summary: 'Submit private customer feedback (public)' })
  submit(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.submit(dto);
  }

  /** Protected — dashboard inbox */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all private feedback for current user' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  findAll(
    @GetUser('id') userId: string,
    @Query('unread') unread?: string,
  ) {
    return this.feedbackService.findAll(userId, unread === 'true');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark feedback read/unread' })
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a feedback entry' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.feedbackService.remove(userId, id);
  }
}
