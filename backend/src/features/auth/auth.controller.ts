import { Controller, Post, Body, Get, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload.username, payload.password, 'user');
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload.username, payload.password);
  }

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.loginWithGoogle(idToken);
  }

  @Get('overlay-token')
  @UseGuards(JwtAuthGuard)
  async getOverlayToken(@Req() req: { user: { username: string; role: string } }, @Query('username') username?: string) {
    const targetUsername = req.user.role === 'admin' && username ? username : req.user.username;
    if (!targetUsername) throw new BadRequestException('Username is required');
    return this.authService.createOverlayToken(targetUsername);
  }
}
