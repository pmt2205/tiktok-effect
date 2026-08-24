"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_schema_1 = require("./schemas/chat.schema");
let ChatService = ChatService_1 = class ChatService {
    constructor(chatModel) {
        this.chatModel = chatModel;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async createMessage(sender, receiver, message) {
        try {
            const chatMsg = await this.chatModel.create({
                sender,
                receiver,
                message,
                read: false,
            });
            return chatMsg;
        }
        catch (err) {
            this.logger.error(`Failed to save chat message from ${sender} to ${receiver}:`, err);
            throw err;
        }
    }
    async getHistory(userA, userB) {
        try {
            await this.chatModel.updateMany({ sender: userB, receiver: userA, read: false }, { $set: { read: true } }).exec();
            return await this.chatModel.find({
                $or: [
                    { sender: userA, receiver: userB },
                    { sender: userB, receiver: userA },
                ],
            }).sort({ createdAt: 1 }).exec();
        }
        catch (err) {
            this.logger.error(`Failed to get chat history between ${userA} and ${userB}:`, err);
            throw err;
        }
    }
    async getConversations(username) {
        try {
            const messages = await this.chatModel.find({
                $or: [{ sender: username }, { receiver: username }]
            }).sort({ createdAt: -1 }).exec();
            const conversationsMap = new Map();
            for (const msg of messages) {
                const peer = msg.sender === username ? msg.receiver : msg.sender;
                if (!conversationsMap.has(peer)) {
                    conversationsMap.set(peer, {
                        username: peer,
                        lastMessage: msg.message,
                        lastTimestamp: msg.createdAt,
                        unreadCount: 0,
                    });
                }
                if (msg.sender === peer && msg.receiver === username && !msg.read) {
                    const conv = conversationsMap.get(peer);
                    conv.unreadCount += 1;
                }
            }
            return Array.from(conversationsMap.values());
        }
        catch (err) {
            this.logger.error(`Failed to fetch conversations for ${username}:`, err);
            return [];
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_schema_1.ChatMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map