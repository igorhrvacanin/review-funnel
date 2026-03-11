import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QrCodesService } from './qr-codes.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('QR Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('qr-codes')
export class QrCodesController {
  constructor(private qrCodesService: QrCodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new QR code' })
  create(@GetUser('id') userId: string, @Body() dto: CreateQrCodeDto) {
    return this.qrCodesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all QR codes for current user' })
  findAll(@GetUser('id') userId: string) {
    return this.qrCodesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single QR code' })
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.qrCodesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a QR code' })
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateQrCodeDto,
  ) {
    return this.qrCodesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a QR code' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.qrCodesService.remove(userId, id);
  }
}
