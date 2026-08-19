import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TiktokModule } from '../tiktok/tiktok.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TiktokModule, SettingsModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
