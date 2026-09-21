import { BadRequestException, Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Put(':id/permissions')
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: {
      allowConnect?: boolean;
      allowNpc?: boolean;
      allowedNpcCategories?: string[];
      subscriptionTier?: 'free' | 'pro' | 'promax';
      subscriptionStartedAt?: string | null;
      subscriptionExpiresAt?: string | null;
    },
  ): Promise<any> {
    const updates: Parameters<UsersService['updatePermissions']>[1] = {};
    if (typeof body.allowConnect === 'boolean') updates.allowConnect = body.allowConnect;
    if (typeof body.allowNpc === 'boolean') updates.allowNpc = body.allowNpc;
    if (Array.isArray(body.allowedNpcCategories)) updates.allowedNpcCategories = body.allowedNpcCategories.filter((item): item is string => typeof item === 'string');
    if (body.subscriptionTier !== undefined) {
      if (!['free', 'pro', 'promax'].includes(body.subscriptionTier)) throw new BadRequestException('Invalid subscription tier');
      updates.subscriptionTier = body.subscriptionTier;
    }

    for (const field of ['subscriptionStartedAt', 'subscriptionExpiresAt'] as const) {
      if (body[field] === undefined) continue;
      if (body[field] === null || body[field] === '') {
        updates[field] = null;
        continue;
      }
      const parsedDate = new Date(body[field]);
      if (Number.isNaN(parsedDate.getTime())) throw new BadRequestException(`Invalid ${field}`);
      updates[field] = parsedDate;
    }

    if (updates.subscriptionStartedAt && updates.subscriptionExpiresAt && updates.subscriptionExpiresAt <= updates.subscriptionStartedAt) {
      throw new BadRequestException('Subscription expiry must be after its start date');
    }

    return this.usersService.updatePermissions(id, updates);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.usersService.remove(id);
  }
}
