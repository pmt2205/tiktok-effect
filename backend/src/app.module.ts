import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TiktokModule } from './features/tiktok/tiktok.module';
import { WebsocketModule } from './features/websocket/websocket.module';
import { SettingsModule } from './features/settings/settings.module';
import { MediaModule } from './features/media/media.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { GiftsModule } from './features/gifts/gifts.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/tiktok-effect'),
    TiktokModule,
    WebsocketModule,
    SettingsModule,
    MediaModule,
    AuthModule,
    UsersModule,
    GiftsModule,
  ],
})
export class AppModule {}
