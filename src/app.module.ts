import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === 'production' || !!process.env.DB_HOST?.includes('supabase');
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'cirta',
          password: process.env.DB_PASSWORD || 'cirta_secret',
          database: process.env.DB_DATABASE || 'cirta',
          autoLoadEntities: true,
          synchronize: process.env.TYPEORM_SYNC === 'true',
          ssl: isProd
            ? {
                rejectUnauthorized: false,
                servername: process.env.DB_HOST,
              }
            : false,
        };
      },
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
