"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TiktokService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktokService = void 0;
const common_1 = require("@nestjs/common");
const tiktok_live_connector_1 = require("tiktok-live-connector");
let TiktokService = TiktokService_1 = class TiktokService {
    constructor() {
        this.logger = new common_1.Logger(TiktokService_1.name);
        this.connection = null;
        this.username = '';
        this.status = 'disconnected';
        this.viewerCount = 0;
        this.lastError = null;
    }
    registerCallbacks(callbacks) {
        this.onStatusChange = callbacks.onStatusChange;
        this.onChat = callbacks.onChat;
        this.onGift = callbacks.onGift;
        this.onRoomUser = callbacks.onRoomUser;
    }
    getStatus() {
        return {
            status: this.status,
            username: this.username,
            viewerCount: this.viewerCount,
            error: this.lastError,
        };
    }
    setConnectionStatus(newStatus, error = null) {
        this.status = newStatus;
        this.lastError = error;
        if (newStatus === 'disconnected') {
            this.viewerCount = 0;
        }
        const statusData = this.getStatus();
        this.onStatusChange?.(statusData);
        this.logger.log(`Status: ${newStatus}, User: ${this.username}, Error: ${error}`);
    }
    connect(username) {
        if (!username)
            return;
        this.disconnect();
        this.username = username;
        this.setConnectionStatus('connecting');
        try {
            this.connection = new tiktok_live_connector_1.TikTokLiveConnection(username, {
                enableExtendedGiftInfo: false,
            });
            this.connection
                .connect()
                .then((state) => {
                this.setConnectionStatus('connected');
                this.logger.log(`Successfully connected to room ID: ${state.roomId}`);
            })
                .catch((err) => {
                this.logger.error('Failed to connect:', err);
                this.setConnectionStatus('disconnected', err.message || 'Failed to connect. Check if username is correct or stream is live.');
            });
            this.connection.on('chat', (data) => {
                const chatData = {
                    nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
                    uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
                    comment: data.comment,
                    profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
                };
                this.onChat?.(chatData);
            });
            this.connection.on('gift', (data) => {
                const giftData = {
                    nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
                    uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
                    giftName: data.giftName || data.gift?.gift_name || 'Rose',
                    repeatCount: data.repeatCount || 1,
                    diamondCount: data.diamondCount || 0,
                    giftPictureUrl: data.giftPictureUrl || data.giftDetails?.giftImage?.url_list?.[0] || '',
                    profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
                    isSimulated: false,
                };
                this.onGift?.(giftData);
            });
            this.connection.on('roomUser', (data) => {
                if (data.viewerCount !== undefined) {
                    this.viewerCount = data.viewerCount;
                    this.onRoomUser?.({ viewerCount: this.viewerCount });
                }
            });
            this.connection.on('disconnected', () => {
                this.logger.log('Connection closed by remote host.');
                this.setConnectionStatus('disconnected', 'Stream connection ended or username went offline.');
            });
            this.connection.on('error', (err) => {
                this.logger.error('Connector error:', err);
            });
        }
        catch (err) {
            this.logger.error('Initialization error:', err);
            this.setConnectionStatus('disconnected', err.message);
        }
    }
    disconnect() {
        if (this.connection) {
            try {
                this.connection.disconnect();
            }
            catch (err) {
                this.logger.error('Error disconnecting:', err);
            }
            this.connection = null;
        }
        this.username = '';
        this.setConnectionStatus('disconnected');
    }
};
exports.TiktokService = TiktokService;
exports.TiktokService = TiktokService = TiktokService_1 = __decorate([
    (0, common_1.Injectable)()
], TiktokService);
//# sourceMappingURL=tiktok.service.js.map