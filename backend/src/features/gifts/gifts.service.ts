import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gift } from './schemas/gift.schema';

@Injectable()
export class GiftsService implements OnModuleInit {
  private readonly logger = new Logger(GiftsService.name);

  private readonly defaultGifts = [
    { giftId: 5655, name: 'Hoa Hồng', coins: 1, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png', videos: ['rose.mp4'] },
    { giftId: 5267, name: 'Logo TikTok', coins: 1, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/5f8ef94b05537ee4313f890280eb4c28.png~tplv-obj.image', videos: ['tiktok.mp4'] },
    { giftId: 5621, name: 'Thả Tim', coins: 5, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/91bdc30c88581e19d7d10e82c1615f5c.png~tplv-obj.image', videos: [] },
    { giftId: 5827, name: 'Nước Hoa', coins: 20, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/8ad42e88a0e0eeae6d56d11da9bdc8c2.png~tplv-obj.image', videos: [] },
    { giftId: 5601, name: 'Mũ Cap', coins: 99, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/cap.png', videos: [] },
    { giftId: 5661, name: 'Thiên Hà', coins: 1000, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/galaxy.png', videos: [] },
    { giftId: 6101, name: 'Pháo Hoa', coins: 1088, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/6fa301d0bc88aa77df3c907a3c3065d6.png~tplv-obj.image', videos: [] },
    { giftId: 5313, name: 'Vương Miện', coins: 1999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/f6595561a052ff378907a3c3065d64f0.png~tplv-obj.image', videos: [] },
    { giftId: 5617, name: 'Kim Cương', coins: 2999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/740fd5b5bf7d0577789a8e0e8e040c24.png~tplv-obj.image', videos: [] },
    { giftId: 5825, name: 'Sư Tử', coins: 29999, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/lion.png', videos: [] },
  ];

  private onGiftsChange?: (gifts: Gift[]) => void;

  constructor(
    @InjectModel(Gift.name) private readonly giftModel: Model<Gift>,
  ) {}

  registerChangeCallback(callback: (gifts: Gift[]) => void) {
    this.onGiftsChange = callback;
  }

  private async triggerChange() {
    if (this.onGiftsChange) {
      try {
        const gifts = await this.findAll();
        this.onGiftsChange(gifts);
      } catch (err) {
        this.logger.error('Failed to trigger gifts change callback:', err);
      }
    }
  }

  async onModuleInit() {
    try {
      // Safety check: wipe collection if it contains legacy data (e.g. string giftId or legacy effect properties)
      const sampleGift = await this.giftModel.findOne().exec();
      if (sampleGift && (isNaN(Number(sampleGift.giftId)) || sampleGift.get('effect') !== undefined)) {
        this.logger.log('Detected legacy gifts schema. Wiping gifts collection to re-seed.');
        await this.giftModel.deleteMany({});
      }

      const count = await this.giftModel.countDocuments().exec();
      if (count === 0) {
        await this.giftModel.insertMany(this.defaultGifts);
        this.logger.log('Seeded default TikTok gifts in MongoDB');
      }
    } catch (err) {
      this.logger.error('Failed to seed default gifts:', err);
    }
  }

  async findAll(): Promise<Gift[]> {
    return this.giftModel.find().sort({ coins: 1 }).exec();
  }

  async findOne(id: string): Promise<Gift | null> {
    return this.giftModel.findById(id).exec();
  }

  async findByGiftId(giftId: number): Promise<Gift | null> {
    return this.giftModel.findOne({ giftId }).exec();
  }

  async create(giftData: Partial<Gift>): Promise<Gift> {
    const newGift = new this.giftModel(giftData);
    const saved = await newGift.save();
    await this.triggerChange();
    return saved;
  }

  async update(id: string, giftData: Partial<Gift>): Promise<Gift | null> {
    const updated = await this.giftModel.findByIdAndUpdate(id, giftData, { new: true }).exec();
    await this.triggerChange();
    return updated;
  }

  async remove(id: string): Promise<any> {
    const deleted = await this.giftModel.findByIdAndDelete(id).exec();
    await this.triggerChange();
    return deleted;
  }
}
