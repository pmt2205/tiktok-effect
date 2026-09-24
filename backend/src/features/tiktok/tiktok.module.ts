import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { GiftsModule } from '../gifts/gifts.module';

@Module({
  imports: [GiftsModule],
  providers: [TiktokService],
  exports: [TiktokService],
})
export class TiktokModule {}
