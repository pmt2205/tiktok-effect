import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';
import { Gift, GiftSchema } from './schemas/gift.schema';
import { NpcGift, NpcGiftSchema } from './schemas/npc-gift.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gift.name, schema: GiftSchema },
      { name: NpcGift.name, schema: NpcGiftSchema },
    ]),
  ],
  controllers: [GiftsController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
