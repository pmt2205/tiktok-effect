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
const TIKTOK_GIFT_IDS = {
    5655: 'Rose',
    5267: 'TikTok',
    5269: 'TikTok',
    5621: 'Finger Heart',
    5827: 'Ice Cream Cone',
    5543: 'Glow Stick',
    5585: 'Wishing Bottle',
    5613: 'Hearts',
    5281: 'Doughnut',
    5617: 'Paper Crane',
    5313: 'Crown',
    5601: 'Cap',
    5565: 'Sunglasses',
    5661: 'Galaxy',
    5825: 'Lion',
    6101: 'TikTok Universe',
};
let TiktokService = TiktokService_1 = class TiktokService {
    constructor() {
        this.logger = new common_1.Logger(TiktokService_1.name);
        this.connection = null;
        this.username = '';
        this.status = 'disconnected';
        this.viewerCount = 0;
        this.lastError = null;
        this.availableGifts = [];
    }
    registerCallbacks(callbacks) {
        this.onStatusChange = callbacks.onStatusChange;
        this.onChat = callbacks.onChat;
        this.onGift = callbacks.onGift;
        this.onRoomUser = callbacks.onRoomUser;
        this.onGiftsList = callbacks.onGiftsList;
    }
    getAvailableGifts() {
        return this.availableGifts;
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
                .then(async (state) => {
                this.setConnectionStatus('connected');
                this.logger.log(`Successfully connected to room ID: ${state.roomId}`);
                try {
                    const giftsList = await this.connection.fetchAvailableGifts();
                    if (Array.isArray(giftsList)) {
                        this.availableGifts = giftsList.map((g) => ({
                            id: g.id || g.gift_id,
                            name: g.name,
                            diamondCount: g.diamond_count || g.cost || 0,
                            image: g.image?.url_list?.[0] || g.icon?.url_list?.[0] || '',
                        }));
                        this.onGiftsList?.(this.availableGifts);
                    }
                }
                catch (err) {
                    this.logger.error('Failed to fetch available gifts:', err);
                }
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
                const giftId = data.giftId || data.gift?.gift_id;
                const resolvedName = data.extendedGiftInfo?.name ||
                    data.giftName ||
                    data.gift?.gift_name ||
                    (giftId ? TIKTOK_GIFT_IDS[giftId] : null) ||
                    (giftId ? `Gift ${giftId}` : 'Rose');
                const giftData = {
                    nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
                    uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
                    giftName: resolvedName,
                    repeatCount: data.repeatCount || 1,
                    diamondCount: data.extendedGiftInfo?.diamond_count || data.diamondCount || 0,
                    giftPictureUrl: data.extendedGiftInfo?.image?.url_list?.[0] || data.extendedGiftInfo?.icon?.url_list?.[0] || data.giftPictureUrl || data.giftDetails?.giftImage?.url_list?.[0] || '',
                    profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
                    isSimulated: false,
                    repeatEnd: !!data.repeatEnd,
                    giftType: data.gift?.gift_type || data.giftDetails?.giftType,
                    giftId: giftId,
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
        this.availableGifts = [];
        this.setConnectionStatus('disconnected');
    }
};
exports.TiktokService = TiktokService;
exports.TiktokService = TiktokService = TiktokService_1 = __decorate([
    (0, common_1.Injectable)()
], TiktokService);
//# sourceMappingURL=tiktok.service.js.map