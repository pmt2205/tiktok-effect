import { Module } from '@nestjs/common';
import { TiktokModule } from './features/tiktok/tiktok.module';
import { WebsocketModule } from './features/websocket/websocket.module';
import { SettingsModule } from './features/settings/settings.module';
import { MediaModule } from './features/media/media.module';

@Module({
  imports: [TiktokModule, WebsocketModule, SettingsModule, MediaModule],
})
export class AppModule {}
