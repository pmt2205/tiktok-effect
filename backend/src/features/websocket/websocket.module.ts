import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TiktokModule } from '../tiktok/tiktok.module';
import { SettingsModule } from '../settings/settings.module';
import { AuthModule } from '../auth/auth.module';
import { GiftsModule } from '../gifts/gifts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TiktokModule, SettingsModule, AuthModule, GiftsModule, UsersModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
