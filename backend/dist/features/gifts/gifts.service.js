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
var GiftsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gift_schema_1 = require("./schemas/gift.schema");
let GiftsService = GiftsService_1 = class GiftsService {
    constructor(giftModel) {
        this.giftModel = giftModel;
        this.logger = new common_1.Logger(GiftsService_1.name);
        this.defaultGifts = [
            { giftId: 5655, name: 'Hoa Hồng', coins: 1, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png', videos: ['rose.mp4'], activeVideo: 'rose.mp4' },
            { giftId: 5267, name: 'Logo TikTok', coins: 1, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/5f8ef94b05537ee4313f890280eb4c28.png~tplv-obj.image', videos: ['tiktok.mp4'], activeVideo: 'tiktok.mp4' },
            { giftId: 5621, name: 'Thả Tim', coins: 5, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/91bdc30c88581e19d7d10e82c1615f5c.png~tplv-obj.image', videos: [] },
            { giftId: 5827, name: 'Nước Hoa', coins: 20, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/8ad42e88a0e0eeae6d56d11da9bdc8c2.png~tplv-obj.image', videos: [] },
            { giftId: 5601, name: 'Mũ Cap', coins: 99, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/cap.png', videos: [] },
            { giftId: 5661, name: 'Thiên Hà', coins: 1000, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/galaxy.png', videos: [] },
            { giftId: 6101, name: 'Pháo Hoa', coins: 1088, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/6fa301d0bc88aa77df3c907a3c3065d6.png~tplv-obj.image', videos: [] },
            { giftId: 5313, name: 'Vương Miện', coins: 1999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/f6595561a052ff378907a3c3065d64f0.png~tplv-obj.image', videos: [] },
            { giftId: 5617, name: 'Kim Cương', coins: 2999, icon: 'https://p16-webcast.tiktokcdn.com/img/webcast/740fd5b5bf7d0577789a8e0e8e040c24.png~tplv-obj.image', videos: [] },
            { giftId: 5825, name: 'Sư Tử', coins: 29999, icon: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/lion.png', videos: [] },
        ];
    }
    registerChangeCallback(callback) {
        this.onGiftsChange = callback;
    }
    async triggerChange() {
        if (this.onGiftsChange) {
            try {
                const gifts = await this.findAll();
                this.onGiftsChange(gifts);
            }
            catch (err) {
                this.logger.error('Failed to trigger gifts change callback:', err);
            }
        }
    }
    async onModuleInit() {
        try {
            const sampleGift = await this.giftModel.findOne().exec();
            if (sampleGift && (isNaN(Number(sampleGift.giftId)) || sampleGift.get('effect') !== undefined)) {
                this.logger.log('Detected legacy gifts schema. Wiping gifts collection to re-seed.');
                await this.giftModel.deleteMany({});
            }
            const count = await this.giftModel.countDocuments().exec();
            if (count === 0) {
                await this.giftModel.insertMany(this.defaultGifts);
                this.logger.log('Seeded default TikTok gifts in MongoDB');
            }
        }
        catch (err) {
            this.logger.error('Failed to seed default gifts:', err);
        }
    }
    async findAll() {
        return this.giftModel.find().sort({ coins: 1 }).exec();
    }
    async findOne(id) {
        return this.giftModel.findById(id).exec();
    }
    async findByGiftId(giftId) {
        return this.giftModel.findOne({ giftId }).exec();
    }
    async create(giftData) {
        const newGift = new this.giftModel(giftData);
        const saved = await newGift.save();
        await this.triggerChange();
        return saved;
    }
    async update(id, giftData) {
        const updated = await this.giftModel.findByIdAndUpdate(id, giftData, { new: true }).exec();
        await this.triggerChange();
        return updated;
    }
    async remove(id) {
        const deleted = await this.giftModel.findByIdAndDelete(id).exec();
        await this.triggerChange();
        return deleted;
    }
};
exports.GiftsService = GiftsService;
exports.GiftsService = GiftsService = GiftsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(gift_schema_1.Gift.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GiftsService);
//# sourceMappingURL=gifts.service.js.map