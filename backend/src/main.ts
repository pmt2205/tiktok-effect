import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a strong value of at least 32 characters');
  }
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  // Thêm domain thật vào origin
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://tiktokeffect.io.vn',
      'https://www.tiktokeffect.io.vn',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  // Cho phép lắng nghe trên tất cả interface mạng
  await app.listen(port, '0.0.0.0');

  logger.log(`Server running on port ${port}`);
}

bootstrap();
