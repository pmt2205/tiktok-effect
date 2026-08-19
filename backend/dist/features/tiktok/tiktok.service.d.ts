import { TiktokStatus, ChatEvent, GiftEvent } from '../../common/interfaces/events.interface';
export declare class TiktokService {
    private readonly logger;
    private connection;
    private username;
    private status;
    private viewerCount;
    private lastError;
    private onStatusChange?;
    private onChat?;
    private onGift?;
    private onRoomUser?;
    registerCallbacks(callbacks: {
        onStatusChange: (status: TiktokStatus) => void;
        onChat: (data: ChatEvent) => void;
        onGift: (data: GiftEvent) => void;
        onRoomUser: (data: {
            viewerCount: number;
        }) => void;
    }): void;
    getStatus(): TiktokStatus;
    private setConnectionStatus;
    connect(username: string): void;
    disconnect(): void;
}
