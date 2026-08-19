"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor() {
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
    getSettings() {
        return { ...this.settings };
    }
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.logger.log('Settings updated');
        return this.settings;
    }
    getMappings() {
        return { ...this.mappings };
    }
    updateMappings(newMappings) {
        this.mappings = { ...newMappings };
        this.logger.log('Mappings updated');
        return this.mappings;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map