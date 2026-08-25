import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('role') role?: string,
  ) {
    // Default to 'user' role if not specified
    const userRole = role === 'admin' ? 'admin' : 'user';
    return this.authService.register(username, password, userRole);
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(username, password);
  }

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    return this.authService.loginWithGoogle(idToken);
  }
}
