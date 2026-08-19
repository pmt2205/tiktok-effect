import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TiktokService } from '../tiktok/tiktok.service';
import { SettingsService } from '../settings/settings.service';
import { TiktokStatus, ChatEvent, GiftEvent, WsPacket } from '../../common/interfaces/events.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly tiktokService: TiktokService,
    private readonly settingsService: SettingsService,
  ) {}

  onModuleInit() {
    // Register TikTok event callbacks to broadcast to all WS clients
    this.tiktokService.registerCallbacks({
      onStatusChange: (status: TiktokStatus) => {
        this.server.emit('event', { type: 'status', data: status });
      },
      onChat: (data: ChatEvent) => {
        this.server.emit('event', { type: 'chat', data });
      },
      onGift: (data: GiftEvent) => {
        this.server.emit('event', { type: 'gift', data });
      },
      onRoomUser: (data: { viewerCount: number }) => {
        this.server.emit('event', { type: 'roomUser', data });
      },
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} (Total: ${this.server.engine.clientsCount})`);
    
    // Send initial status
    client.emit('event', {
      type: 'status',
      data: this.tiktokService.getStatus(),
    });

    // Send current settings
    client.emit('event', {
      type: 'settings-update',
      data: this.settingsService.getSettings(),
    });

    // Send current mappings
    client.emit('event', {
      type: 'mappings-update',
      data: this.settingsService.getMappings(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('command')
  handleCommand(@ConnectedSocket() client: Socket, @MessageBody() packet: WsPacket) {
    this.logger.log(`Received command: ${packet.type}`);

    switch (packet.type) {
      case 'connect-stream':
        if (packet.username) {
          this.tiktokService.connect(packet.username);
        }
        break;

      case 'disconnect-stream':
        this.tiktokService.disconnect();
        break;

      case 'get-status':
        client.emit('event', {
          type: 'status',
          data: this.tiktokService.getStatus(),
        });
        break;

      case 'simulate-event':
        if (packet.eventType === 'gift' || packet.eventType === 'chat') {
          this.logger.log(`Broadcasting simulated ${packet.eventType} event`);
          this.server.emit('event', {
            type: packet.eventType,
            data: { ...packet.payload, isSimulated: true },
          });
        } else if (packet.eventType === 'settings-update') {
          if (packet.payload) {
            this.settingsService.updateSettings(packet.payload);
          }
          this.server.emit('event', {
            type: 'settings-update',
            data: packet.payload,
          });
        } else if (packet.eventType === 'mappings-update') {
          if (packet.payload) {
            this.settingsService.updateMappings(packet.payload);
          }
          this.server.emit('event', {
            type: 'mappings-update',
            data: packet.payload,
          });
        }
        break;

      default:
        this.logger.warn(`Unknown command type: ${packet.type}`);
    }
  }
}
