"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketModule = void 0;
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("./websocket.gateway");
const tiktok_module_1 = require("../tiktok/tiktok.module");
const settings_module_1 = require("../settings/settings.module");
const auth_module_1 = require("../auth/auth.module");
const gifts_module_1 = require("../gifts/gifts.module");
const users_module_1 = require("../users/users.module");
let WebsocketModule = class WebsocketModule {
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        imports: [tiktok_module_1.TiktokModule, settings_module_1.SettingsModule, auth_module_1.AuthModule, gifts_module_1.GiftsModule, users_module_1.UsersModule],
        providers: [websocket_gateway_1.WebsocketGateway],
    })
], WebsocketModule);
//# sourceMappingURL=websocket.module.js.map