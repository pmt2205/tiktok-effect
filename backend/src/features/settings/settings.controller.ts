import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(
    @Req() req: any,
    @Query('username') queryUsername?: string,
  ): Promise<any> {
    const targetUsername = (req.user.role === 'admin' && queryUsername)
      ? queryUsername
      : req.user.username;
    return this.settingsService.getSettingsForUser(targetUsername);
  }

  @Put()
  async updateSettings(
    @Req() req: any,
    @Body() settings: Partial<any> & { username?: string },
    @Query('username') queryUsername?: string,
  ): Promise<any> {
    const targetUsername = (req.user.role === 'admin' && (queryUsername || settings.username))
      ? (queryUsername || settings.username)
      : req.user.username;
    const bodyCopy = { ...settings };
    delete bodyCopy.username;
    return this.settingsService.updateSettingsForUser(targetUsername, bodyCopy);
  }


  @Get('mappings')
  async getMappings(): Promise<any> {
    return {};
  }

  // NPC Categories CRUD
  @Get('npc-categories')
  async getAllNpcCategories(): Promise<any[]> {
    return this.settingsService.getAllNpcCategories();
  }

  @Post('npc-categories')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createNpcCategory(
    @Body('name') name: string,
    @Body('displayName') displayName: string,
  ): Promise<any> {
    return this.settingsService.createNpcCategory(name, displayName);
  }

  @Delete('npc-categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteNpcCategory(@Param('id') id: string): Promise<any> {
    return this.settingsService.deleteNpcCategory(id);
  }
}
