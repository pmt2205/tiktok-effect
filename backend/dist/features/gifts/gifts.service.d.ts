import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Gift } from './schemas/gift.schema';
export declare class GiftsService implements OnModuleInit {
    private readonly giftModel;
    private readonly logger;
    private readonly defaultGifts;
    private onGiftsChange?;
    constructor(giftModel: Model<Gift>);
    registerChangeCallback(callback: (gifts: Gift[]) => void): void;
    private triggerChange;
    onModuleInit(): Promise<void>;
    findAll(): Promise<Gift[]>;
    findOne(id: string): Promise<Gift | null>;
    findByGiftId(giftId: number): Promise<Gift | null>;
    create(giftData: Partial<Gift>): Promise<Gift>;
    update(id: string, giftData: Partial<Gift>): Promise<Gift | null>;
    remove(id: string): Promise<any>;
}
