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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSchema = exports.Settings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Settings = class Settings extends mongoose_2.Document {
};
exports.Settings = Settings;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Settings.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 5 }),
    __metadata("design:type", Number)
], Settings.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 2 }),
    __metadata("design:type", Number)
], Settings.prototype, "density", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'neon-pulse' }),
    __metadata("design:type", String)
], Settings.prototype, "theme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'single' }),
    __metadata("design:type", String)
], Settings.prototype, "liveMode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'anime' }),
    __metadata("design:type", String)
], Settings.prototype, "activeNpcCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "menuEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'MENU QUÀ TẶNG' }),
    __metadata("design:type", String)
], Settings.prototype, "menuTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 15 }),
    __metadata("design:type", Number)
], Settings.prototype, "menuX", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 20 }),
    __metadata("design:type", Number)
], Settings.prototype, "menuY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1.0 }),
    __metadata("design:type", Number)
], Settings.prototype, "menuScale", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Settings.prototype, "menuColumns", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'vertical' }),
    __metadata("design:type", String)
], Settings.prototype, "menuLayout", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Settings.prototype, "jarEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 75 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarX", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 50 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1.0 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarScale", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarClearedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1.0 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarGiftSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1.0 }),
    __metadata("design:type", Number)
], Settings.prototype, "jarFallSpeed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'standard' }),
    __metadata("design:type", String)
], Settings.prototype, "jarType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'silver' }),
    __metadata("design:type", String)
], Settings.prototype, "jarColor", void 0);
exports.Settings = Settings = __decorate([
    (0, mongoose_1.Schema)()
], Settings);
exports.SettingsSchema = mongoose_1.SchemaFactory.createForClass(Settings);
//# sourceMappingURL=settings.schema.js.map