import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TiktokModule } from './features/tiktok/tiktok.module';
import { WebsocketModule } from './features/websocket/websocket.module';
import { SettingsModule } from './features/settings/settings.module';
import { MediaModule } from './features/media/media.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { GiftsModule } from './features/gifts/gifts.module';
import { ChatModule } from './features/chat/chat.module';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { HealthController } from './health.controller';

function getMongoUri(): string {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  const host = process.env.MONGO_HOST || 'localhost';
  const port = process.env.MONGO_PORT || '27017';
  const database = process.env.MONGO_DATABASE || 'tiktok-effect';
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;

  if (!username || !password) {
    return `mongodb://${host}:${port}/${database}`;
  }

  return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=admin`;
}

@Module({
  controllers: [HealthController],
  imports: [
    MongooseModule.forRoot(getMongoUri()),
    TiktokModule,
    WebsocketModule,
    SettingsModule,
    MediaModule,
    AuthModule,
    UsersModule,
    GiftsModule,
    ChatModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
