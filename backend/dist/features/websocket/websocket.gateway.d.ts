import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TiktokService } from '../tiktok/tiktok.service';
import { SettingsService } from '../settings/settings.service';
import { WsPacket } from '../../common/interfaces/events.interface';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly tiktokService;
    private readonly settingsService;
    server: Server;
    private readonly logger;
    constructor(tiktokService: TiktokService, settingsService: SettingsService);
    onModuleInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleCommand(client: Socket, packet: WsPacket): void;
}
