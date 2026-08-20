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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const gifts_service_1 = require("./gifts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const multer_1 = require("multer");
const path_1 = require("path");
let GiftsController = class GiftsController {
    constructor(giftsService) {
        this.giftsService = giftsService;
    }
    async findAll() {
        return this.giftsService.findAll();
    }
    uploadVideo(file) {
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }
        return {
            success: true,
            filename: file.filename,
            url: `/media/${file.filename}`,
        };
    }
    async create(giftData) {
        return this.giftsService.create(giftData);
    }
    async update(id, giftData) {
        return this.giftsService.update(id, giftData);
    }
    async remove(id) {
        return this.giftsService.remove(id);
    }
};
exports.GiftsController = GiftsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('video', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(process.cwd(), 'public', 'media'),
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const cleanName = file.originalname
                    .replace(/\s+/g, '_')
                    .replace(/[^a-zA-Z0-9_.-]/g, '');
                const ext = (0, path_1.extname)(cleanName);
                const baseName = cleanName.substring(0, cleanName.length - ext.length);
                callback(null, `${baseName}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(mp4)$/)) {
                return callback(new Error('Only MP4 video files are allowed!'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GiftsController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "remove", null);
exports.GiftsController = GiftsController = __decorate([
    (0, common_1.Controller)('api/gifts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gifts_service_1.GiftsService])
], GiftsController);
//# sourceMappingURL=gifts.controller.js.map