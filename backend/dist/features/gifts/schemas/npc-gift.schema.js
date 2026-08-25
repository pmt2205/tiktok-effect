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
exports.NpcGiftSchema = exports.NpcGift = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let NpcGift = class NpcGift extends mongoose_2.Document {
};
exports.NpcGift = NpcGift;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], NpcGift.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], NpcGift.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], NpcGift.prototype, "giftId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NpcGift.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], NpcGift.prototype, "coins", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NpcGift.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true, default: [] }),
    __metadata("design:type", Array)
], NpcGift.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], NpcGift.prototype, "activeVideo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], NpcGift.prototype, "menuText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, required: true, default: true }),
    __metadata("design:type", Boolean)
], NpcGift.prototype, "menuShow", void 0);
exports.NpcGift = NpcGift = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], NpcGift);
exports.NpcGiftSchema = mongoose_1.SchemaFactory.createForClass(NpcGift);
exports.NpcGiftSchema.index({ username: 1, category: 1, giftId: 1 }, { unique: true });
//# sourceMappingURL=npc-gift.schema.js.map