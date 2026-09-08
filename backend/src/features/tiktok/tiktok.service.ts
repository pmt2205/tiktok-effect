import { Injectable, Logger } from '@nestjs/common';
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { TiktokStatus, ChatEvent, GiftEvent, TopGifterJoinEvent, LikeEvent, LikeLeaderboardItem } from '../../common/interfaces/events.interface';

const TIKTOK_GIFT_IDS: Record<number, string> = {
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

interface UserConnectionState {
  connection: any;
  tiktokUsername: string;
  status: 'disconnected' | 'connecting' | 'connected';
  viewerCount: number;
  lastError: string | null;
  availableGifts: any[];
}

export interface TopGifterRecord {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  totalDiamonds: number;
}

@Injectable()
export class TiktokService {
  private readonly logger = new Logger(TiktokService.name);

  // Keyed by App User's username
  private userStates = new Map<string, UserConnectionState>();

  // Track Top Gifters per App User: Map<appUsername, Map<uniqueId, TopGifterRecord>>
  private userTopGifters = new Map<string, Map<string, TopGifterRecord>>();

  // Track Like Leaderboard per App User: Map<appUsername, Map<uniqueId, LikeLeaderboardItem>>
  private userLikeLeaderboard = new Map<string, Map<string, LikeLeaderboardItem>>();

  // Callback functions set by the WebSocket gateway
  private onStatusChange?: (appUsername: string, status: TiktokStatus) => void;
  private onChat?: (appUsername: string, data: ChatEvent) => void;
  private onGift?: (appUsername: string, data: GiftEvent) => void;
  private onRoomUser?: (appUsername: string, data: { viewerCount: number }) => void;
  private onGiftsList?: (appUsername: string, gifts: any[]) => void;
  private onTopGifterJoin?: (appUsername: string, data: TopGifterJoinEvent) => void;
  private onLike?: (appUsername: string, data: LikeEvent) => void;
  private onLikeLeaderboard?: (appUsername: string, items: LikeLeaderboardItem[]) => void;

  registerCallbacks(callbacks: {
    onStatusChange: (appUsername: string, status: TiktokStatus) => void;
    onChat: (appUsername: string, data: ChatEvent) => void;
    onGift: (appUsername: string, data: GiftEvent) => void;
    onRoomUser: (appUsername: string, data: { viewerCount: number }) => void;
    onGiftsList?: (appUsername: string, gifts: any[]) => void;
    onTopGifterJoin?: (appUsername: string, data: TopGifterJoinEvent) => void;
    onLike?: (appUsername: string, data: LikeEvent) => void;
    onLikeLeaderboard?: (appUsername: string, items: LikeLeaderboardItem[]) => void;
  }) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onChat = callbacks.onChat;
    this.onGift = callbacks.onGift;
    this.onRoomUser = callbacks.onRoomUser;
    this.onGiftsList = callbacks.onGiftsList;
    this.onTopGifterJoin = callbacks.onTopGifterJoin;
    this.onLike = callbacks.onLike;
    this.onLikeLeaderboard = callbacks.onLikeLeaderboard;
  }

  getLikeLeaderboard(appUsername: string): LikeLeaderboardItem[] {
    const userMap = this.userLikeLeaderboard.get(appUsername);
    if (!userMap) return [];
    return Array.from(userMap.values())
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  recordLike(appUsername: string, data: LikeEvent) {
    let userMap = this.userLikeLeaderboard.get(appUsername);
    if (!userMap) {
      userMap = new Map();
      this.userLikeLeaderboard.set(appUsername, userMap);
    }

    const uniqueId = data.uniqueId || 'anonymous';
    const addedLikes = data.likeCount || 1;
    const existing = userMap.get(uniqueId);

    if (existing) {
      existing.totalLikes += addedLikes;
      if (data.nickname) existing.nickname = data.nickname;
      if (data.profilePictureUrl) existing.profilePictureUrl = data.profilePictureUrl;
    } else {
      userMap.set(uniqueId, {
        uniqueId,
        nickname: data.nickname || uniqueId,
        profilePictureUrl: data.profilePictureUrl || '',
        totalLikes: addedLikes,
        rank: 0,
      });
    }

    const updatedList = this.getLikeLeaderboard(appUsername);
    this.onLike?.(appUsername, data);
    this.onLikeLeaderboard?.(appUsername, updatedList);
  }

  resetLikeLeaderboard(appUsername: string) {
    this.userLikeLeaderboard.delete(appUsername);
    this.onLikeLeaderboard?.(appUsername, []);
  }

  getTopGifters(appUsername: string): TopGifterRecord[] {
    const appGifters = this.userTopGifters.get(appUsername);
    if (!appGifters) return [];
    return Array.from(appGifters.values()).sort((a, b) => b.totalDiamonds - a.totalDiamonds);
  }

  getAvailableGifts(appUsername: string): any[] {
    return this.userStates.get(appUsername)?.availableGifts || [];
  }

  getStatus(appUsername: string): TiktokStatus {
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

  private setConnectionStatus(
    appUsername: string,
    newStatus: 'disconnected' | 'connecting' | 'connected',
    error: string | null = null,
  ) {
    const state = this.userStates.get(appUsername);
    if (!state) return;

    state.status = newStatus;
    state.lastError = error;
    if (newStatus === 'disconnected') {
      state.viewerCount = 0;
    }

    const statusData = this.getStatus(appUsername);
    this.onStatusChange?.(appUsername, statusData);
    this.logger.log(`[${appUsername}] Status: ${newStatus}, User: ${state.tiktokUsername}, Error: ${error}`);
  }

  connect(appUsername: string, tiktokUsername: string) {
    if (!tiktokUsername) return;

    // Clean up existing connection for this App User
    this.disconnect(appUsername);

    const state: UserConnectionState = {
      connection: null,
      tiktokUsername,
      status: 'connecting',
      viewerCount: 0,
      lastError: null,
      availableGifts: [],
    };
    this.userStates.set(appUsername, state);

    try {
      state.connection = new TikTokLiveConnection(tiktokUsername, {
        enableExtendedGiftInfo: false,
      });

      state.connection
        .connect()
        .then(async (conState: any) => {
          this.setConnectionStatus(appUsername, 'connected');
          this.logger.log(`[${appUsername}] Successfully connected to room ID: ${conState.roomId}`);
          try {
            const giftsList = await state.connection.fetchAvailableGifts();
            if (Array.isArray(giftsList)) {
              state.availableGifts = giftsList.map((g: any) => ({
                id: g.id || g.gift_id,
                name: g.name,
                diamondCount: g.diamond_count || g.cost || 0,
                image: g.image?.url_list?.[0] || g.icon?.url_list?.[0] || '',
              }));
              this.onGiftsList?.(appUsername, state.availableGifts);
            }
          } catch (err) {
            this.logger.error(`[${appUsername}] Failed to fetch available gifts:`, err);
          }
         })
        .catch((err: Error) => {
          this.logger.error(`[${appUsername}] Failed to connect:`, err);
          this.setConnectionStatus(
            appUsername,
            'disconnected',
            err.message || 'Failed to connect. Check if username is correct or stream is live.',
          );
        });

      // Chat handler
      state.connection.on('chat', (data: any) => {
        const chatData: ChatEvent = {
          nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
          uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
          comment: data.comment,
          profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
        };
        this.onChat?.(appUsername, chatData);
      });

      // Gift handler
      state.connection.on('gift', (data: any) => {
        const giftId = data.giftId || data.gift?.gift_id;
        const resolvedName = data.extendedGiftInfo?.name || 
                             data.giftName || 
                             data.gift?.gift_name || 
                             (giftId ? TIKTOK_GIFT_IDS[giftId] : null) || 
                             (giftId ? `Gift ${giftId}` : 'Rose');
        const giftData: GiftEvent = {
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
        // Track Top Gifters
        const diamonds = (data.extendedGiftInfo?.diamond_count || data.diamondCount || 1) * (data.repeatCount || 1);
        let appGifters = this.userTopGifters.get(appUsername);
        if (!appGifters) {
          appGifters = new Map();
          this.userTopGifters.set(appUsername, appGifters);
        }
        const existingGifter = appGifters.get(giftData.uniqueId);
        if (existingGifter) {
          existingGifter.totalDiamonds += diamonds;
          if (giftData.nickname) existingGifter.nickname = giftData.nickname;
          if (giftData.profilePictureUrl) existingGifter.profilePictureUrl = giftData.profilePictureUrl;
        } else {
          appGifters.set(giftData.uniqueId, {
            uniqueId: giftData.uniqueId,
            nickname: giftData.nickname,
            profilePictureUrl: giftData.profilePictureUrl,
            totalDiamonds: diamonds,
          });
        }

        this.onGift?.(appUsername, giftData);
      });

      // Like handler
      state.connection.on('like', (data: any) => {
        const likeData: LikeEvent = {
          nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
          uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
          profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
          likeCount: data.likeCount || 1,
          totalLikeCount: data.totalLikeCount || 0,
          isSimulated: false,
        };
        this.recordLike(appUsername, likeData);
      });

      // Member join handler (detect top gifter joining room)
      state.connection.on('member', (data: any) => {
        const uniqueId = data.uniqueId || data.user?.uniqueId;
        if (!uniqueId) return;
        const nickname = data.nickname || data.user?.nickname || uniqueId;
        const profilePictureUrl = data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '';

        const appGifters = this.userTopGifters.get(appUsername);
        if (!appGifters) return;

        const topList = Array.from(appGifters.values()).sort((a, b) => b.totalDiamonds - a.totalDiamonds);
        const rankIndex = topList.findIndex((g) => g.uniqueId === uniqueId);

        if (rankIndex !== -1) {
          const topGifter = topList[rankIndex];
          const rank = rankIndex + 1;
          this.logger.log(`[${appUsername}] Top Gifter #${rank} (${nickname}) joined live room!`);
          this.onTopGifterJoin?.(appUsername, {
            uniqueId: topGifter.uniqueId,
            nickname: topGifter.nickname || nickname,
            profilePictureUrl: topGifter.profilePictureUrl || profilePictureUrl,
            totalDiamonds: topGifter.totalDiamonds,
            rank,
            isSimulated: false,
          });
        }
      });

      // Viewer count handler
      state.connection.on('roomUser', (data: any) => {
        if (data.viewerCount !== undefined) {
          state.viewerCount = data.viewerCount;
          this.onRoomUser?.(appUsername, { viewerCount: state.viewerCount });
        }
      });

      // Disconnect handler
      state.connection.on('disconnected', () => {
        this.logger.log(`[${appUsername}] Connection closed by remote host.`);
        this.setConnectionStatus(appUsername, 'disconnected', 'Stream connection ended or username went offline.');
      });

      // Error handler
      state.connection.on('error', (err: Error) => {
        this.logger.error(`[${appUsername}] Connector error:`, err);
      });
    } catch (err: any) {
      this.logger.error(`[${appUsername}] Initialization error:`, err);
      this.setConnectionStatus(appUsername, 'disconnected', err.message);
    }
  }

  disconnect(appUsername: string) {
    const state = this.userStates.get(appUsername);
    if (state) {
      if (state.connection) {
        try {
          state.connection.disconnect();
        } catch (err) {
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
}

