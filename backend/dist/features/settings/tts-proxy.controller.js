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
exports.TtsProxyController = void 0;
const common_1 = require("@nestjs/common");
let TtsProxyController = class TtsProxyController {
    async getGoogleTts(text, res) {
        if (!text || !text.trim()) {
            return res.status(400).send('Text parameter is required');
        }
        try {
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=vi&client=tw-ob`;
            const response = await fetch(googleUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://translate.google.com/',
                },
            });
            if (!response.ok) {
                return res.status(response.status).send('Failed to fetch audio from Google TTS');
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(buffer);
        }
        catch (err) {
            return res.status(500).send(err.message || 'TTS Error');
        }
    }
};
exports.TtsProxyController = TtsProxyController;
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Query)('text')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TtsProxyController.prototype, "getGoogleTts", null);
exports.TtsProxyController = TtsProxyController = __decorate([
    (0, common_1.Controller)('api/tts')
], TtsProxyController);
//# sourceMappingURL=tts-proxy.controller.js.map