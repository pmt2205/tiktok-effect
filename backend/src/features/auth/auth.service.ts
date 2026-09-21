import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
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
    const normalizedUsername = username?.trim().toLowerCase();
    if (!normalizedUsername || normalizedUsername.length < 3 || normalizedUsername.length > 64 || /\s/.test(normalizedUsername)) {
      throw new BadRequestException('Tài khoản phải có từ 3 đến 64 ký tự và không chứa khoảng trắng');
    }
    if (!password || password.length < 10 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      throw new BadRequestException('Mật khẩu phải có 10–128 ký tự, gồm chữ hoa, chữ thường và số');
    }
    const existing = await this.usersService.findByUsername(normalizedUsername);
    if (existing) {
      throw new ConflictException('Tài khoản này đã tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    let user;
    try {
      user = await this.usersService.create(normalizedUsername, hash, role);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ConflictException('Tài khoản này đã tồn tại');
      }
      throw error;
    }
    return {
      userId: user._id,
      username: user.username,
      role: user.role,
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionStartedAt: user.subscriptionStartedAt ?? null,
      subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
    };
  }

  async login(username: string, password: string) {
    const normalizedUsername = username?.trim();
    if (!normalizedUsername || !password) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const user = await this.usersService.findByUsername(normalizedUsername);
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
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
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionStartedAt: user.subscriptionStartedAt ?? null,
        subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
        allowConnect: user.allowConnect ?? false,
        allowNpc: user.allowNpc ?? false,
      },
    };
  }

  createOverlayToken(username: string) {
    return {
      accessToken: this.jwtService.sign(
        { sub: username, username, role: 'overlay', scope: 'overlay' },
        { expiresIn: '24h' },
      ),
      expiresIn: 86400,
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
          subscriptionTier: user.subscriptionTier || 'free',
          subscriptionStartedAt: user.subscriptionStartedAt ?? null,
          subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
          allowConnect: user.allowConnect ?? false,
          allowNpc: user.allowNpc ?? false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new UnauthorizedException(`Google login failed: ${message}`);
    }
  }
}
