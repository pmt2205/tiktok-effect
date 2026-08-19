import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TiktokService } from '../tiktok/tiktok.service';
import { SettingsService } from '../settings/settings.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly tiktokService;
    private readonly settingsService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(tiktokService: TiktokService, settingsService: SettingsService, jwtService: JwtService);
    onModuleInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleCommand(client: Socket, packet: any): void;
}
