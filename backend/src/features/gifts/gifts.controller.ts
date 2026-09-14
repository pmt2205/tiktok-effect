import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftsService } from './gifts.service';
import { UsersService } from '../users/users.service';
import { ForbiddenException } from '@nestjs/common';
import { Gift } from './schemas/gift.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('api/gifts')
@UseGuards(JwtAuthGuard)
export class GiftsController {
  constructor(private readonly giftsService: GiftsService, private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('username') queryUsername?: string,
    @Req() req?: any,
  ): Promise<Gift[]> {
    const username = req.user.role === 'admin' && queryUsername ? queryUsername : req.user.username;

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
      limits: { fileSize: 50 * 1024 * 1024, files: 1 },
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
        if (file.mimetype !== 'video/mp4') {
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

  @Post('upload-sound')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @UseInterceptors(
    FileInterceptor('sound', {
      limits: { fileSize: 15 * 1024 * 1024, files: 1 },
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
        if (!file.mimetype.match(/^audio\/(mpeg|wav|ogg|mp4|aac)$/)) {
          return callback(new Error('Only audio files (MP3, WAV, OGG, M4A, AAC) are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadSound(@UploadedFile() file: any) {
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
    const targetUsername = (req.user.role === 'admin' && giftData.username)
      ? giftData.username
      : req.user.username;
    return this.giftsService.createForUser(targetUsername, giftData);
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
      const userDoc = await this.usersService.findByUsername(user.username);
      const tier = userDoc?.subscriptionTier || 'free';
      if (tier === 'free' && (giftData.activeVideo !== undefined || giftData.activeSound !== undefined)) {
        throw new ForbiddenException('Custom gift effects require Pro or Pro Max');
      }
      if (giftData.menuShow === true && tier !== 'promax') {
        const currentGift = await this.giftsService.findOneForUser(id, user.username);
        const limit = tier === 'pro' ? 10 : 5;
        if (!currentGift?.menuShow && await this.giftsService.countMenuGiftsForUser(user.username) >= limit) {
          throw new ForbiddenException(`Gift menu is limited to ${limit} items for this plan`);
        }
      }
      const allowedUpdate: Partial<Gift> = {};
      if (giftData.activeVideo !== undefined) {
        allowedUpdate.activeVideo = giftData.activeVideo;
      }
      if (giftData.activeSound !== undefined) {
        allowedUpdate.activeSound = giftData.activeSound;
      }
      if (giftData.menuText !== undefined) {
        allowedUpdate.menuText = giftData.menuText;
      }
      if (giftData.menuShow !== undefined) {
        allowedUpdate.menuShow = giftData.menuShow;
      }
      return this.giftsService.updateForUser(id, user.username, allowedUpdate);
    }
    const targetUsername = giftData.username || user.username;
    return this.giftsService.updateForUser(id, targetUsername, giftData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Query('username') queryUsername?: string,
  ): Promise<any> {
    const targetUsername = (req.user.role === 'admin' && queryUsername)
      ? queryUsername
      : req.user.username;
    return this.giftsService.removeForUser(id, targetUsername);
  }

  // NPC Gifts CRUD endpoints
  @Get('npc')
  async findAllNpc(
    @Query('username') queryUsername: string,
    @Query('category') category: string,
    @Req() req?: any,
  ): Promise<any[]> {
    const username = req.user.role === 'admin' && queryUsername ? queryUsername : req.user.username;

    if (!username || !category) {
      return [];
    }

    return this.giftsService.findAllNpcGiftsForUser(username, category);
  }

  @Post('npc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async createNpc(@Body() body: any, @Req() req: any): Promise<any> {
    const targetUsername = (req.user.role === 'admin' && body.username)
      ? body.username
      : req.user.username;
    return this.giftsService.createNpcGiftForUser(targetUsername, body.category || 'anime', body);
  }

  @Put('npc/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async updateNpc(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ): Promise<any> {
    const user = req.user;
    if (user && user.role !== 'admin') {
      const userDoc = await this.usersService.findByUsername(user.username);
      const tier = userDoc?.subscriptionTier || 'free';
      if (body.menuShow === true && tier !== 'promax') {
        const category = body.category || 'anime';
        const currentGift = await this.giftsService.findOneNpcGiftForUser(id, user.username, category);
        const limit = tier === 'pro' ? 10 : 5;
        if (!currentGift?.menuShow && await this.giftsService.countNpcMenuGiftsForUser(user.username, category) >= limit) {
          throw new ForbiddenException(`Gift menu is limited to ${limit} items for this plan`);
        }
      }
      const allowedUpdate: any = {};
      if (body.activeVideo !== undefined) {
        allowedUpdate.activeVideo = body.activeVideo;
      }
      if (body.activeSound !== undefined) {
        allowedUpdate.activeSound = body.activeSound;
      }
      if (body.menuText !== undefined) {
        allowedUpdate.menuText = body.menuText;
      }
      if (body.menuShow !== undefined) {
        allowedUpdate.menuShow = body.menuShow;
      }
      return this.giftsService.updateNpcGiftForUser(id, user.username, body.category || 'anime', allowedUpdate);
    }
    const targetUsername = body.username || user.username;
    return this.giftsService.updateNpcGiftForUser(id, targetUsername, body.category || 'anime', body);
  }

  @Delete('npc/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  async removeNpc(
    @Param('id') id: string,
    @Req() req: any,
    @Query('username') queryUsername?: string,
    @Query('category') category?: string,
  ): Promise<any> {
    const targetUsername = (req.user.role === 'admin' && queryUsername)
      ? queryUsername
      : req.user.username;
    return this.giftsService.removeNpcGiftForUser(id, targetUsername, category || 'anime');
  }
}
