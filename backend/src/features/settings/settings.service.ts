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
    singleGiftIds: [],
    menuEnabled: false,
    menuTitle: 'MENU QUÀ TẶNG',
    menuX: 15,
    menuY: 20,
    menuScale: 1.0,
    menuColumns: 1,
    menuLayout: 'vertical',
    menuFrame: '',
    menuFrameScale: 1.0,
    menuScrollThreshold: 5,
    jarEnabled: false,
    jarX: 75,
    jarY: 50,
    jarScale: 1.0,
    jarClearedAt: 0,
    jarGiftSize: 1.0,
    jarFallSpeed: 1.0,
    jarType: 'standard',
    jarColor: 'silver',
    jarDecorationEnabled: false,
    jarDecoration: 'pro_1',
    jarNameEnabled: false,
    jarNameImage: '',
    jarNameScale: 0.55,
    jarNameX: 0,
    jarNameY: -54,
    jarDanceEnabled: true,
    jarDancePosition: 'left',
    jarDanceScale: 1.0,
    jarDanceOffsetX: 185,
    jarDanceVideo: '/dance/capy_dance.mp4',
    jarEffectEnabled: false,
    jarEffectVideo: '/jar/effect_jar/effect1.mp4',
    jarEffectScale: 1.0,
    jarEffectX: 0,
    jarEffectY: 0,
    jarEffectDelay: 0,
    singleEnabled: true,
    npcEnabled: true,
    videoEnabled: true,
    soundEnabled: true,
    treeEnabled: false,
    treeType: 'standard',
    treeImage: 'tree.png',
    treeX: 20,
    treeY: 50,
    treeScale: 1.0,
    treeGiftSize: 1.0,
    treeClearedAt: 0,
    treeDebug: false,
    ttsEnabled: true,
    ttsVoice: 'auto',
    ttsRate: 1.0,
    ttsPitch: 1.0,
    ttsVolume: 1.0,
    ttsTemplate: '{nickname} nói: {comment}',
    ttsMaxChars: 100,
    ttsFilterEmoji: true,
    ttsFilterBadWords: true,
    ttsMode: 'all',
    topGifterEnabled: true,
    topGifterDuration: 4,
    topGifterRankLimit: 5,
    topGifterMinDiamonds: 1,
    likeLeaderboardEnabled: true,
    likeLeaderboardTitle: 'BXH TAP TAY ❤️',
    likeLeaderboardX: 78,
    likeLeaderboardY: 15,
    likeLeaderboardScale: 1.0,
    likeLeaderboardTopCount: 3,
    likeLeaderboardResetAt: 0,
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
      let subscriptionTier: 'free' | 'pro' | 'promax' = 'free';
      try {
        const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
        if (userDoc) {
          allowNpc = (userDoc as any).allowNpc || false;
          allowedNpcCategories = (userDoc as any).allowedNpcCategories || [];
          subscriptionTier = (userDoc as any).role === 'admin' ? 'promax' : (userDoc as any).subscriptionTier || 'free';
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
        menuFrame: (settingsDoc as any).menuFrame || '',
        menuFrameScale: (settingsDoc as any).menuFrameScale !== undefined ? (settingsDoc as any).menuFrameScale : 1.0,
        menuScrollThreshold: (settingsDoc as any).menuScrollThreshold !== undefined ? (settingsDoc as any).menuScrollThreshold : 5,
        jarEnabled: settingsDoc.jarEnabled !== undefined ? settingsDoc.jarEnabled : this.defaultSettings.jarEnabled,
        jarX: settingsDoc.jarX !== undefined ? settingsDoc.jarX : this.defaultSettings.jarX,
        jarY: settingsDoc.jarY !== undefined ? settingsDoc.jarY : this.defaultSettings.jarY,
        jarScale: settingsDoc.jarScale !== undefined ? settingsDoc.jarScale : this.defaultSettings.jarScale,
        jarClearedAt: settingsDoc.jarClearedAt !== undefined ? settingsDoc.jarClearedAt : this.defaultSettings.jarClearedAt,
        jarGiftSize: (settingsDoc as any).jarGiftSize !== undefined ? (settingsDoc as any).jarGiftSize : this.defaultSettings.jarGiftSize,
        jarFallSpeed: (settingsDoc as any).jarFallSpeed !== undefined ? (settingsDoc as any).jarFallSpeed : this.defaultSettings.jarFallSpeed,
        jarType: 'standard',
        jarColor: (settingsDoc as any).jarColor || this.defaultSettings.jarColor,
        jarDecorationEnabled: subscriptionTier === 'promax' && Boolean((settingsDoc as any).jarDecorationEnabled),
        jarDecoration: subscriptionTier === 'promax' ? ((settingsDoc as any).jarDecoration || this.defaultSettings.jarDecoration) : this.defaultSettings.jarDecoration,
        jarNameEnabled: subscriptionTier === 'promax' && Boolean((settingsDoc as any).jarNameEnabled),
        jarNameImage: subscriptionTier === 'promax' ? ((settingsDoc as any).jarNameImage || '') : '',
        jarNameScale: (settingsDoc as any).jarNameScale !== undefined ? (settingsDoc as any).jarNameScale : 0.55,
        jarNameX: (settingsDoc as any).jarNameX !== undefined ? (settingsDoc as any).jarNameX : 0,
        jarNameY: (settingsDoc as any).jarNameY !== undefined ? (settingsDoc as any).jarNameY : -54,
        jarDanceEnabled: subscriptionTier === 'promax' && ((settingsDoc as any).jarDanceEnabled !== undefined ? (settingsDoc as any).jarDanceEnabled : true),
        jarDancePosition: (settingsDoc as any).jarDancePosition || 'left',
        jarDanceScale: (settingsDoc as any).jarDanceScale !== undefined ? (settingsDoc as any).jarDanceScale : 1.0,
        jarDanceOffsetX: (settingsDoc as any).jarDanceOffsetX !== undefined ? (settingsDoc as any).jarDanceOffsetX : 185,
        jarDanceVideo: (settingsDoc as any).jarDanceVideo || '/dance/capy_dance.mp4',
        jarEffectEnabled: subscriptionTier === 'promax' && Boolean((settingsDoc as any).jarEffectEnabled),
        jarEffectVideo: subscriptionTier === 'promax' ? ((settingsDoc as any).jarEffectVideo || '/jar/effect_jar/effect1.mp4') : '/jar/effect_jar/effect1.mp4',
        jarEffectScale: (settingsDoc as any).jarEffectScale !== undefined ? (settingsDoc as any).jarEffectScale : 1.0,
        jarEffectX: (settingsDoc as any).jarEffectX !== undefined ? (settingsDoc as any).jarEffectX : 0,
        jarEffectY: (settingsDoc as any).jarEffectY !== undefined ? (settingsDoc as any).jarEffectY : 0,
        jarEffectDelay: (settingsDoc as any).jarEffectDelay !== undefined ? (settingsDoc as any).jarEffectDelay : 0,
        liveMode: (settingsDoc as any).liveMode || 'single',
        singleGiftIds: Array.isArray((settingsDoc as any).singleGiftIds) ? (settingsDoc as any).singleGiftIds.slice(0, subscriptionTier === 'promax' ? (settingsDoc as any).singleGiftIds.length : subscriptionTier === 'pro' ? 10 : 5) : [],
        activeNpcCategory: (settingsDoc as any).activeNpcCategory || fallbackCategory,
        singleEnabled: (settingsDoc as any).singleEnabled !== undefined ? (settingsDoc as any).singleEnabled : true,
        npcEnabled: (settingsDoc as any).npcEnabled !== undefined ? (settingsDoc as any).npcEnabled : true,
        videoEnabled: (settingsDoc as any).videoEnabled !== undefined ? (settingsDoc as any).videoEnabled : true,
        soundEnabled: (settingsDoc as any).soundEnabled !== undefined ? (settingsDoc as any).soundEnabled : true,
        treeEnabled: subscriptionTier !== 'free' && (settingsDoc.treeEnabled !== undefined ? settingsDoc.treeEnabled : this.defaultSettings.treeEnabled),
        treeType: subscriptionTier === 'promax' ? ((settingsDoc as any).treeType || 'standard') : 'standard',
        treeImage: subscriptionTier === 'promax' ? ((settingsDoc as any).treeImage || 'tree.png') : 'tree.png',
        treeX: settingsDoc.treeX !== undefined ? settingsDoc.treeX : this.defaultSettings.treeX,
        treeY: settingsDoc.treeY !== undefined ? settingsDoc.treeY : this.defaultSettings.treeY,
        treeScale: settingsDoc.treeScale !== undefined ? settingsDoc.treeScale : this.defaultSettings.treeScale,
        treeGiftSize: settingsDoc.treeGiftSize !== undefined ? settingsDoc.treeGiftSize : this.defaultSettings.treeGiftSize,
        treeClearedAt: settingsDoc.treeClearedAt !== undefined ? settingsDoc.treeClearedAt : this.defaultSettings.treeClearedAt,
        treeDebug: settingsDoc.treeDebug !== undefined ? settingsDoc.treeDebug : this.defaultSettings.treeDebug,
        ttsEnabled: subscriptionTier === 'promax' && ((settingsDoc as any).ttsEnabled !== undefined ? (settingsDoc as any).ttsEnabled : true),
        ttsVoice: (settingsDoc as any).ttsVoice || 'auto',
        ttsRate: (settingsDoc as any).ttsRate !== undefined ? (settingsDoc as any).ttsRate : 1.0,
        ttsPitch: (settingsDoc as any).ttsPitch !== undefined ? (settingsDoc as any).ttsPitch : 1.0,
        ttsVolume: (settingsDoc as any).ttsVolume !== undefined ? (settingsDoc as any).ttsVolume : 1.0,
        ttsTemplate: (settingsDoc as any).ttsTemplate || '{nickname} nói: {comment}',
        ttsMaxChars: (settingsDoc as any).ttsMaxChars !== undefined ? (settingsDoc as any).ttsMaxChars : 100,
        ttsFilterEmoji: (settingsDoc as any).ttsFilterEmoji !== undefined ? (settingsDoc as any).ttsFilterEmoji : true,
        ttsFilterBadWords: (settingsDoc as any).ttsFilterBadWords !== undefined ? (settingsDoc as any).ttsFilterBadWords : true,
        ttsMode: (settingsDoc as any).ttsMode || 'all',
        topGifterEnabled: subscriptionTier === 'promax' && ((settingsDoc as any).topGifterEnabled !== undefined ? (settingsDoc as any).topGifterEnabled : true),
        topGifterDuration: (settingsDoc as any).topGifterDuration !== undefined ? (settingsDoc as any).topGifterDuration : 4,
        topGifterRankLimit: (settingsDoc as any).topGifterRankLimit !== undefined ? (settingsDoc as any).topGifterRankLimit : 5,
        topGifterMinDiamonds: (settingsDoc as any).topGifterMinDiamonds !== undefined ? (settingsDoc as any).topGifterMinDiamonds : 1,
        likeLeaderboardEnabled: subscriptionTier === 'promax' && ((settingsDoc as any).likeLeaderboardEnabled !== undefined ? (settingsDoc as any).likeLeaderboardEnabled : true),
        likeLeaderboardTitle: (settingsDoc as any).likeLeaderboardTitle || 'BXH TAP TAY ❤️',
        likeLeaderboardX: (settingsDoc as any).likeLeaderboardX !== undefined ? (settingsDoc as any).likeLeaderboardX : 78,
        likeLeaderboardY: (settingsDoc as any).likeLeaderboardY !== undefined ? (settingsDoc as any).likeLeaderboardY : 15,
        likeLeaderboardScale: (settingsDoc as any).likeLeaderboardScale !== undefined ? (settingsDoc as any).likeLeaderboardScale : 1.0,
        likeLeaderboardTopCount: (settingsDoc as any).likeLeaderboardTopCount !== undefined ? (settingsDoc as any).likeLeaderboardTopCount : 3,
        likeLeaderboardResetAt: (settingsDoc as any).likeLeaderboardResetAt !== undefined ? (settingsDoc as any).likeLeaderboardResetAt : 0,
        allowNpc,
        allowedNpcCategories,
        subscriptionTier,
      };
    } catch (err) {
      this.logger.error(`Failed to get settings for user ${username}:`, err);
      return { ...this.defaultSettings, liveMode: 'single', activeNpcCategory: 'anime', allowNpc: false };
    }
  }

  async updateSettingsForUser(username: string, newSettings: Record<string, unknown>): Promise<any> {
    try {
      const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
      const tier = ((userDoc as any)?.role === 'admin' ? 'promax' : (userDoc as any)?.subscriptionTier || 'free') as 'free' | 'pro' | 'promax';
      const giftLimit = tier === 'promax' ? Infinity : tier === 'pro' ? 10 : 5;
      const allowedKeys = new Set(Object.keys(this.settingsModel.schema.paths).filter((key) => !['_id', '__v', 'username'].includes(key)));
      const safeSettings = Object.fromEntries(
        Object.entries(newSettings).filter(([key, value]) => {
          if (!allowedKeys.has(key) || value === undefined) return false;
          if (key === 'singleGiftIds') return Array.isArray(value);
          return typeof value !== 'object';
        }),
      );
      if (Array.isArray(safeSettings.singleGiftIds)) {
        safeSettings.singleGiftIds = [...new Set(safeSettings.singleGiftIds
          .filter((giftId): giftId is number => Number.isInteger(giftId)))]
          .slice(0, giftLimit);
      }
      const jarNameImages = new Set([
        '/jar/name_jar/teddy.png',
        '/jar/name_jar/cute.png',
        '/jar/name_jar/moon.png',
      ]);
      const jarDecorations = new Set(['pro_1', 'pro_2', 'pro_3', 'pro_4']);
      safeSettings.jarType = 'standard';
      if (typeof safeSettings.jarDecoration === 'string' && !jarDecorations.has(safeSettings.jarDecoration)) delete safeSettings.jarDecoration;
      if (tier !== 'promax') {
        delete safeSettings.jarDecorationEnabled;
        delete safeSettings.jarDecoration;
      }
      if (typeof safeSettings.jarNameImage === 'string' && !jarNameImages.has(safeSettings.jarNameImage)) delete safeSettings.jarNameImage;
      if (typeof safeSettings.jarNameScale === 'number') safeSettings.jarNameScale = Math.min(1.5, Math.max(0.2, safeSettings.jarNameScale));
      if (typeof safeSettings.jarNameX === 'number') safeSettings.jarNameX = Math.min(220, Math.max(-220, safeSettings.jarNameX));
      if (typeof safeSettings.jarNameY === 'number') safeSettings.jarNameY = Math.min(160, Math.max(-180, safeSettings.jarNameY));
      const jarEffectVideos = new Set(['/jar/effect_jar/effect1.mp4', '/jar/effect_jar/effect2.mp4']);
      if (typeof safeSettings.jarEffectVideo === 'string' && !jarEffectVideos.has(safeSettings.jarEffectVideo)) delete safeSettings.jarEffectVideo;
      if (typeof safeSettings.jarEffectScale === 'number') safeSettings.jarEffectScale = Math.min(2, Math.max(0.1, safeSettings.jarEffectScale));
      if (typeof safeSettings.jarEffectX === 'number') safeSettings.jarEffectX = Math.min(300, Math.max(-300, safeSettings.jarEffectX));
      if (typeof safeSettings.jarEffectY === 'number') safeSettings.jarEffectY = Math.min(300, Math.max(-300, safeSettings.jarEffectY));
      if (typeof safeSettings.jarEffectDelay === 'number') safeSettings.jarEffectDelay = Math.min(60, Math.max(0, safeSettings.jarEffectDelay));
      if (tier !== 'promax') {
        const proMaxOnlyKeys = ['ttsEnabled', 'ttsVoice', 'ttsRate', 'ttsPitch', 'ttsVolume', 'ttsTemplate', 'ttsMaxChars', 'ttsFilterEmoji', 'ttsFilterBadWords', 'ttsMode', 'topGifterEnabled', 'topGifterDuration', 'topGifterRankLimit', 'topGifterMinDiamonds', 'likeLeaderboardEnabled', 'likeLeaderboardTitle', 'likeLeaderboardX', 'likeLeaderboardY', 'likeLeaderboardScale', 'likeLeaderboardTopCount', 'likeLeaderboardResetAt'];
        proMaxOnlyKeys.forEach((key) => delete safeSettings[key]);
        if (tier === 'free' && safeSettings.jarType && safeSettings.jarType !== 'standard') delete safeSettings.jarType;
        if (safeSettings.treeType && safeSettings.treeType !== 'standard') {
          delete safeSettings.treeType;
          delete safeSettings.treeImage;
        }
        delete safeSettings.jarDanceEnabled;
        delete safeSettings.jarDancePosition;
        delete safeSettings.jarDanceScale;
        delete safeSettings.jarDanceOffsetX;
        delete safeSettings.jarDanceVideo;
        delete safeSettings.jarNameEnabled;
        delete safeSettings.jarNameImage;
        delete safeSettings.jarNameScale;
        delete safeSettings.jarNameX;
        delete safeSettings.jarNameY;
        delete safeSettings.jarEffectEnabled;
        delete safeSettings.jarEffectVideo;
        delete safeSettings.jarEffectScale;
        delete safeSettings.jarEffectX;
        delete safeSettings.jarEffectY;
        delete safeSettings.jarEffectDelay;
        if (tier === 'free') {
          delete safeSettings.treeEnabled;
          delete safeSettings.treeType;
          delete safeSettings.treeImage;
          delete safeSettings.treeX;
          delete safeSettings.treeY;
          delete safeSettings.treeScale;
          delete safeSettings.treeGiftSize;
          delete safeSettings.treeClearedAt;
          delete safeSettings.treeDebug;
        }
      }
      const updated = await this.settingsModel.findOneAndUpdate(
        { username },
        { $set: safeSettings },
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
        menuFrame: (updated as any).menuFrame || '',
        menuFrameScale: (updated as any).menuFrameScale !== undefined ? (updated as any).menuFrameScale : 1.0,
        menuScrollThreshold: (updated as any).menuScrollThreshold !== undefined ? (updated as any).menuScrollThreshold : 5,
        jarEnabled: updated.jarEnabled,
        jarX: updated.jarX,
        jarY: updated.jarY,
        jarScale: updated.jarScale,
        jarClearedAt: updated.jarClearedAt,
        jarGiftSize: (updated as any).jarGiftSize !== undefined ? (updated as any).jarGiftSize : this.defaultSettings.jarGiftSize,
        jarFallSpeed: (updated as any).jarFallSpeed !== undefined ? (updated as any).jarFallSpeed : this.defaultSettings.jarFallSpeed,
        jarType: 'standard',
        jarColor: (updated as any).jarColor || this.defaultSettings.jarColor,
        jarDecorationEnabled: tier === 'promax' && Boolean((updated as any).jarDecorationEnabled),
        jarDecoration: tier === 'promax' ? ((updated as any).jarDecoration || this.defaultSettings.jarDecoration) : this.defaultSettings.jarDecoration,
        jarNameEnabled: tier === 'promax' && Boolean((updated as any).jarNameEnabled),
        jarNameImage: tier === 'promax' ? ((updated as any).jarNameImage || '') : '',
        jarNameScale: (updated as any).jarNameScale !== undefined ? (updated as any).jarNameScale : 0.55,
        jarNameX: (updated as any).jarNameX !== undefined ? (updated as any).jarNameX : 0,
        jarNameY: (updated as any).jarNameY !== undefined ? (updated as any).jarNameY : -54,
        jarDanceEnabled: tier === 'promax' && ((updated as any).jarDanceEnabled !== undefined ? (updated as any).jarDanceEnabled : true),
        jarDancePosition: (updated as any).jarDancePosition || 'left',
        jarDanceScale: (updated as any).jarDanceScale !== undefined ? (updated as any).jarDanceScale : 1.0,
        jarDanceOffsetX: (updated as any).jarDanceOffsetX !== undefined ? (updated as any).jarDanceOffsetX : 185,
        jarDanceVideo: (updated as any).jarDanceVideo || '/dance/capy_dance.mp4',
        jarEffectEnabled: tier === 'promax' && Boolean((updated as any).jarEffectEnabled),
        jarEffectVideo: tier === 'promax' ? ((updated as any).jarEffectVideo || '/jar/effect_jar/effect1.mp4') : '/jar/effect_jar/effect1.mp4',
        jarEffectScale: (updated as any).jarEffectScale !== undefined ? (updated as any).jarEffectScale : 1.0,
        jarEffectX: (updated as any).jarEffectX !== undefined ? (updated as any).jarEffectX : 0,
        jarEffectY: (updated as any).jarEffectY !== undefined ? (updated as any).jarEffectY : 0,
        jarEffectDelay: (updated as any).jarEffectDelay !== undefined ? (updated as any).jarEffectDelay : 0,
        liveMode: (updated as any).liveMode || 'single',
        singleGiftIds: Array.isArray((updated as any).singleGiftIds) ? (updated as any).singleGiftIds.slice(0, giftLimit) : [],
        activeNpcCategory: (updated as any).activeNpcCategory || fallbackCategory,
        singleEnabled: (updated as any).singleEnabled !== undefined ? (updated as any).singleEnabled : true,
        npcEnabled: (updated as any).npcEnabled !== undefined ? (updated as any).npcEnabled : true,
        videoEnabled: (updated as any).videoEnabled !== undefined ? (updated as any).videoEnabled : true,
        soundEnabled: (updated as any).soundEnabled !== undefined ? (updated as any).soundEnabled : true,
        treeEnabled: tier !== 'free' && (updated.treeEnabled !== undefined ? updated.treeEnabled : this.defaultSettings.treeEnabled),
        treeType: tier === 'promax' ? ((updated as any).treeType || 'standard') : 'standard',
        treeImage: tier === 'promax' ? ((updated as any).treeImage || 'tree.png') : 'tree.png',
        treeX: updated.treeX !== undefined ? updated.treeX : this.defaultSettings.treeX,
        treeY: updated.treeY !== undefined ? updated.treeY : this.defaultSettings.treeY,
        treeScale: updated.treeScale !== undefined ? updated.treeScale : this.defaultSettings.treeScale,
        treeGiftSize: updated.treeGiftSize !== undefined ? updated.treeGiftSize : this.defaultSettings.treeGiftSize,
        treeClearedAt: updated.treeClearedAt !== undefined ? updated.treeClearedAt : this.defaultSettings.treeClearedAt,
        treeDebug: updated.treeDebug !== undefined ? updated.treeDebug : this.defaultSettings.treeDebug,
        ttsEnabled: tier === 'promax' && ((updated as any).ttsEnabled !== undefined ? (updated as any).ttsEnabled : true),
        ttsVoice: (updated as any).ttsVoice || 'auto',
        ttsRate: (updated as any).ttsRate !== undefined ? (updated as any).ttsRate : 1.0,
        ttsPitch: (updated as any).ttsPitch !== undefined ? (updated as any).ttsPitch : 1.0,
        ttsVolume: (updated as any).ttsVolume !== undefined ? (updated as any).ttsVolume : 1.0,
        ttsTemplate: (updated as any).ttsTemplate || '{nickname} nói: {comment}',
        ttsMaxChars: (updated as any).ttsMaxChars !== undefined ? (updated as any).ttsMaxChars : 100,
        ttsFilterEmoji: (updated as any).ttsFilterEmoji !== undefined ? (updated as any).ttsFilterEmoji : true,
        ttsFilterBadWords: (updated as any).ttsFilterBadWords !== undefined ? (updated as any).ttsFilterBadWords : true,
        ttsMode: (updated as any).ttsMode || 'all',
        topGifterEnabled: tier === 'promax' && ((updated as any).topGifterEnabled !== undefined ? (updated as any).topGifterEnabled : true),
        topGifterDuration: (updated as any).topGifterDuration !== undefined ? (updated as any).topGifterDuration : 4,
        topGifterRankLimit: (updated as any).topGifterRankLimit !== undefined ? (updated as any).topGifterRankLimit : 5,
        topGifterMinDiamonds: (updated as any).topGifterMinDiamonds !== undefined ? (updated as any).topGifterMinDiamonds : 1,
        likeLeaderboardEnabled: tier === 'promax' && ((updated as any).likeLeaderboardEnabled !== undefined ? (updated as any).likeLeaderboardEnabled : true),
        likeLeaderboardTitle: (updated as any).likeLeaderboardTitle || 'BXH TAP TAY ❤️',
        likeLeaderboardX: (updated as any).likeLeaderboardX !== undefined ? (updated as any).likeLeaderboardX : 78,
        likeLeaderboardY: (updated as any).likeLeaderboardY !== undefined ? (updated as any).likeLeaderboardY : 15,
        likeLeaderboardScale: (updated as any).likeLeaderboardScale !== undefined ? (updated as any).likeLeaderboardScale : 1.0,
        likeLeaderboardTopCount: (updated as any).likeLeaderboardTopCount !== undefined ? (updated as any).likeLeaderboardTopCount : 3,
        likeLeaderboardResetAt: (updated as any).likeLeaderboardResetAt !== undefined ? (updated as any).likeLeaderboardResetAt : 0,
        allowNpc,
        allowedNpcCategories,
        subscriptionTier: tier,
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
