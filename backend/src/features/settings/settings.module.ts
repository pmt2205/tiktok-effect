import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TtsProxyController } from './tts-proxy.controller';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { NpcCategory, NpcCategorySchema } from './schemas/npc-category.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
      { name: NpcCategory.name, schema: NpcCategorySchema },
    ]),
    AuthModule,
  ],
  controllers: [SettingsController, TtsProxyController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
