import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(): OverlaySettings {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() settings: Partial<OverlaySettings>): OverlaySettings {
    return this.settingsService.updateSettings(settings);
  }

  @Get('mappings')
  getMappings(): GiftMappings {
    return this.settingsService.getMappings();
  }

  @Put('mappings')
  updateMappings(@Body() mappings: GiftMappings): GiftMappings {
    return this.settingsService.updateMappings(mappings);
  }
}
