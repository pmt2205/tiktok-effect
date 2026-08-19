import { Injectable, Logger } from '@nestjs/common';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  private settings: OverlaySettings = {
    soundEnabled: true,
    duration: 5,
    density: 2,
    theme: 'neon-pulse',
  };

  private mappings: GiftMappings = {
    rose: { effect: 'video', sound: 'rose', videoUrl: 'rose.mp4' },
    'hoa hồng': { effect: 'video', sound: 'rose', videoUrl: 'rose.mp4' },
    galaxy: { effect: 'star', sound: 'galaxy' },
    lion: { effect: 'star', sound: 'galaxy' },
    tiktok: { effect: 'video', sound: 'tiktok', videoUrl: 'tiktok.mp4' },
  };

  getSettings(): OverlaySettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<OverlaySettings>): OverlaySettings {
    this.settings = { ...this.settings, ...newSettings };
    this.logger.log('Settings updated');
    return this.settings;
  }

  getMappings(): GiftMappings {
    return { ...this.mappings };
  }

  updateMappings(newMappings: GiftMappings): GiftMappings {
    this.mappings = { ...newMappings };
    this.logger.log('Mappings updated');
    return this.mappings;
  }
}
