import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { FunnelModule } from './funnel/funnel.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    QrCodesModule,
    FunnelModule,
    AnalyticsModule,
    FeedbackModule,
    ProfileModule,
  ],
})
export class AppModule {}
