import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: any): Promise<OverlaySettings> {
    return this.settingsService.getSettingsForUser(req.user.username);
  }

  @Put()
  async updateSettings(@Req() req: any, @Body() settings: Partial<OverlaySettings>): Promise<OverlaySettings> {
    return this.settingsService.updateSettingsForUser(req.user.username, settings);
  }

  @Get('mappings')
  async getMappings(@Req() req: any): Promise<GiftMappings> {
    return this.settingsService.getMappingsForUser(req.user.username);
  }

  @Put('mappings')
  async updateMappings(@Req() req: any, @Body() mappings: GiftMappings): Promise<GiftMappings> {
    return this.settingsService.updateMappingsForUser(req.user.username, mappings);
  }
}

