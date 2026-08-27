import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OverlaySettings } from '../../common/interfaces/events.interface';
import { Settings } from './schemas/settings.schema';
import { NpcCategory } from './schemas/npc-category.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  private readonly defaultSettings: OverlaySettings = {
    duration: 5,
    density: 2,
    theme: 'neon-pulse',
    menuEnabled: false,
    menuTitle: 'MENU QUÀ TẶNG',
    menuX: 15,
    menuY: 20,
    menuScale: 1.0,
    menuColumns: 1,
    menuLayout: 'vertical',
    jarEnabled: false,
    jarX: 75,
    jarY: 50,
    jarScale: 1.0,
    jarClearedAt: 0,
    jarGiftSize: 1.0,
    jarFallSpeed: 1.0,
    jarType: 'standard',
    jarColor: 'silver',
  };

  private onSettingsUpdateCb?: (username: string, settings: any) => void;

  registerCallbacks(callbacks: {
    onSettingsUpdate: (username: string, settings: any) => void;
  }) {
    this.onSettingsUpdateCb = callbacks.onSettingsUpdate;
  }

  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
    @InjectModel(NpcCategory.name) private readonly npcCategoryModel: Model<NpcCategory>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.npcCategoryModel.countDocuments().exec();
      if (count === 0) {
        const defaults = [
          { name: 'anime', displayName: '🌸 Anime / Manga' },
          { name: 'horror', displayName: '💀 Horror / Jumpscare' },
          { name: 'cute', displayName: '🐱 Cute / Thú cưng' },
          { name: 'meme', displayName: '🤡 Meme / Hài hước' },
          { name: 'gaming', displayName: '🎮 Retro / Gaming' },
        ];
        await this.npcCategoryModel.insertMany(defaults);
        this.logger.log('Seeded default NPC categories.');
      }
    } catch (err: any) {
      this.logger.error(`Failed to seed NPC categories: ${err.message}`);
    }
  }

  async getSettingsForUser(username: string): Promise<any> {
    try {
      let settingsDoc = await this.settingsModel.findOne({ username }).exec();
      if (!settingsDoc) {
        settingsDoc = await this.settingsModel.create({
          username,
          ...this.defaultSettings,
        });
        this.logger.log(`Seeded default settings for user: ${username}`);
      }
      
      let allowNpc = false;
      let allowedNpcCategories: string[] = [];
      try {
        const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
        if (userDoc) {
          allowNpc = (userDoc as any).allowNpc || false;
          allowedNpcCategories = (userDoc as any).allowedNpcCategories || [];
        }
      } catch (err) {
        this.logger.warn(`Failed to fetch allowNpc: ${err.message}`);
      }

      let fallbackCategory = 'anime';
      try {
        const categories = await this.npcCategoryModel.find().exec();
        if (categories.length > 0) {
          fallbackCategory = categories[0].name;
        }
      } catch (err) {
        // ignore
      }

      return {
        duration: settingsDoc.duration,
        density: settingsDoc.density,
        theme: settingsDoc.theme,
        menuEnabled: settingsDoc.menuEnabled !== undefined ? settingsDoc.menuEnabled : this.defaultSettings.menuEnabled,
        menuTitle: settingsDoc.menuTitle || this.defaultSettings.menuTitle,
        menuX: settingsDoc.menuX !== undefined ? settingsDoc.menuX : this.defaultSettings.menuX,
        menuY: settingsDoc.menuY !== undefined ? settingsDoc.menuY : this.defaultSettings.menuY,
        menuScale: settingsDoc.menuScale !== undefined ? settingsDoc.menuScale : this.defaultSettings.menuScale,
        menuColumns: settingsDoc.menuColumns !== undefined ? settingsDoc.menuColumns : this.defaultSettings.menuColumns,
        menuLayout: (settingsDoc as any).menuLayout || 'vertical',
        jarEnabled: settingsDoc.jarEnabled !== undefined ? settingsDoc.jarEnabled : this.defaultSettings.jarEnabled,
        jarX: settingsDoc.jarX !== undefined ? settingsDoc.jarX : this.defaultSettings.jarX,
        jarY: settingsDoc.jarY !== undefined ? settingsDoc.jarY : this.defaultSettings.jarY,
        jarScale: settingsDoc.jarScale !== undefined ? settingsDoc.jarScale : this.defaultSettings.jarScale,
        jarClearedAt: settingsDoc.jarClearedAt !== undefined ? settingsDoc.jarClearedAt : this.defaultSettings.jarClearedAt,
        jarGiftSize: (settingsDoc as any).jarGiftSize !== undefined ? (settingsDoc as any).jarGiftSize : this.defaultSettings.jarGiftSize,
        jarFallSpeed: (settingsDoc as any).jarFallSpeed !== undefined ? (settingsDoc as any).jarFallSpeed : this.defaultSettings.jarFallSpeed,
        jarType: (settingsDoc as any).jarType || this.defaultSettings.jarType,
        jarColor: (settingsDoc as any).jarColor || this.defaultSettings.jarColor,
        liveMode: (settingsDoc as any).liveMode || 'single',
        activeNpcCategory: (settingsDoc as any).activeNpcCategory || fallbackCategory,
        allowNpc,
        allowedNpcCategories,
      };
    } catch (err) {
      this.logger.error(`Failed to get settings for user ${username}:`, err);
      return { ...this.defaultSettings, liveMode: 'single', activeNpcCategory: 'anime', allowNpc: false };
    }
  }

  async updateSettingsForUser(username: string, newSettings: Partial<any>): Promise<any> {
    try {
      const updated = await this.settingsModel.findOneAndUpdate(
        { username },
        { $set: newSettings },
        { new: true, upsert: true }
      ).exec();
      this.logger.log(`Settings updated and persisted for user: ${username}`);

      let allowNpc = false;
      let allowedNpcCategories: string[] = [];
      try {
        const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
        if (userDoc) {
          allowNpc = (userDoc as any).allowNpc || false;
          allowedNpcCategories = (userDoc as any).allowedNpcCategories || [];
        }
      } catch (err) {
        // ignore
      }

      let fallbackCategory = 'anime';
      try {
        const categories = await this.npcCategoryModel.find().exec();
        if (categories.length > 0) {
          fallbackCategory = categories[0].name;
        }
      } catch (err) {
        // ignore
      }

      const result = {
        duration: updated.duration,
        density: updated.density,
        theme: updated.theme,
        menuEnabled: updated.menuEnabled,
        menuTitle: updated.menuTitle,
        menuX: updated.menuX,
        menuY: updated.menuY,
        menuScale: updated.menuScale,
        menuColumns: updated.menuColumns,
        menuLayout: (updated as any).menuLayout || 'vertical',
        jarEnabled: updated.jarEnabled,
        jarX: updated.jarX,
        jarY: updated.jarY,
        jarScale: updated.jarScale,
        jarClearedAt: updated.jarClearedAt,
        jarGiftSize: (updated as any).jarGiftSize !== undefined ? (updated as any).jarGiftSize : this.defaultSettings.jarGiftSize,
        jarFallSpeed: (updated as any).jarFallSpeed !== undefined ? (updated as any).jarFallSpeed : this.defaultSettings.jarFallSpeed,
        jarType: (updated as any).jarType || this.defaultSettings.jarType,
        jarColor: (updated as any).jarColor || this.defaultSettings.jarColor,
        liveMode: (updated as any).liveMode || 'single',
        activeNpcCategory: (updated as any).activeNpcCategory || fallbackCategory,
        allowNpc,
        allowedNpcCategories,
      };
      
      this.onSettingsUpdateCb?.(username, result);
      return result;
    } catch (err) {
      this.logger.error(`Failed to update settings for user ${username}:`, err);
      throw err;
    }
  }

  // NPC Categories CRUD
  async getAllNpcCategories(): Promise<NpcCategory[]> {
    return this.npcCategoryModel.find().sort({ createdAt: 1 }).exec();
  }

  async createNpcCategory(name: string, displayName: string): Promise<NpcCategory> {
    const cleanName = name.trim().toLowerCase();
    const existing = await this.npcCategoryModel.findOne({ name: cleanName }).exec();
    if (existing) {
      existing.displayName = displayName;
      return existing.save();
    }
    const cat = new this.npcCategoryModel({ name: cleanName, displayName });
    return cat.save();
  }

  async deleteNpcCategory(id: string): Promise<any> {
    const category = await this.npcCategoryModel.findById(id).exec();
    if (category) {
      const categoryName = category.name;
      // Delete the category
      await this.npcCategoryModel.findByIdAndDelete(id).exec();
      this.logger.log(`Deleted NPC Category "${categoryName}".`);
    }
    return { success: true };
  }
}
