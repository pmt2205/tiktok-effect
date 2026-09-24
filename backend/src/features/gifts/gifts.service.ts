import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { dirname, extname, join } from 'path';
import { Gift } from './schemas/gift.schema';
import { NpcGift } from './schemas/npc-gift.schema';

import * as vnGiftsData from './data/vn_gifts.json';

@Injectable()
export class GiftsService implements OnModuleInit {
  private readonly logger = new Logger(GiftsService.name);
  private readonly discoveryJobs = new Map<string, Promise<void>>();
  private readonly syncedDefaultGiftUsers = new Set<string>();

  private readonly defaultGifts: any[] = [
    ...(Array.isArray(vnGiftsData) ? vnGiftsData : (vnGiftsData as any).default || []),
  ];
  private readonly discoveredGifts = new Map<string, any>();
  private discoveredGiftWriteQueue: Promise<void> = Promise.resolve();

  private onGiftsChange?: (username: string, gifts: Gift[]) => void;
  private onNpcGiftsChange?: (username: string, category: string, gifts: NpcGift[]) => void;

  constructor(
    @InjectModel(Gift.name) private readonly giftModel: Model<Gift>,
    @InjectModel(NpcGift.name) private readonly npcGiftModel: Model<NpcGift>,
  ) {}

  async onModuleInit() {
    await this.loadDiscoveredGifts();
    await Promise.all([
      this.giftModel.updateMany({ menuShow: true, $or: [{ menuText: '' }, { menuText: { $exists: false } }] }, { $set: { menuShow: false } }).exec(),
      this.npcGiftModel.updateMany({ menuShow: true, $or: [{ menuText: '' }, { menuText: { $exists: false } }] }, { $set: { menuShow: false } }).exec(),
    ]);
    try {
      await this.giftModel.collection.dropIndex('giftId_1');
      this.logger.log('Successfully dropped old unique index giftId_1');
    } catch (err: any) {
      if (err.code !== 27 && err.codeName !== 'IndexNotFound') {
        this.logger.warn(`Failed to drop index giftId_1: ${err.message}`);
      }
    }

    try {
      await this.npcGiftModel.collection.dropIndex('giftId_1');
    } catch (err: any) {
      // ignore
    }
  }

  registerChangeCallback(callback: (username: string, gifts: Gift[]) => void) {
    this.onGiftsChange = callback;
  }

  registerNpcChangeCallback(callback: (username: string, category: string, gifts: NpcGift[]) => void) {
    this.onNpcGiftsChange = callback;
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

  private async triggerNpcChange(username: string, category: string) {
    if (this.onNpcGiftsChange) {
      try {
        const gifts = await this.findAllNpcGiftsForUser(username, category);
        this.onNpcGiftsChange(username, category, gifts);
      } catch (err) {
        this.logger.error(`Failed to trigger NPC gifts change callback for user ${username}:`, err);
      }
    }
  }

  // Standard Gifts CRUD
  async findAllForUser(username: string): Promise<Gift[]> {
    try {
      if (!this.syncedDefaultGiftUsers.has(username)) {
        const defaultGiftIds = this.defaultGifts.map((gift: any) => Number(gift.giftId));
        const removed = await this.giftModel.deleteMany({
          username,
          giftId: { $nin: defaultGiftIds },
        }).exec();

        const operations = this.defaultGifts.map((gift: any) => ({
          updateOne: {
            filter: { username, giftId: Number(gift.giftId) },
            update: {
              $set: {
                name: gift.name,
                nameKey: this.normalizeGiftName(gift.name),
                coins: Number(gift.coins) || 0,
                icon: gift.icon,
              },
              $setOnInsert: {
                username,
                giftId: Number(gift.giftId),
                videos: [],
                activeVideo: '',
                sounds: [],
                activeSound: '',
                menuShow: false,
              },
            },
            upsert: true,
          },
        }));

        const result = await this.giftModel.bulkWrite(operations, { ordered: false });
        this.logger.log(
          `Synchronized exact gift catalog for ${username}: ${removed.deletedCount} removed, ${result.upsertedCount} added, ${result.modifiedCount} refreshed`,
        );
        this.syncedDefaultGiftUsers.add(username);
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

  async countMenuGiftsForUser(username: string): Promise<number> {
    return this.giftModel.countDocuments({ username, menuShow: true }).exec();
  }

  async findByGiftIdForUser(giftId: number, username: string): Promise<Gift | null> {
    return this.giftModel.findOne({ giftId, username }).exec();
  }

  /**
   * Learns a gift seen in a LIVE event without blocking the event broadcast.
   * Names are the primary identity; giftId remains a compatibility fallback.
   */
  discoverGiftForUser(
    username: string,
    gift: { giftId?: number; name: string; coins?: number; icon?: string },
  ): Promise<void> {
    const nameKey = this.normalizeGiftName(gift.name);
    if (!username || !nameKey) return Promise.resolve();

    const jobKey = `${username}:${nameKey}`;
    const pending = this.discoveryJobs.get(jobKey);
    if (pending) return pending;

    const job = this.persistDiscoveredGift(username, { ...gift, nameKey })
      .catch((error: any) => {
        this.logger.warn(`Failed to learn gift "${gift.name}" for ${username}: ${error.message}`);
      })
      .finally(() => this.discoveryJobs.delete(jobKey));

    this.discoveryJobs.set(jobKey, job);
    return job;
  }

  private normalizeGiftName(name: string): string {
    return String(name || '')
      .normalize('NFKC')
      .trim()
      .toLocaleLowerCase('en-US')
      .replace(/\s+/g, ' ');
  }

  private fallbackGiftId(nameKey: string): number {
    const hash = createHash('sha256').update(nameKey).digest().readUInt32BE(0);
    return -Math.max(1, hash);
  }

  private async persistDiscoveredGift(
    username: string,
    gift: { giftId?: number; name: string; nameKey: string; coins?: number; icon?: string },
  ): Promise<void> {
    const escapedName = gift.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await this.giftModel.findOne({
      username,
      $or: [
        { nameKey: gift.nameKey },
        { name: { $regex: `^${escapedName}$`, $options: 'i' } },
      ],
    }).exec();

    if (existing) {
      const updates: Partial<Gift> = {};
      if (!existing.nameKey) updates.nameKey = gift.nameKey;
      if ((!existing.coins || existing.coins <= 1) && gift.coins) updates.coins = gift.coins;
      if (gift.icon && this.shouldRefreshGiftIcon(existing.icon, gift.icon)) updates.icon = gift.icon;
      if (Object.keys(updates).length) {
        await this.giftModel.updateOne({ _id: existing._id }, { $set: updates }).exec();
        await this.triggerChange(username);
      }
      if (gift.icon) void this.cacheGiftIcon(existing._id.toString(), gift.icon, username);
      await this.rememberDiscoveredGift(gift);
      return;
    }

    const created = await this.giftModel.create({
      username,
      giftId: Number.isInteger(gift.giftId) ? gift.giftId : this.fallbackGiftId(gift.nameKey),
      name: gift.name,
      nameKey: gift.nameKey,
      coins: Math.max(0, Number(gift.coins) || 0),
      icon: gift.icon || '',
      videos: [],
      sounds: [],
      menuShow: false,
    });

    this.logger.log(`Learned new gift for ${username}: ${gift.name}`);
    await this.rememberDiscoveredGift(gift);
    await this.triggerChange(username);
    if (gift.icon) void this.cacheGiftIcon(created._id.toString(), gift.icon, username);
  }

  private getDiscoveredGiftsPath(): string {
    return process.env.DISCOVERED_GIFTS_PATH || join(process.cwd(), 'data', 'gifts', 'discovered_gifts.json');
  }

  private getGiftCatalogKey(name: string, coins?: number): string {
    return `${this.normalizeGiftName(name)}|${Math.max(0, Number(coins) || 0)}`;
  }

  private async loadDiscoveredGifts(): Promise<void> {
    try {
      const contents = await readFile(this.getDiscoveredGiftsPath(), 'utf8');
      const gifts = JSON.parse(contents);
      if (!Array.isArray(gifts)) throw new Error('catalog must be an array');

      const knownKeys = new Set(
        this.defaultGifts.map((gift) => this.getGiftCatalogKey(gift.name, gift.coins)),
      );
      for (const gift of gifts) {
        if (!gift?.name) continue;
        const key = this.getGiftCatalogKey(gift.name, gift.coins);
        this.discoveredGifts.set(key, gift);
        if (!knownKeys.has(key)) {
          this.defaultGifts.push(gift);
          knownKeys.add(key);
        }
      }
      this.logger.log(`Loaded ${this.discoveredGifts.size} persistent discovered gifts`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Could not load discovered gift catalog: ${error.message}`);
      }
    }
  }

  private async rememberDiscoveredGift(gift: {
    giftId?: number;
    name: string;
    nameKey: string;
    coins?: number;
    icon?: string;
  }): Promise<void> {
    const key = this.getGiftCatalogKey(gift.name, gift.coins);
    const isSeedGift = this.defaultGifts.some(
      (item) => this.getGiftCatalogKey(item.name, item.coins) === key && !this.discoveredGifts.has(key),
    );
    if (isSeedGift) return;

    const entry = {
      giftId: Number.isInteger(gift.giftId) ? gift.giftId : this.fallbackGiftId(gift.nameKey),
      name: gift.name,
      coins: Math.max(0, Number(gift.coins) || 0),
      icon: gift.icon || '',
      videos: [],
      activeVideo: '',
    };
    this.discoveredGifts.set(key, entry);
    if (!this.defaultGifts.some((item) => this.getGiftCatalogKey(item.name, item.coins) === key)) {
      this.defaultGifts.push(entry);
    }

    this.discoveredGiftWriteQueue = this.discoveredGiftWriteQueue.then(async () => {
      const filePath = this.getDiscoveredGiftsPath();
      const directory = dirname(filePath);
      const tempPath = `${filePath}.tmp`;
      await mkdir(directory, { recursive: true });
      await writeFile(tempPath, `${JSON.stringify(Array.from(this.discoveredGifts.values()), null, 2)}\n`, 'utf8');
      await rename(tempPath, filePath);
    });
    await this.discoveredGiftWriteQueue;
  }

  private shouldRefreshGiftIcon(currentIcon: string, liveIcon: string): boolean {
    if (!currentIcon) return true;
    if (currentIcon === liveIcon) return false;

    // Preserve uploaded/local icons. Remote seed URLs are refreshable because
    // TikTok CDN links can expire or move between regional hosts.
    if (currentIcon.startsWith('/media/')) return false;
    const publicBaseUrl = (process.env.PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
    if (publicBaseUrl && currentIcon.startsWith(`${publicBaseUrl}/media/`)) return false;

    return /^https?:\/\//i.test(currentIcon);
  }

  private async cacheGiftIcon(giftDocumentId: string, sourceUrl: string, username: string): Promise<void> {
    try {
      const publicBaseUrl = (process.env.PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
      if (!publicBaseUrl || sourceUrl.startsWith(`${publicBaseUrl}/media/gift-cache/`)) return;

      const url = new URL(sourceUrl);
      const allowedHosts = ['tiktokcdn.com', 'tiktokcdn-us.com', 'byteoversea.com', 'ibytedtos.com', 'muscdn.com', 'tiktok.com'];
      if (url.protocol !== 'https:' || !allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
        return;
      }

      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`image request returned ${response.status}`);
      const contentType = response.headers.get('content-type')?.split(';')[0] || '';
      const extensions: Record<string, string> = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/webp': '.webp',
        'image/gif': '.gif',
      };
      const extension = extensions[contentType] || extname(url.pathname).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(extension)) throw new Error('unsupported image type');

      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('image exceeds the 5 MB limit');

      const directory = join(process.cwd(), 'public', 'media', 'gift-cache');
      await mkdir(directory, { recursive: true });
      const filename = `${giftDocumentId}${extension === '.jpeg' ? '.jpg' : extension}`;
      await writeFile(join(directory, filename), bytes);

      const cachedIcon = `${publicBaseUrl}/media/gift-cache/${filename}`;
      await this.giftModel.updateOne({ _id: giftDocumentId }, { $set: { icon: cachedIcon } }).exec();
      await this.triggerChange(username);
    } catch (error: any) {
      this.logger.warn(`Gift image cache skipped for ${giftDocumentId}: ${error.message}`);
    }
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

  // NPC Gifts CRUD
  async findAllNpcGiftsForUser(username: string, category: string): Promise<NpcGift[]> {
    try {
      const count = await this.npcGiftModel.countDocuments({ username, category }).exec();
      if (count === 0) {
        const seedData = this.defaultGifts.map((g: any) => ({
          giftId: g.giftId,
          name: g.name,
          coins: g.coins,
          icon: g.icon,
          videos: g.videos,
          activeVideo: g.activeVideo,
          username,
          category,
        }));
        await this.npcGiftModel.insertMany(seedData);
        this.logger.log(`Seeded default NPC gifts for user ${username} in category ${category}`);
      }
      return this.npcGiftModel.find({ username, category }).sort({ coins: 1 }).exec();
    } catch (err) {
      this.logger.error(`Failed to find NPC gifts for user ${username} in category ${category}:`, err);
      return [];
    }
  }

  async findOneNpcGiftForUser(id: string, username: string, category: string): Promise<NpcGift | null> {
    return this.npcGiftModel.findOne({ _id: id, username, category }).exec();
  }

  async countNpcMenuGiftsForUser(username: string, category: string): Promise<number> {
    return this.npcGiftModel.countDocuments({ username, category, menuShow: true }).exec();
  }

  async createNpcGiftForUser(username: string, category: string, giftData: Partial<NpcGift>): Promise<NpcGift> {
    const newGift = new this.npcGiftModel({
      ...giftData,
      username,
      category,
    });
    const saved = await newGift.save();
    await this.triggerNpcChange(username, category);
    return saved;
  }

  async updateNpcGiftForUser(id: string, username: string, category: string, giftData: Partial<NpcGift>): Promise<NpcGift | null> {
    const updated = await this.npcGiftModel.findOneAndUpdate(
      { _id: id, username, category },
      giftData,
      { new: true }
    ).exec();
    await this.triggerNpcChange(username, category);
    return updated;
  }

  async removeNpcGiftForUser(id: string, username: string, category: string): Promise<any> {
    const deleted = await this.npcGiftModel.findOneAndDelete({ _id: id, username, category }).exec();
    await this.triggerNpcChange(username, category);
    return deleted;
  }
}
