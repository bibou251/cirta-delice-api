import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({ origin: corsOrigin });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend NestJS Cirta démarré sur le port ${port}`);
}
bootstrap();
