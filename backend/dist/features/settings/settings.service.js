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
                liveMode: settingsDoc.liveMode || 'single',
                activeNpcCategory: settingsDoc.activeNpcCategory || fallbackCategory,
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
                liveMode: updated.liveMode || 'single',
                activeNpcCategory: updated.activeNpcCategory || fallbackCategory,
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