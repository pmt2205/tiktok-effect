import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gift } from './schemas/gift.schema';

@Injectable()
export class GiftsService {
  private readonly logger = new Logger(GiftsService.name);

  private readonly defaultGifts = [
    { giftId: 5655, name: 'Hoa Hồng', coins: 1, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png', videos: ['rose.mp4'], activeVideo: 'rose.mp4' },
    { giftId: 5267, name: 'Logo TikTok', coins: 1, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/5f8ef94b05537ee4313f890280eb4c28.png~tplv-obj.image', videos: ['tiktok.mp4'], activeVideo: 'tiktok.mp4' },
    { giftId: 5621, name: 'Thả Tim', coins: 5, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/91bdc30c88581e19d7d10e82c1615f5c.png~tplv-obj.image', videos: [] },
    { giftId: 5827, name: 'Nước Hoa', coins: 20, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/8ad42e88a0e0eeae6d56d11da9bdc8c2.png~tplv-obj.image', videos: [] },
    { giftId: 5601, name: 'Mũ Cap', coins: 99, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/cap.png', videos: [] },
    { giftId: 5661, name: 'Thiên Hà', coins: 1000, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/galaxy.png', videos: [] },
    { giftId: 6101, name: 'Pháo Hoa', coins: 1088, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/6fa301d0bc88aa77df3c907a3c3065d6.png~tplv-obj.image', videos: [] },
    { giftId: 5313, name: 'Vương Miện', coins: 1999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/f6595561a052ff378907a3c3065d64f0.png~tplv-obj.image', videos: [] },
    { giftId: 5617, name: 'Kim Cương', coins: 2999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/740fd5b5bf7d0577789a8e0e8e040c24.png~tplv-obj.image', videos: [] },
    { giftId: 5825, name: 'Sư Tử', coins: 29999, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/lion.png', videos: [] },
  ];

  private onGiftsChange?: (username: string, gifts: Gift[]) => void;

  constructor(
    @InjectModel(Gift.name) private readonly giftModel: Model<Gift>,
  ) {}

  registerChangeCallback(callback: (username: string, gifts: Gift[]) => void) {
    this.onGiftsChange = callback;
  }

  private async triggerChange(username: string) {
    if (this.onGiftsChange) {
      try {
        const gifts = await this.findAllForUser(username);
        this.onGiftsChange(username, gifts);
      } catch (err) {
        this.logger.error(`Failed to trigger gifts change callback for user ${username}:`, err);
      }
    }
  }

  async findAllForUser(username: string): Promise<Gift[]> {
    try {
      const count = await this.giftModel.countDocuments({ username }).exec();
      if (count === 0) {
        const seedData = this.defaultGifts.map(g => ({
          ...g,
          username,
        }));
        await this.giftModel.insertMany(seedData);
        this.logger.log(`Seeded default gifts for user: ${username}`);
      }
      return this.giftModel.find({ username }).sort({ coins: 1 }).exec();
    } catch (err) {
      this.logger.error(`Failed to find gifts for user ${username}:`, err);
      return [];
    }
  }

  async findOneForUser(id: string, username: string): Promise<Gift | null> {
    return this.giftModel.findOne({ _id: id, username }).exec();
  }

  async findByGiftIdForUser(giftId: number, username: string): Promise<Gift | null> {
    return this.giftModel.findOne({ giftId, username }).exec();
  }

  async createForUser(username: string, giftData: Partial<Gift>): Promise<Gift> {
    const newGift = new this.giftModel({
      ...giftData,
      username,
    });
    const saved = await newGift.save();
    await this.triggerChange(username);
    return saved;
  }

  async updateForUser(id: string, username: string, giftData: Partial<Gift>): Promise<Gift | null> {
    const updated = await this.giftModel.findOneAndUpdate(
      { _id: id, username },
      giftData,
      { new: true }
    ).exec();
    await this.triggerChange(username);
    return updated;
  }

  async removeForUser(id: string, username: string): Promise<any> {
    const deleted = await this.giftModel.findOneAndDelete({ _id: id, username }).exec();
    await this.triggerChange(username);
    return deleted;
  }
}

