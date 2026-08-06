import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── CORS ───
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({ origin: corsOrigin });

  // ─── Validation globale ───
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Supprime les propriétés non déclarées dans les DTOs
      forbidNonWhitelisted: false, // Ne bloque pas (mode permissif pour compatibilité)
      transform: true,           // Transforme automatiquement les types (string → number)
    }),
  );

  // ─── Swagger API Documentation ───
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Cirta Délice API')
      .setDescription('API Backend pour l\'application Cirta — Marketplace de saveurs constantinoises')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend Cirta démarré sur le port ${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📖 Swagger disponible sur http://localhost:${port}/api/docs`);
  }
}
bootstrap();
