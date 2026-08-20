"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const tiktok_module_1 = require("./features/tiktok/tiktok.module");
const websocket_module_1 = require("./features/websocket/websocket.module");
const settings_module_1 = require("./features/settings/settings.module");
const media_module_1 = require("./features/media/media.module");
const auth_module_1 = require("./features/auth/auth.module");
const users_module_1 = require("./features/users/users.module");
const gifts_module_1 = require("./features/gifts/gifts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/tiktok-effect'),
            tiktok_module_1.TiktokModule,
            websocket_module_1.WebsocketModule,
            settings_module_1.SettingsModule,
            media_module_1.MediaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            gifts_module_1.GiftsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map