import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ArtisansModule } from './artisans/artisans.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [

    // ─── Configuration globale ───────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
    }),

    // ─── Serveur Fichiers Statiques (Uploads / Photos HD Products) ──────────
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // ─── Base de données (TypeORM) ────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: process.env.TYPEORM_SYNC === 'true',
            ssl: { rejectUnauthorized: false },
            retryAttempts: 10,
            retryDelay: 3000,
          };
        }

        const isRemote =
          process.env.NODE_ENV === 'production' ||
          (process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== undefined);

        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'cirta',
          password: process.env.DB_PASSWORD || 'cirta_secret',
          database: process.env.DB_DATABASE || 'cirta',
          autoLoadEntities: true,
          synchronize: process.env.TYPEORM_SYNC === 'true',
          ssl: isRemote ? { rejectUnauthorized: false } : false,
          retryAttempts: 10,
          retryDelay: 3000,
          logging: process.env.NODE_ENV !== 'production',
        };
      },
    }),

    // ─── Modules métier ───────────────────────────────────────────────────
    AuthModule,
    ProductsModule,
    OrdersModule,
    ArtisansModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
