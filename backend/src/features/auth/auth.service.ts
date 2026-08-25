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
        allowNpc: user.allowNpc ?? false,
      },
    };
  }

  async loginWithGoogle(idToken: string) {
    if (!idToken) {
      throw new UnauthorizedException('Missing Google ID token');
    }

    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!res.ok) {
        throw new UnauthorizedException('Invalid Google ID token');
      }

      const payload = await res.json();
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        throw new UnauthorizedException('Google ID token client ID mismatch');
      }

      const email = payload.email;
      if (!email) {
        throw new UnauthorizedException('Google token missing email profile details');
      }

      let user = await this.usersService.findByUsername(email);
      if (!user) {
        const placeholderPassword = Math.random().toString(36).slice(-10) + Date.now();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(placeholderPassword, salt);
        user = await this.usersService.create(email, hash, 'user');
      }

      const appPayload = {
        sub: user._id,
        username: user.username,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(appPayload),
        user: {
          userId: user._id,
          username: user.username,
          role: user.role,
          allowConnect: user.allowConnect ?? false,
          allowNpc: user.allowNpc ?? false,
        },
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException(`Google login failed: ${err.message}`);
    }
  }
}
