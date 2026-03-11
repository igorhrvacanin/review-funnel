import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RecordSentimentDto } from './dto/record-sentiment.dto';

@Injectable()
export class FunnelService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────────
  // GET funnel data (branding + slug info for the funnel page)
  // ────────────────────────────────────────────────────────────────
  async getFunnelData(slug: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { slug },
      include: {
        profile: {
          select: {
            businessName: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!qr || !qr.isActive) {
      throw new NotFoundException('QR code not found or inactive');
    }

    return {
      slug: qr.slug,
      businessName: qr.profile.businessName,
      logoUrl: qr.profile.logoUrl,
      primaryColor: qr.profile.primaryColor,
      customization: qr.customization,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // RECORD a scan + sentiment
  // ────────────────────────────────────────────────────────────────
  async recordSentiment(slug: string, dto: RecordSentimentDto, req: Request) {
    const qr = await this.findActiveQrOrThrow(slug);

    // Create scan event
    const scanEvent = await this.prisma.scanEvent.create({
      data: {
        qrCodeId: qr.id,
        ipAddress: this.getClientIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      },
    });

    // Create sentiment event
    const sentimentEvent = await this.prisma.sentimentEvent.create({
      data: {
        qrCodeId: qr.id,
        scanEventId: scanEvent.id,
        sentiment: dto.sentiment,
      },
    });

    return {
      sentimentEventId: sentimentEvent.id,
      sentiment: dto.sentiment,
      // If positive, return the google review URL so frontend can redirect
      googleReviewUrl: dto.sentiment === 'POSITIVE' ? qr.googleReviewUrl : null,
    };
  }

  // ────────────────────────────────────────────────────────────────
  // RECORD a review click (customer tapped "Leave a Review" link)
  // ────────────────────────────────────────────────────────────────
  async recordReviewClick(slug: string, sentimentEventId: string) {
    const qr = await this.findActiveQrOrThrow(slug);

    await this.prisma.reviewClickEvent.create({
      data: {
        qrCodeId: qr.id,
        sentimentEventId,
      },
    });

    return { message: 'Review click recorded' };
  }

  // ────────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────────
  private async findActiveQrOrThrow(slug: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { slug },
    });
    if (!qr || !qr.isActive) {
      throw new NotFoundException('QR code not found or inactive');
    }
    return qr;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress ?? 'unknown';
  }
}
