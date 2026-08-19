import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`\n======================================================`);
  logger.log(`  TikTok Live Overlay Backend running on port ${port}`);
  logger.log(`  API: http://localhost:${port}/api`);
  logger.log(`  WebSocket: ws://localhost:${port}`);
  logger.log(`  Media: http://localhost:${port}/media/`);
  logger.log(`======================================================\n`);
}

bootstrap();
