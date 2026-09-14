import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitEntry>();

  use(req: Request, _res: Response, next: NextFunction) {
    const now = Date.now();
    const route = req.path;
    const isAuth = route.startsWith('/api/auth/');
    const isExpensive = route.startsWith('/api/tts/') || route.includes('/upload');
    const limit = isAuth ? 10 : isExpensive ? 30 : 120;
    const windowMs = 60_000;
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${clientId}:${route}`;
    const current = this.requests.get(key);

    if (!current || now >= current.resetAt) {
      this.requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= limit) {
      throw new HttpException('Too many requests. Please try again in one minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    current.count += 1;
    next();
  }
}
