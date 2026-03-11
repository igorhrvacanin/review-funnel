import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { nanoid } from 'nanoid';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  PRO: 10,
  BUSINESS: 100,
};

@Injectable()
export class QrCodesService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateQrCodeDto) {
    // Get user's business profile
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        qrCodes: { where: { isActive: true } },
      },
    });

    if (!profile) {
      throw new BadRequestException('Please complete your business profile first');
    }

    // Enforce plan limits
    const limit = PLAN_LIMITS[profile.user.plan] ?? 1;
    if (profile.qrCodes.length >= limit) {
      throw new ForbiddenException(
        `Your ${profile.user.plan} plan allows max ${limit} active QR code(s). Please upgrade.`,
      );
    }

    // Validate locationId belongs to this profile
    if (dto.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: dto.locationId, profileId: profile.id },
      });
      if (!location) throw new NotFoundException('Location not found');
    }

    const slug = nanoid(8);
    const funnelUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/f/${slug}`;

    return this.prisma.qrCode.create({
      data: {
        slug,
        name: dto.name,
        googleReviewUrl: dto.googleReviewUrl,
        funnelUrl,
        profileId: profile.id,
        locationId: dto.locationId ?? null,
        customization: dto.customization ?? {},
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // FIND ALL (for user)
  // ────────────────────────────────────────────────────────────────
  async findAll(userId: string) {
    const profile = await this.getProfileOrThrow(userId);

    return this.prisma.qrCode.findMany({
      where: { profileId: profile.id },
      include: {
        location: true,
        _count: {
          select: {
            scanEvents: true,
            feedbacks: true,
            reviewClickEvents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // FIND ONE
  // ────────────────────────────────────────────────────────────────
  async findOne(userId: string, id: string) {
    const profile = await this.getProfileOrThrow(userId);

    const qr = await this.prisma.qrCode.findFirst({
      where: { id, profileId: profile.id },
      include: {
        location: true,
        _count: {
          select: {
            scanEvents: true,
            feedbacks: true,
            reviewClickEvents: true,
          },
        },
      },
    });

    if (!qr) throw new NotFoundException('QR code not found');
    return qr;
  }

  // ────────────────────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────────────────────
  async update(userId: string, id: string, dto: UpdateQrCodeDto) {
    const profile = await this.getProfileOrThrow(userId);

    const qr = await this.prisma.qrCode.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!qr) throw new NotFoundException('QR code not found');

    return this.prisma.qrCode.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.googleReviewUrl && { googleReviewUrl: dto.googleReviewUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.customization && { customization: dto.customization }),
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────────
  async remove(userId: string, id: string) {
    const profile = await this.getProfileOrThrow(userId);

    const qr = await this.prisma.qrCode.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!qr) throw new NotFoundException('QR code not found');

    await this.prisma.qrCode.delete({ where: { id } });
    return { message: 'QR code deleted' };
  }

  // ────────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────────
  private async getProfileOrThrow(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Business profile not found');
    return profile;
  }
}
