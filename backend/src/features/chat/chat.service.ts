import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name) private readonly chatModel: Model<ChatMessage>,
  ) {}

  async createMessage(sender: string, receiver: string, message: string): Promise<ChatMessage> {
    try {
      const chatMsg = await this.chatModel.create({
        sender,
        receiver,
        message,
        read: false,
      });
      return chatMsg;
    } catch (err) {
      this.logger.error(`Failed to save chat message from ${sender} to ${receiver}:`, err);
      throw err;
    }
  }

  async getHistory(userA: string, userB: string): Promise<ChatMessage[]> {
    try {
      // Mark all messages from userB to userA as read
      await this.chatModel.updateMany(
        { sender: userB, receiver: userA, read: false },
        { $set: { read: true } }
      ).exec();

      // Retrieve messages between userA and userB sorted by createdAt ascending
      return await this.chatModel.find({
        $or: [
          { sender: userA, receiver: userB },
          { sender: userB, receiver: userA },
        ],
      }).sort({ createdAt: 1 }).exec();
    } catch (err) {
      this.logger.error(`Failed to get chat history between ${userA} and ${userB}:`, err);
      throw err;
    }
  }

  async getConversations(username: string): Promise<any[]> {
    try {
      const messages = await this.chatModel.find({
        $or: [{ sender: username }, { receiver: username }]
      }).sort({ createdAt: -1 }).exec();

      const conversationsMap = new Map<string, any>();

      for (const msg of messages) {
        const peer = msg.sender === username ? msg.receiver : msg.sender;
        if (!conversationsMap.has(peer)) {
          conversationsMap.set(peer, {
            username: peer,
            lastMessage: msg.message,
            lastTimestamp: (msg as any).createdAt,
            unreadCount: 0,
          });
        }
        
        if (msg.sender === peer && msg.receiver === username && !msg.read) {
          const conv = conversationsMap.get(peer);
          conv.unreadCount += 1;
        }
      }

      return Array.from(conversationsMap.values());
    } catch (err) {
      this.logger.error(`Failed to fetch conversations for ${username}:`, err);
      return [];
    }
  }
}
