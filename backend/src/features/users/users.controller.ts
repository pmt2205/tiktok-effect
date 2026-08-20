import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
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
    @Body('allowConnect') allowConnect: boolean,
  ): Promise<any> {
    return this.usersService.updatePermissions(id, allowConnect);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.usersService.remove(id);
  }
}
