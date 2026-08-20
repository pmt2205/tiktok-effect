import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string, role: string) {
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const user = await this.usersService.create(username, hash, role);
    return {
      userId: user._id,
      username: user.username,
      role: user.role,
    };
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user._id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        userId: user._id,
        username: user.username,
        role: user.role,
        allowConnect: user.allowConnect ?? false,
      },
    };
  }
}
