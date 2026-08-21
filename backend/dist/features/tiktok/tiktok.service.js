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
        this.userStates = new Map();
    }
    registerCallbacks(callbacks) {
        this.onStatusChange = callbacks.onStatusChange;
        this.onChat = callbacks.onChat;
        this.onGift = callbacks.onGift;
        this.onRoomUser = callbacks.onRoomUser;
        this.onGiftsList = callbacks.onGiftsList;
    }
    getAvailableGifts(appUsername) {
        return this.userStates.get(appUsername)?.availableGifts || [];
    }
    getStatus(appUsername) {
        const state = this.userStates.get(appUsername);
        if (!state) {
            return {
                status: 'disconnected',
                username: '',
                viewerCount: 0,
                error: null,
            };
        }
        return {
            status: state.status,
            username: state.tiktokUsername,
            viewerCount: state.viewerCount,
            error: state.lastError,
        };
    }
    setConnectionStatus(appUsername, newStatus, error = null) {
        const state = this.userStates.get(appUsername);
        if (!state)
            return;
        state.status = newStatus;
        state.lastError = error;
        if (newStatus === 'disconnected') {
            state.viewerCount = 0;
        }
        const statusData = this.getStatus(appUsername);
        this.onStatusChange?.(appUsername, statusData);
        this.logger.log(`[${appUsername}] Status: ${newStatus}, User: ${state.tiktokUsername}, Error: ${error}`);
    }
    connect(appUsername, tiktokUsername) {
        if (!tiktokUsername)
            return;
        this.disconnect(appUsername);
        const state = {
            connection: null,
            tiktokUsername,
            status: 'connecting',
            viewerCount: 0,
            lastError: null,
            availableGifts: [],
        };
        this.userStates.set(appUsername, state);
        try {
            state.connection = new tiktok_live_connector_1.TikTokLiveConnection(tiktokUsername, {
                enableExtendedGiftInfo: false,
            });
            state.connection
                .connect()
                .then(async (conState) => {
                this.setConnectionStatus(appUsername, 'connected');
                this.logger.log(`[${appUsername}] Successfully connected to room ID: ${conState.roomId}`);
                try {
                    const giftsList = await state.connection.fetchAvailableGifts();
                    if (Array.isArray(giftsList)) {
                        state.availableGifts = giftsList.map((g) => ({
                            id: g.id || g.gift_id,
                            name: g.name,
                            diamondCount: g.diamond_count || g.cost || 0,
                            image: g.image?.url_list?.[0] || g.icon?.url_list?.[0] || '',
                        }));
                        this.onGiftsList?.(appUsername, state.availableGifts);
                    }
                }
                catch (err) {
                    this.logger.error(`[${appUsername}] Failed to fetch available gifts:`, err);
                }
            })
                .catch((err) => {
                this.logger.error(`[${appUsername}] Failed to connect:`, err);
                this.setConnectionStatus(appUsername, 'disconnected', err.message || 'Failed to connect. Check if username is correct or stream is live.');
            });
            state.connection.on('chat', (data) => {
                const chatData = {
                    nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
                    uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
                    comment: data.comment,
                    profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
                };
                this.onChat?.(appUsername, chatData);
            });
            state.connection.on('gift', (data) => {
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
                this.onGift?.(appUsername, giftData);
            });
            state.connection.on('roomUser', (data) => {
                if (data.viewerCount !== undefined) {
                    state.viewerCount = data.viewerCount;
                    this.onRoomUser?.(appUsername, { viewerCount: state.viewerCount });
                }
            });
            state.connection.on('disconnected', () => {
                this.logger.log(`[${appUsername}] Connection closed by remote host.`);
                this.setConnectionStatus(appUsername, 'disconnected', 'Stream connection ended or username went offline.');
            });
            state.connection.on('error', (err) => {
                this.logger.error(`[${appUsername}] Connector error:`, err);
            });
        }
        catch (err) {
            this.logger.error(`[${appUsername}] Initialization error:`, err);
            this.setConnectionStatus(appUsername, 'disconnected', err.message);
        }
    }
    disconnect(appUsername) {
        const state = this.userStates.get(appUsername);
        if (state) {
            if (state.connection) {
                try {
                    state.connection.disconnect();
                }
                catch (err) {
                    this.logger.error(`[${appUsername}] Error disconnecting:`, err);
                }
            }
            this.userStates.delete(appUsername);
            this.onStatusChange?.(appUsername, {
                status: 'disconnected',
                username: '',
                viewerCount: 0,
                error: null,
            });
        }
    }
};
exports.TiktokService = TiktokService;
exports.TiktokService = TiktokService = TiktokService_1 = __decorate([
    (0, common_1.Injectable)()
], TiktokService);
//# sourceMappingURL=tiktok.service.js.map