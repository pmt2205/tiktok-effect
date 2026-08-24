import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TiktokService } from '../tiktok/tiktok.service';
import { SettingsService } from '../settings/settings.service';
import { GiftsService } from '../gifts/gifts.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly tiktokService;
    private readonly settingsService;
    private readonly jwtService;
    private readonly giftsService;
    private readonly usersService;
    private readonly chatService;
    server: Server;
    private readonly logger;
    constructor(tiktokService: TiktokService, settingsService: SettingsService, jwtService: JwtService, giftsService: GiftsService, usersService: UsersService, chatService: ChatService);
    onModuleInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleCommand(client: Socket, packet: any): Promise<void>;
}
