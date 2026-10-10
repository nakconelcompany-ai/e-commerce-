import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SellerModule } from './seller/seller.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReturnsModule } from './returns/returns.module';
import { CouponsModule } from './coupons/coupons.module';
import { SupportModule } from './support/support.module';
import { PayoutsModule } from './payouts/payouts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SellerModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
    ReviewsModule,
    ReturnsModule,
    CouponsModule,
    SupportModule,
    PayoutsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
