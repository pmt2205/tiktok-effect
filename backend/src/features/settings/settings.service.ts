import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { Settings, Mapping } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  private readonly defaultSettings: OverlaySettings = {
    duration: 5,
    density: 2,
    theme: 'neon-pulse',
  };

  private readonly defaultMappings: GiftMappings = {
    rose: { effect: 'video', videoUrl: 'rose.mp4' },
    'hoa hồng': { effect: 'video', videoUrl: 'rose.mp4' },
    galaxy: { effect: 'star' },
    lion: { effect: 'star' },
    tiktok: { effect: 'video', videoUrl: 'tiktok.mp4' },
  };

  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
    @InjectModel(Mapping.name) private readonly mappingModel: Model<Mapping>,
  ) {}

  async getSettingsForUser(username: string): Promise<OverlaySettings> {
    try {
      let settingsDoc = await this.settingsModel.findOne({ username }).exec();
      if (!settingsDoc) {
        settingsDoc = await this.settingsModel.create({
          username,
          ...this.defaultSettings,
        });
        this.logger.log(`Seeded default settings for user: ${username}`);
      }
      return {
        duration: settingsDoc.duration,
        density: settingsDoc.density,
        theme: settingsDoc.theme,
      };
    } catch (err) {
      this.logger.error(`Failed to get settings for user ${username}:`, err);
      return this.defaultSettings;
    }
  }

  async updateSettingsForUser(username: string, newSettings: Partial<OverlaySettings>): Promise<OverlaySettings> {
    try {
      const updated = await this.settingsModel.findOneAndUpdate(
        { username },
        { $set: newSettings },
        { new: true, upsert: true }
      ).exec();
      this.logger.log(`Settings updated and persisted for user: ${username}`);
      return {
        duration: updated.duration,
        density: updated.density,
        theme: updated.theme,
      };
    } catch (err) {
      this.logger.error(`Failed to update settings for user ${username}:`, err);
      throw err;
    }
  }

  async getMappingsForUser(username: string): Promise<GiftMappings> {
    try {
      const mappingDocs = await this.mappingModel.find({ username }).exec();
      if (mappingDocs.length === 0) {
        const seedData = Object.entries(this.defaultMappings).map(([giftName, val]) => ({
          username,
          giftName,
          effect: val.effect,
          videoUrl: val.videoUrl,
        }));
        await this.mappingModel.insertMany(seedData);
        this.logger.log(`Seeded default mappings for user: ${username}`);
        return { ...this.defaultMappings };
      }

      const loadedMappings: GiftMappings = {};
      mappingDocs.forEach(doc => {
        loadedMappings[doc.giftName] = {
          effect: doc.effect,
          videoUrl: doc.videoUrl,
        };
      });
      return loadedMappings;
    } catch (err) {
      this.logger.error(`Failed to get mappings for user ${username}:`, err);
      return this.defaultMappings;
    }
  }

  async updateMappingsForUser(username: string, newMappings: GiftMappings): Promise<GiftMappings> {
    try {
      await this.mappingModel.deleteMany({ username }).exec();
      const insertData = Object.entries(newMappings).map(([giftName, val]) => ({
        username,
        giftName,
        effect: val.effect,
        videoUrl: val.videoUrl,
      }));
      if (insertData.length > 0) {
        await this.mappingModel.insertMany(insertData);
      }
      this.logger.log(`Mappings updated and persisted for user: ${username}`);
      return newMappings;
    } catch (err) {
      this.logger.error(`Failed to update mappings for user ${username}:`, err);
      throw err;
    }
  }
}

