import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getHistory(req: any, queryUsername?: string): Promise<import("./schemas/chat.schema").ChatMessage[]>;
    getConversations(req: any): Promise<any[]>;
    uploadFile(file: any): {
        success: boolean;
        message: string;
        url?: undefined;
        filename?: undefined;
    } | {
        success: boolean;
        url: string;
        filename: any;
        message?: undefined;
    };
}
