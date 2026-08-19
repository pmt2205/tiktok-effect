import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(): OverlaySettings {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateSettings(@Body() settings: Partial<OverlaySettings>): OverlaySettings {
    return this.settingsService.updateSettings(settings);
  }

  @Get('mappings')
  getMappings(): GiftMappings {
    return this.settingsService.getMappings();
  }

  @Put('mappings')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateMappings(@Body() mappings: GiftMappings): GiftMappings {
    return this.settingsService.updateMappings(mappings);
  }
}
