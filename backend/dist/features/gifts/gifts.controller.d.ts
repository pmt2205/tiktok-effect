import { GiftsService } from './gifts.service';
import { Gift } from './schemas/gift.schema';
export declare class GiftsController {
    private readonly giftsService;
    constructor(giftsService: GiftsService);
    findAll(): Promise<Gift[]>;
    uploadVideo(file: any): {
        success: boolean;
        message: string;
        filename?: undefined;
        url?: undefined;
    } | {
        success: boolean;
        filename: any;
        url: string;
        message?: undefined;
    };
    create(giftData: Partial<Gift>): Promise<Gift>;
    update(id: string, giftData: Partial<Gift>): Promise<Gift | null>;
    remove(id: string): Promise<any>;
}
