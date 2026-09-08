import { TiktokStatus, ChatEvent, GiftEvent, TopGifterJoinEvent, LikeEvent, LikeLeaderboardItem } from '../../common/interfaces/events.interface';
export interface TopGifterRecord {
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    totalDiamonds: number;
}
export declare class TiktokService {
    private readonly logger;
    private userStates;
    private userTopGifters;
    private userLikeLeaderboard;
    private onStatusChange?;
    private onChat?;
    private onGift?;
    private onRoomUser?;
    private onGiftsList?;
    private onTopGifterJoin?;
    private onLike?;
    private onLikeLeaderboard?;
    registerCallbacks(callbacks: {
        onStatusChange: (appUsername: string, status: TiktokStatus) => void;
        onChat: (appUsername: string, data: ChatEvent) => void;
        onGift: (appUsername: string, data: GiftEvent) => void;
        onRoomUser: (appUsername: string, data: {
            viewerCount: number;
        }) => void;
        onGiftsList?: (appUsername: string, gifts: any[]) => void;
        onTopGifterJoin?: (appUsername: string, data: TopGifterJoinEvent) => void;
        onLike?: (appUsername: string, data: LikeEvent) => void;
        onLikeLeaderboard?: (appUsername: string, items: LikeLeaderboardItem[]) => void;
    }): void;
    getLikeLeaderboard(appUsername: string): LikeLeaderboardItem[];
    recordLike(appUsername: string, data: LikeEvent): void;
    resetLikeLeaderboard(appUsername: string): void;
    getTopGifters(appUsername: string): TopGifterRecord[];
    getAvailableGifts(appUsername: string): any[];
    getStatus(appUsername: string): TiktokStatus;
    private setConnectionStatus;
    connect(appUsername: string, tiktokUsername: string): void;
    disconnect(appUsername: string): void;
}
