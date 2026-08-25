import { GiftsService } from './gifts.service';
import { Gift } from './schemas/gift.schema';
export declare class GiftsController {
    private readonly giftsService;
    constructor(giftsService: GiftsService);
    findAll(queryUsername?: string, req?: any): Promise<Gift[]>;
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
    uploadSound(file: any): {
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
    create(giftData: Partial<Gift>, req: any): Promise<Gift>;
    update(id: string, giftData: Partial<Gift>, req: any): Promise<Gift | null>;
    remove(id: string, req: any, queryUsername?: string): Promise<any>;
    findAllNpc(queryUsername: string, category: string, req?: any): Promise<any[]>;
    createNpc(body: any, req: any): Promise<any>;
    updateNpc(id: string, body: any, req: any): Promise<any>;
    removeNpc(id: string, req: any, queryUsername?: string, category?: string): Promise<any>;
}
