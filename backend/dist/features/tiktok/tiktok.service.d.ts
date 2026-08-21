import { TiktokStatus, ChatEvent, GiftEvent } from '../../common/interfaces/events.interface';
export declare class TiktokService {
    private readonly logger;
    private userStates;
    private onStatusChange?;
    private onChat?;
    private onGift?;
    private onRoomUser?;
    private onGiftsList?;
    registerCallbacks(callbacks: {
        onStatusChange: (appUsername: string, status: TiktokStatus) => void;
        onChat: (appUsername: string, data: ChatEvent) => void;
        onGift: (appUsername: string, data: GiftEvent) => void;
        onRoomUser: (appUsername: string, data: {
            viewerCount: number;
        }) => void;
        onGiftsList?: (appUsername: string, gifts: any[]) => void;
    }): void;
    getAvailableGifts(appUsername: string): any[];
    getStatus(appUsername: string): TiktokStatus;
    private setConnectionStatus;
    connect(appUsername: string, tiktokUsername: string): void;
    disconnect(appUsername: string): void;
}
