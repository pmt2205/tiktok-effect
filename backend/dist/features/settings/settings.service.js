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
        this.settings = {
            soundEnabled: true,
            duration: 5,
            density: 2,
            theme: 'neon-pulse',
        };
        this.mappings = {
            rose: { effect: 'video', sound: 'rose', videoUrl: 'rose.mp4' },
            'hoa hồng': { effect: 'video', sound: 'rose', videoUrl: 'rose.mp4' },
            galaxy: { effect: 'star', sound: 'galaxy' },
            lion: { effect: 'star', sound: 'galaxy' },
            tiktok: { effect: 'video', sound: 'tiktok', videoUrl: 'tiktok.mp4' },
        };
    }
    async onModuleInit() {
        try {
            let settingsDoc = await this.settingsModel.findOne().exec();
            if (!settingsDoc) {
                settingsDoc = await this.settingsModel.create(this.settings);
                this.logger.log('Seeded default settings in MongoDB');
            }
            else {
                this.settings = {
                    soundEnabled: settingsDoc.soundEnabled,
                    duration: settingsDoc.duration,
                    density: settingsDoc.density,
                    theme: settingsDoc.theme,
                };
                this.logger.log('Loaded settings from MongoDB');
            }
            const mappingDocs = await this.mappingModel.find().exec();
            if (mappingDocs.length === 0) {
                const seedData = Object.entries(this.mappings).map(([giftName, val]) => ({
                    giftName,
                    effect: val.effect,
                    sound: val.sound,
                    videoUrl: val.videoUrl,
                }));
                await this.mappingModel.insertMany(seedData);
                this.logger.log('Seeded default gift mappings in MongoDB');
            }
            else {
                const loadedMappings = {};
                mappingDocs.forEach(doc => {
                    loadedMappings[doc.giftName] = {
                        effect: doc.effect,
                        sound: doc.sound,
                        videoUrl: doc.videoUrl,
                    };
                });
                this.mappings = loadedMappings;
                this.logger.log(`Loaded ${mappingDocs.length} gift mappings from MongoDB`);
            }
        }
        catch (err) {
            this.logger.error('Failed to initialize settings/mappings from MongoDB:', err);
        }
    }
    getSettings() {
        return { ...this.settings };
    }
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.settingsModel.updateOne({}, this.settings, { upsert: true }).exec()
            .then(() => this.logger.log('Settings persisted to MongoDB'))
            .catch(err => this.logger.error('Failed to persist settings to MongoDB:', err));
        return this.settings;
    }
    getMappings() {
        return { ...this.mappings };
    }
    updateMappings(newMappings) {
        this.mappings = { ...newMappings };
        this.persistMappings(newMappings);
        return this.mappings;
    }
    async persistMappings(newMappings) {
        try {
            await this.mappingModel.deleteMany({});
            const seedData = Object.entries(newMappings).map(([giftName, val]) => ({
                giftName,
                effect: val.effect,
                sound: val.sound,
                videoUrl: val.videoUrl,
            }));
            await this.mappingModel.insertMany(seedData);
            this.logger.log('Mappings persisted to MongoDB');
        }
        catch (err) {
            this.logger.error('Failed to persist mappings to MongoDB:', err);
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