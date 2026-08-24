import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Gift } from './schemas/gift.schema';
import { NpcGift } from './schemas/npc-gift.schema';
export declare class GiftsService implements OnModuleInit {
    private readonly giftModel;
    private readonly npcGiftModel;
    private readonly logger;
    private readonly defaultGifts;
    private onGiftsChange?;
    private onNpcGiftsChange?;
    constructor(giftModel: Model<Gift>, npcGiftModel: Model<NpcGift>);
    onModuleInit(): Promise<void>;
    registerChangeCallback(callback: (username: string, gifts: Gift[]) => void): void;
    registerNpcChangeCallback(callback: (username: string, category: string, gifts: NpcGift[]) => void): void;
    private triggerChange;
    private triggerNpcChange;
    findAllForUser(username: string): Promise<Gift[]>;
    findOneForUser(id: string, username: string): Promise<Gift | null>;
    findByGiftIdForUser(giftId: number, username: string): Promise<Gift | null>;
    createForUser(username: string, giftData: Partial<Gift>): Promise<Gift>;
    updateForUser(id: string, username: string, giftData: Partial<Gift>): Promise<Gift | null>;
    removeForUser(id: string, username: string): Promise<any>;
    findAllNpcGiftsForUser(username: string, category: string): Promise<NpcGift[]>;
    findOneNpcGiftForUser(id: string, username: string, category: string): Promise<NpcGift | null>;
    createNpcGiftForUser(username: string, category: string, giftData: Partial<NpcGift>): Promise<NpcGift>;
    updateNpcGiftForUser(id: string, username: string, category: string, giftData: Partial<NpcGift>): Promise<NpcGift | null>;
    removeNpcGiftForUser(id: string, username: string, category: string): Promise<any>;
}
