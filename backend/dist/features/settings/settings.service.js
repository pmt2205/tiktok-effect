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
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(settingsModel, mappingModel) {
        this.settingsModel = settingsModel;
        this.mappingModel = mappingModel;
        this.logger = new common_1.Logger(SettingsService_1.name);
        this.defaultSettings = {
            duration: 5,
            density: 2,
            theme: 'neon-pulse',
        };
        this.defaultMappings = {
            rose: { effect: 'video', videoUrl: 'rose.mp4' },
            'hoa hồng': { effect: 'video', videoUrl: 'rose.mp4' },
            galaxy: { effect: 'star' },
            lion: { effect: 'star' },
            tiktok: { effect: 'video', videoUrl: 'tiktok.mp4' },
        };
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
            return {
                duration: settingsDoc.duration,
                density: settingsDoc.density,
                theme: settingsDoc.theme,
            };
        }
        catch (err) {
            this.logger.error(`Failed to get settings for user ${username}:`, err);
            return this.defaultSettings;
        }
    }
    async updateSettingsForUser(username, newSettings) {
        try {
            const updated = await this.settingsModel.findOneAndUpdate({ username }, { $set: newSettings }, { new: true, upsert: true }).exec();
            this.logger.log(`Settings updated and persisted for user: ${username}`);
            return {
                duration: updated.duration,
                density: updated.density,
                theme: updated.theme,
            };
        }
        catch (err) {
            this.logger.error(`Failed to update settings for user ${username}:`, err);
            throw err;
        }
    }
    async getMappingsForUser(username) {
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
            const loadedMappings = {};
            mappingDocs.forEach(doc => {
                loadedMappings[doc.giftName] = {
                    effect: doc.effect,
                    videoUrl: doc.videoUrl,
                };
            });
            return loadedMappings;
        }
        catch (err) {
            this.logger.error(`Failed to get mappings for user ${username}:`, err);
            return this.defaultMappings;
        }
    }
    async updateMappingsForUser(username, newMappings) {
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
        }
        catch (err) {
            this.logger.error(`Failed to update mappings for user ${username}:`, err);
            throw err;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __param(1, (0, mongoose_1.InjectModel)(settings_schema_1.Mapping.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SettingsService);
//# sourceMappingURL=settings.service.js.map