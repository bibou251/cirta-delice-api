import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ArtisansModule } from './artisans/artisans.module';

@Module({
  imports: [
    // ─── Configuration globale ───────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,           // Accessible dans toute l'app sans réimporter
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,  // .env.production en prod
        '.env',                          // .env en fallback
      ],
    }),

    // ─── Base de données (TypeORM) ────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // 1. Priorité à l'URI complet (DATABASE_URL fourni par certains hébergeurs)
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: process.env.TYPEORM_SYNC === 'true',
            ssl: { rejectUnauthorized: false },
            // Retry automatique si la DB met du temps à démarrer
            retryAttempts: 10,
            retryDelay: 3000,
          };
        }

        // 2. Variables séparées (Supabase / local Docker)
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
  ],
})
export class AppModule {}
