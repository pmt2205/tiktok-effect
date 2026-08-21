import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftsService } from './gifts.service';
import { Gift } from './schemas/gift.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('api/gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  async findAll(
    @Query('username') queryUsername?: string,
    @Req() req?: any,
  ): Promise<Gift[]> {
    let username = queryUsername;

    // Fallback: decode JWT from Authorization header if not provided in query (for dashboard mount fetch)
    if (!username && req && req.headers && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const payloadPart = token.split('.')[1];
          const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));
          username = payload.username;
        } catch (e) {
          // ignore
        }
      }
    }

    if (!username) {
      return [];
    }

    return this.giftsService.findAllForUser(username);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'media'),
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const cleanName = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_.-]/g, '');
          const ext = extname(cleanName);
          const baseName = cleanName.substring(0, cleanName.length - ext.length);
          callback(null, `${baseName}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file: any, callback: any) => {
        if (!file.originalname.match(/\.(mp4)$/)) {
          return callback(new Error('Only MP4 video files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    return {
      success: true,
      filename: file.filename,
      url: `/media/${file.filename}`,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async create(@Body() giftData: Partial<Gift>, @Req() req: any): Promise<Gift> {
    return this.giftsService.createForUser(req.user.username, giftData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async update(
    @Param('id') id: string,
    @Body() giftData: Partial<Gift>,
    @Req() req: any,
  ): Promise<Gift | null> {
    const user = req.user;
    if (user && user.role !== 'admin') {
      const allowedUpdate: Partial<Gift> = {};
      if (giftData.activeVideo !== undefined) {
        allowedUpdate.activeVideo = giftData.activeVideo;
      }
      return this.giftsService.updateForUser(id, user.username, allowedUpdate);
    }
    return this.giftsService.updateForUser(id, user.username, giftData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async remove(@Param('id') id: string, @Req() req: any): Promise<any> {
    return this.giftsService.removeForUser(id, req.user.username);
  }
}

