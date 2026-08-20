import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OverlaySettings, GiftMappings } from '../../common/interfaces/events.interface';
import { Settings, Mapping } from './schemas/settings.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  private settings: OverlaySettings = {
    duration: 5,
    density: 2,
    theme: 'neon-pulse',
  };

  private mappings: GiftMappings = {
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

  async onModuleInit() {
    try {
      // 1. Load or seed settings
      let settingsDoc = await this.settingsModel.findOne().exec();
      if (!settingsDoc) {
        settingsDoc = await this.settingsModel.create(this.settings);
        this.logger.log('Seeded default settings in MongoDB');
      } else {
        this.settings = {
          duration: settingsDoc.duration,
          density: settingsDoc.density,
          theme: settingsDoc.theme,
        };
        this.logger.log('Loaded settings from MongoDB');
      }

      // 2. Load or seed mappings
      const mappingDocs = await this.mappingModel.find().exec();
      if (mappingDocs.length === 0) {
        const seedData = Object.entries(this.mappings).map(([giftName, val]) => ({
          giftName,
          effect: val.effect,
          videoUrl: val.videoUrl,
        }));
        await this.mappingModel.insertMany(seedData);
        this.logger.log('Seeded default gift mappings in MongoDB');
      } else {
        const loadedMappings: GiftMappings = {};
        mappingDocs.forEach(doc => {
          loadedMappings[doc.giftName] = {
            effect: doc.effect,
            videoUrl: doc.videoUrl,
          };
        });
        this.mappings = loadedMappings;
        this.logger.log(`Loaded ${mappingDocs.length} gift mappings from MongoDB`);
      }
    } catch (err) {
      this.logger.error('Failed to initialize settings/mappings from MongoDB:', err);
    }
  }

  getSettings(): OverlaySettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<OverlaySettings>): OverlaySettings {
    this.settings = { ...this.settings, ...newSettings };
    this.settingsModel.updateOne({}, this.settings, { upsert: true }).exec()
      .then(() => this.logger.log('Settings persisted to MongoDB'))
      .catch(err => this.logger.error('Failed to persist settings to MongoDB:', err));
    return this.settings;
  }

  getMappings(): GiftMappings {
    return { ...this.mappings };
  }

  updateMappings(newMappings: GiftMappings): GiftMappings {
    this.mappings = { ...newMappings };
    
    // Perform async MongoDB persistence in background
    this.persistMappings(newMappings);
    
    return this.mappings;
  }

  private async persistMappings(newMappings: GiftMappings) {
    try {
      // Clear all and re-insert to sync the state
      await this.mappingModel.deleteMany({});
      const seedData = Object.entries(newMappings).map(([giftName, val]) => ({
        giftName,
        effect: val.effect,
        videoUrl: val.videoUrl,
      }));
      await this.mappingModel.insertMany(seedData);
      this.logger.log('Mappings persisted to MongoDB');
    } catch (err) {
      this.logger.error('Failed to persist mappings to MongoDB:', err);
    }
  }
}
