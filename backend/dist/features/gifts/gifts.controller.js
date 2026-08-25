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
    async findAll(queryUsername, req) {
        let username = queryUsername;
        if (!username && req && req.headers && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const payloadPart = token.split('.')[1];
                    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));
                    username = payload.username;
                }
                catch (e) {
                }
            }
        }
        if (!username) {
            return [];
        }
        return this.giftsService.findAllForUser(username);
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
    uploadSound(file) {
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }
        return {
            success: true,
            filename: file.filename,
            url: `/media/${file.filename}`,
        };
    }
    async create(giftData, req) {
        const targetUsername = (req.user.role === 'admin' && giftData.username)
            ? giftData.username
            : req.user.username;
        return this.giftsService.createForUser(targetUsername, giftData);
    }
    async update(id, giftData, req) {
        const user = req.user;
        if (user && user.role !== 'admin') {
            const allowedUpdate = {};
            if (giftData.activeVideo !== undefined) {
                allowedUpdate.activeVideo = giftData.activeVideo;
            }
            if (giftData.activeSound !== undefined) {
                allowedUpdate.activeSound = giftData.activeSound;
            }
            if (giftData.menuText !== undefined) {
                allowedUpdate.menuText = giftData.menuText;
            }
            if (giftData.menuShow !== undefined) {
                allowedUpdate.menuShow = giftData.menuShow;
            }
            return this.giftsService.updateForUser(id, user.username, allowedUpdate);
        }
        const targetUsername = giftData.username || user.username;
        return this.giftsService.updateForUser(id, targetUsername, giftData);
    }
    async remove(id, req, queryUsername) {
        const targetUsername = (req.user.role === 'admin' && queryUsername)
            ? queryUsername
            : req.user.username;
        return this.giftsService.removeForUser(id, targetUsername);
    }
    async findAllNpc(queryUsername, category, req) {
        let username = queryUsername;
        if (!username && req && req.headers && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const payloadPart = token.split('.')[1];
                    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));
                    username = payload.username;
                }
                catch (e) {
                }
            }
        }
        if (!username || !category) {
            return [];
        }
        return this.giftsService.findAllNpcGiftsForUser(username, category);
    }
    async createNpc(body, req) {
        const targetUsername = (req.user.role === 'admin' && body.username)
            ? body.username
            : req.user.username;
        return this.giftsService.createNpcGiftForUser(targetUsername, body.category || 'anime', body);
    }
    async updateNpc(id, body, req) {
        const user = req.user;
        if (user && user.role !== 'admin') {
            const allowedUpdate = {};
            if (body.activeVideo !== undefined) {
                allowedUpdate.activeVideo = body.activeVideo;
            }
            if (body.activeSound !== undefined) {
                allowedUpdate.activeSound = body.activeSound;
            }
            if (body.menuText !== undefined) {
                allowedUpdate.menuText = body.menuText;
            }
            if (body.menuShow !== undefined) {
                allowedUpdate.menuShow = body.menuShow;
            }
            return this.giftsService.updateNpcGiftForUser(id, user.username, body.category || 'anime', allowedUpdate);
        }
        const targetUsername = body.username || user.username;
        return this.giftsService.updateNpcGiftForUser(id, targetUsername, body.category || 'anime', body);
    }
    async removeNpc(id, req, queryUsername, category) {
        const targetUsername = (req.user.role === 'admin' && queryUsername)
            ? queryUsername
            : req.user.username;
        return this.giftsService.removeNpcGiftForUser(id, targetUsername, category || 'anime');
    }
};
exports.GiftsController = GiftsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
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
    (0, common_1.Post)('upload-sound'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('sound', {
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
            if (!file.originalname.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
                return callback(new Error('Only audio files (MP3, WAV, OGG, M4A, AAC) are allowed!'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GiftsController.prototype, "uploadSound", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('npc'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "findAllNpc", null);
__decorate([
    (0, common_1.Post)('npc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "createNpc", null);
__decorate([
    (0, common_1.Put)('npc/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "updateNpc", null);
__decorate([
    (0, common_1.Delete)('npc/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('username')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "removeNpc", null);
exports.GiftsController = GiftsController = __decorate([
    (0, common_1.Controller)('api/gifts'),
    __metadata("design:paramtypes", [gifts_service_1.GiftsService])
], GiftsController);
//# sourceMappingURL=gifts.controller.js.map