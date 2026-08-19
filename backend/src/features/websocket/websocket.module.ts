import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TiktokModule } from '../tiktok/tiktok.module';
import { SettingsModule } from '../settings/settings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TiktokModule, SettingsModule, AuthModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
