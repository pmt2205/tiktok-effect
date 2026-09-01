"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const settings_schema_1 = require("./schemas/settings.schema");
const npc_category_schema_1 = require("./schemas/npc-category.schema");
let SettingsService = SettingsService_1 = class SettingsService {
    registerCallbacks(callbacks) {
        this.onSettingsUpdateCb = callbacks.onSettingsUpdate;
    }
    constructor(settingsModel, npcCategoryModel) {
        this.settingsModel = settingsModel;
        this.npcCategoryModel = npcCategoryModel;
        this.logger = new common_1.Logger(SettingsService_1.name);
        this.defaultSettings = {
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
            singleEnabled: true,
            npcEnabled: true,
            treeEnabled: false,
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
        };
    }
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
        }
        catch (err) {
            this.logger.error(`Failed to seed NPC categories: ${err.message}`);
        }
    }
    async getSettingsForUser(username) {
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
            let allowedNpcCategories = [];
            try {
                const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
                if (userDoc) {
                    allowNpc = userDoc.allowNpc || false;
                    allowedNpcCategories = userDoc.allowedNpcCategories || [];
                }
            }
            catch (err) {
                this.logger.warn(`Failed to fetch allowNpc: ${err.message}`);
            }
            let fallbackCategory = 'anime';
            try {
                const categories = await this.npcCategoryModel.find().exec();
                if (categories.length > 0) {
                    fallbackCategory = categories[0].name;
                }
            }
            catch (err) {
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
                menuLayout: settingsDoc.menuLayout || 'vertical',
                jarEnabled: settingsDoc.jarEnabled !== undefined ? settingsDoc.jarEnabled : this.defaultSettings.jarEnabled,
                jarX: settingsDoc.jarX !== undefined ? settingsDoc.jarX : this.defaultSettings.jarX,
                jarY: settingsDoc.jarY !== undefined ? settingsDoc.jarY : this.defaultSettings.jarY,
                jarScale: settingsDoc.jarScale !== undefined ? settingsDoc.jarScale : this.defaultSettings.jarScale,
                jarClearedAt: settingsDoc.jarClearedAt !== undefined ? settingsDoc.jarClearedAt : this.defaultSettings.jarClearedAt,
                jarGiftSize: settingsDoc.jarGiftSize !== undefined ? settingsDoc.jarGiftSize : this.defaultSettings.jarGiftSize,
                jarFallSpeed: settingsDoc.jarFallSpeed !== undefined ? settingsDoc.jarFallSpeed : this.defaultSettings.jarFallSpeed,
                jarType: settingsDoc.jarType || this.defaultSettings.jarType,
                jarColor: settingsDoc.jarColor || this.defaultSettings.jarColor,
                liveMode: settingsDoc.liveMode || 'single',
                activeNpcCategory: settingsDoc.activeNpcCategory || fallbackCategory,
                singleEnabled: settingsDoc.singleEnabled !== undefined ? settingsDoc.singleEnabled : true,
                npcEnabled: settingsDoc.npcEnabled !== undefined ? settingsDoc.npcEnabled : true,
                treeEnabled: settingsDoc.treeEnabled !== undefined ? settingsDoc.treeEnabled : this.defaultSettings.treeEnabled,
                treeX: settingsDoc.treeX !== undefined ? settingsDoc.treeX : this.defaultSettings.treeX,
                treeY: settingsDoc.treeY !== undefined ? settingsDoc.treeY : this.defaultSettings.treeY,
                treeScale: settingsDoc.treeScale !== undefined ? settingsDoc.treeScale : this.defaultSettings.treeScale,
                treeGiftSize: settingsDoc.treeGiftSize !== undefined ? settingsDoc.treeGiftSize : this.defaultSettings.treeGiftSize,
                treeClearedAt: settingsDoc.treeClearedAt !== undefined ? settingsDoc.treeClearedAt : this.defaultSettings.treeClearedAt,
                treeDebug: settingsDoc.treeDebug !== undefined ? settingsDoc.treeDebug : this.defaultSettings.treeDebug,
                ttsEnabled: settingsDoc.ttsEnabled !== undefined ? settingsDoc.ttsEnabled : true,
                ttsVoice: settingsDoc.ttsVoice || 'auto',
                ttsRate: settingsDoc.ttsRate !== undefined ? settingsDoc.ttsRate : 1.0,
                ttsPitch: settingsDoc.ttsPitch !== undefined ? settingsDoc.ttsPitch : 1.0,
                ttsVolume: settingsDoc.ttsVolume !== undefined ? settingsDoc.ttsVolume : 1.0,
                ttsTemplate: settingsDoc.ttsTemplate || '{nickname} nói: {comment}',
                ttsMaxChars: settingsDoc.ttsMaxChars !== undefined ? settingsDoc.ttsMaxChars : 100,
                ttsFilterEmoji: settingsDoc.ttsFilterEmoji !== undefined ? settingsDoc.ttsFilterEmoji : true,
                ttsFilterBadWords: settingsDoc.ttsFilterBadWords !== undefined ? settingsDoc.ttsFilterBadWords : true,
                ttsMode: settingsDoc.ttsMode || 'all',
                allowNpc,
                allowedNpcCategories,
            };
        }
        catch (err) {
            this.logger.error(`Failed to get settings for user ${username}:`, err);
            return { ...this.defaultSettings, liveMode: 'single', activeNpcCategory: 'anime', allowNpc: false };
        }
    }
    async updateSettingsForUser(username, newSettings) {
        try {
            const updated = await this.settingsModel.findOneAndUpdate({ username }, { $set: newSettings }, { new: true, upsert: true }).exec();
            this.logger.log(`Settings updated and persisted for user: ${username}`);
            let allowNpc = false;
            let allowedNpcCategories = [];
            try {
                const userDoc = await this.settingsModel.db.model('User').findOne({ username }).exec();
                if (userDoc) {
                    allowNpc = userDoc.allowNpc || false;
                    allowedNpcCategories = userDoc.allowedNpcCategories || [];
                }
            }
            catch (err) {
            }
            let fallbackCategory = 'anime';
            try {
                const categories = await this.npcCategoryModel.find().exec();
                if (categories.length > 0) {
                    fallbackCategory = categories[0].name;
                }
            }
            catch (err) {
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
                menuLayout: updated.menuLayout || 'vertical',
                jarEnabled: updated.jarEnabled,
                jarX: updated.jarX,
                jarY: updated.jarY,
                jarScale: updated.jarScale,
                jarClearedAt: updated.jarClearedAt,
                jarGiftSize: updated.jarGiftSize !== undefined ? updated.jarGiftSize : this.defaultSettings.jarGiftSize,
                jarFallSpeed: updated.jarFallSpeed !== undefined ? updated.jarFallSpeed : this.defaultSettings.jarFallSpeed,
                jarType: updated.jarType || this.defaultSettings.jarType,
                jarColor: updated.jarColor || this.defaultSettings.jarColor,
                liveMode: updated.liveMode || 'single',
                activeNpcCategory: updated.activeNpcCategory || fallbackCategory,
                singleEnabled: updated.singleEnabled !== undefined ? updated.singleEnabled : true,
                npcEnabled: updated.npcEnabled !== undefined ? updated.npcEnabled : true,
                treeEnabled: updated.treeEnabled !== undefined ? updated.treeEnabled : this.defaultSettings.treeEnabled,
                treeX: updated.treeX !== undefined ? updated.treeX : this.defaultSettings.treeX,
                treeY: updated.treeY !== undefined ? updated.treeY : this.defaultSettings.treeY,
                treeScale: updated.treeScale !== undefined ? updated.treeScale : this.defaultSettings.treeScale,
                treeGiftSize: updated.treeGiftSize !== undefined ? updated.treeGiftSize : this.defaultSettings.treeGiftSize,
                treeClearedAt: updated.treeClearedAt !== undefined ? updated.treeClearedAt : this.defaultSettings.treeClearedAt,
                treeDebug: updated.treeDebug !== undefined ? updated.treeDebug : this.defaultSettings.treeDebug,
                ttsEnabled: updated.ttsEnabled !== undefined ? updated.ttsEnabled : true,
                ttsVoice: updated.ttsVoice || 'auto',
                ttsRate: updated.ttsRate !== undefined ? updated.ttsRate : 1.0,
                ttsPitch: updated.ttsPitch !== undefined ? updated.ttsPitch : 1.0,
                ttsVolume: updated.ttsVolume !== undefined ? updated.ttsVolume : 1.0,
                ttsTemplate: updated.ttsTemplate || '{nickname} nói: {comment}',
                ttsMaxChars: updated.ttsMaxChars !== undefined ? updated.ttsMaxChars : 100,
                ttsFilterEmoji: updated.ttsFilterEmoji !== undefined ? updated.ttsFilterEmoji : true,
                ttsFilterBadWords: updated.ttsFilterBadWords !== undefined ? updated.ttsFilterBadWords : true,
                ttsMode: updated.ttsMode || 'all',
                allowNpc,
                allowedNpcCategories,
            };
            this.onSettingsUpdateCb?.(username, result);
            return result;
        }
        catch (err) {
            this.logger.error(`Failed to update settings for user ${username}:`, err);
            throw err;
        }
    }
    async getAllNpcCategories() {
        return this.npcCategoryModel.find().sort({ createdAt: 1 }).exec();
    }
    async createNpcCategory(name, displayName) {
        const cleanName = name.trim().toLowerCase();
        const existing = await this.npcCategoryModel.findOne({ name: cleanName }).exec();
        if (existing) {
            existing.displayName = displayName;
            return existing.save();
        }
        const cat = new this.npcCategoryModel({ name: cleanName, displayName });
        return cat.save();
    }
    async deleteNpcCategory(id) {
        const category = await this.npcCategoryModel.findById(id).exec();
        if (category) {
            const categoryName = category.name;
            await this.npcCategoryModel.findByIdAndDelete(id).exec();
            this.logger.log(`Deleted NPC Category "${categoryName}".`);
        }
        return { success: true };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __param(1, (0, mongoose_1.InjectModel)(npc_category_schema_1.NpcCategory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map