import { Model } from 'mongoose';
import { Gift } from './schemas/gift.schema';
export declare class GiftsService {
    private readonly giftModel;
    private readonly logger;
    private readonly defaultGifts;
    private onGiftsChange?;
    constructor(giftModel: Model<Gift>);
    registerChangeCallback(callback: (username: string, gifts: Gift[]) => void): void;
    private triggerChange;
    findAllForUser(username: string): Promise<Gift[]>;
    findOneForUser(id: string, username: string): Promise<Gift | null>;
    findByGiftIdForUser(giftId: number, username: string): Promise<Gift | null>;
    createForUser(username: string, giftData: Partial<Gift>): Promise<Gift>;
    updateForUser(id: string, username: string, giftData: Partial<Gift>): Promise<Gift | null>;
    removeForUser(id: string, username: string): Promise<any>;
}
