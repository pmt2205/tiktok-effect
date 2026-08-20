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
import { JwtService } from '@nestjs/jwt';
import { TiktokService } from '../tiktok/tiktok.service';
import { SettingsService } from '../settings/settings.service';
import { GiftsService } from '../gifts/gifts.service';
import { UsersService } from '../users/users.service';
import { TiktokStatus, ChatEvent, GiftEvent } from '../../common/interfaces/events.interface';

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
    private readonly jwtService: JwtService,
    private readonly giftsService: GiftsService,
    private readonly usersService: UsersService,
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
      onGiftsList: (gifts: any[]) => {
        this.server.emit('event', { type: 'gifts-list', data: gifts });
      },
    });

    // Register Gifts change callback to broadcast to all WS clients
    this.giftsService.registerChangeCallback((gifts) => {
      this.server.emit('event', { type: 'gifts-update', data: gifts });
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} (Total: ${this.server.engine.clientsCount})`);
    
    // Send initial status
    client.emit('event', {
      type: 'status',
      data: this.tiktokService.getStatus(),
    });

    // Send available gifts if populated
    const gifts = this.tiktokService.getAvailableGifts();
    if (gifts && gifts.length > 0) {
      client.emit('event', {
        type: 'gifts-list',
        data: gifts,
      });
    }

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

    // Send database custom gifts
    this.giftsService.findAll()
      .then(dbGifts => {
        client.emit('event', {
          type: 'gifts-update',
          data: dbGifts,
        });
      })
      .catch(err => this.logger.error('Failed to send database gifts to new client:', err));
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('command')
  async handleCommand(@ConnectedSocket() client: Socket, @MessageBody() packet: any) {
    this.logger.log(`Received command: ${packet.type}`);

    // Verify token for administrative/mutation commands
    const adminCommands = ['connect-stream', 'disconnect-stream', 'simulate-event'];
    if (adminCommands.includes(packet.type)) {
      try {
        if (!packet.token) {
          throw new Error('No authentication token provided');
        }
        const decoded = this.jwtService.verify(packet.token);
        
        if (packet.type === 'connect-stream' || packet.type === 'disconnect-stream') {
          const dbUser = await this.usersService.findByUsername(decoded.username);
          const allowUserConnect = dbUser ? dbUser.allowConnect : false;
          if (decoded.role !== 'admin' && !allowUserConnect) {
            throw new Error('Unauthorized role: Stream connection is disabled for your user account');
          }
        } else {
          if (decoded.role !== 'admin') {
            throw new Error('Unauthorized role: Admin privileges required');
          }
        }
      } catch (err: any) {
        this.logger.warn(`Unauthorized WS command: ${packet.type} - ${err.message}`);
        client.emit('event', {
          type: 'error',
          data: `Unauthorized: ${err.message}`,
        });
        return;
      }
    }

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
