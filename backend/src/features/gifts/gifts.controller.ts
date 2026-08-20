import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftsService } from './gifts.service';
import { Gift } from './schemas/gift.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('api/gifts')
@UseGuards(JwtAuthGuard)
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  async findAll(): Promise<Gift[]> {
    return this.giftsService.findAll();
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('admin')
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
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() giftData: Partial<Gift>): Promise<Gift> {
    return this.giftsService.create(giftData);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() giftData: Partial<Gift>): Promise<Gift | null> {
    return this.giftsService.update(id, giftData);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<any> {
    return this.giftsService.remove(id);
  }
}
