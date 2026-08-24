import { Controller, Get, Query, UseGuards, Req, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getHistory(@Req() req: any, @Query('username') queryUsername?: string) {
    const username = req.user.username;
    const role = req.user.role;

    if (role === 'admin') {
      const peer = queryUsername || 'admin';
      return this.chatService.getHistory('admin', peer);
    } else {
      return this.chatService.getHistory(username, 'admin');
    }
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.username);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'media'),
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const cleanName = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_.-]/g, '');
          const ext = extname(cleanName);
          const baseName = cleanName.substring(0, cleanName.length - ext.length);
          callback(null, `chat-${baseName}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file: any, callback: any) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i)) {
          return callback(new Error('Only image and video files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    return {
      success: true,
      url: `/media/${file.filename}`,
      filename: file.filename,
    };
  }
}
