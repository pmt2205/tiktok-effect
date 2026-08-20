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
exports.MappingSchema = exports.Mapping = exports.SettingsSchema = exports.Settings = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Settings = class Settings extends mongoose_2.Document {
};
exports.Settings = Settings;
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
exports.Settings = Settings = __decorate([
    (0, mongoose_1.Schema)()
], Settings);
exports.SettingsSchema = mongoose_1.SchemaFactory.createForClass(Settings);
let Mapping = class Mapping extends mongoose_2.Document {
};
exports.Mapping = Mapping;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Mapping.prototype, "giftName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Mapping.prototype, "effect", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Mapping.prototype, "videoUrl", void 0);
exports.Mapping = Mapping = __decorate([
    (0, mongoose_1.Schema)()
], Mapping);
exports.MappingSchema = mongoose_1.SchemaFactory.createForClass(Mapping);
//# sourceMappingURL=settings.schema.js.map