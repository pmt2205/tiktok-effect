import { Model } from 'mongoose';
import { ChatMessage } from './schemas/chat.schema';
export declare class ChatService {
    private readonly chatModel;
    private readonly logger;
    constructor(chatModel: Model<ChatMessage>);
    createMessage(sender: string, receiver: string, message: string): Promise<ChatMessage>;
    getHistory(userA: string, userB: string): Promise<ChatMessage[]>;
    getConversations(username: string): Promise<any[]>;
}
