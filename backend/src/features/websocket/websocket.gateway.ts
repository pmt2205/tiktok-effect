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
    // Register TikTok event callbacks to broadcast to specific user rooms
    this.tiktokService.registerCallbacks({
      onStatusChange: (appUsername: string, status: TiktokStatus) => {
        this.server.to(`user:${appUsername}`).emit('event', { type: 'status', data: status });
      },
      onChat: (appUsername: string, data: ChatEvent) => {
        this.server.to(`user:${appUsername}`).emit('event', { type: 'chat', data });
      },
      onGift: (appUsername: string, data: GiftEvent) => {
        this.server.to(`user:${appUsername}`).emit('event', { type: 'gift', data });
      },
      onRoomUser: (appUsername: string, data: { viewerCount: number }) => {
        this.server.to(`user:${appUsername}`).emit('event', { type: 'roomUser', data });
      },
      onGiftsList: (appUsername: string, gifts: any[]) => {
        this.server.to(`user:${appUsername}`).emit('event', { type: 'gifts-list', data: gifts });
      },
    });

    // Register Gifts change callback to broadcast to specific user rooms
    this.giftsService.registerChangeCallback((appUsername, gifts) => {
      this.server.to(`user:${appUsername}`).emit('event', { type: 'gifts-update', data: gifts });
    });
  }

  async handleConnection(client: Socket) {
    const query = client.handshake.query;
    let username: string | null = null;

    // 1. Try to verify via token (for dashboard connections)
    if (query.token) {
      try {
        const decoded = this.jwtService.verify(query.token as string);
        username = decoded.username;
      } catch (err: any) {
        this.logger.warn(`Failed to verify handshake token: ${err.message}`);
      }
    }

    // 2. Try to get explicit username (for public overlays)
    if (!username && query.username) {
      username = query.username as string;
    }

    if (!username) {
      this.logger.warn(`Connection closed: No username or token provided for client ${client.id}`);
      client.disconnect();
      return;
    }

    const roomName = `user:${username}`;
    await client.join(roomName);
    this.logger.log(`Client ${client.id} joined room ${roomName} (Total room clients: ${this.server.sockets.adapter.rooms.get(roomName)?.size || 0})`);

    // Send initial status for this user
    client.emit('event', {
      type: 'status',
      data: this.tiktokService.getStatus(username),
    });

    // Send available gifts if populated for this user
    const gifts = this.tiktokService.getAvailableGifts(username);
    if (gifts && gifts.length > 0) {
      client.emit('event', {
        type: 'gifts-list',
        data: gifts,
      });
    }

    // Send current settings for this user
    try {
      const settings = await this.settingsService.getSettingsForUser(username);
      client.emit('event', {
        type: 'settings-update',
        data: settings,
      });
    } catch (err) {
      this.logger.error(`Failed to send settings to new client ${client.id}:`, err);
    }

    // Send current mappings for this user
    try {
      const mappings = await this.settingsService.getMappingsForUser(username);
      client.emit('event', {
        type: 'mappings-update',
        data: mappings,
      });
    } catch (err) {
      this.logger.error(`Failed to send mappings to new client ${client.id}:`, err);
    }

    // Send database custom gifts for this user
    try {
      const dbGifts = await this.giftsService.findAllForUser(username);
      client.emit('event', {
        type: 'gifts-update',
        data: dbGifts,
      });
    } catch (err) {
      this.logger.error(`Failed to send database gifts to new client ${client.id}:`, err);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('command')
  async handleCommand(@ConnectedSocket() client: Socket, @MessageBody() packet: any) {
    this.logger.log(`Received command: ${packet.type}`);
    let username: string | null = null;

    // Verify token for administrative/mutation commands
    try {
      if (packet.token) {
        const decoded = this.jwtService.verify(packet.token);
        username = decoded.username;
      }
    } catch (err: any) {
      this.logger.warn(`Invalid command token: ${err.message}`);
    }

    // Identify from socket room if no token (fallback, though administrative commands should have token)
    if (!username) {
      const rooms = Array.from(client.rooms);
      const userRoom = rooms.find(r => r.startsWith('user:'));
      if (userRoom) {
        username = userRoom.substring(5); // strip "user:"
      }
    }

    if (!username) {
      client.emit('event', {
        type: 'error',
        data: 'Unauthorized: User context required',
      });
      return;
    }

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
          // Simulator events are restricted to admin role or allow user simulation. 
          // Let's allow users to simulate events for their own overlay testing.
          // Remove strict admin-only simulator restrictions so streamers can test their own setup!
        }
      } catch (err: any) {
        this.logger.warn(`Unauthorized WS command: ${packet.type} for ${username} - ${err.message}`);
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
          this.tiktokService.connect(username, packet.username);
        }
        break;

      case 'disconnect-stream':
        this.tiktokService.disconnect(username);
        break;

      case 'get-status':
        client.emit('event', {
          type: 'status',
          data: this.tiktokService.getStatus(username),
        });
        break;

      case 'simulate-event':
        if (packet.eventType === 'gift' || packet.eventType === 'chat') {
          this.logger.log(`Broadcasting simulated ${packet.eventType} event to room user:${username}`);
          this.server.to(`user:${username}`).emit('event', {
            type: packet.eventType,
            data: { ...packet.payload, isSimulated: true },
          });
        } else if (packet.eventType === 'settings-update') {
          if (packet.payload) {
            await this.settingsService.updateSettingsForUser(username, packet.payload);
          }
          this.server.to(`user:${username}`).emit('event', {
            type: 'settings-update',
            data: packet.payload,
          });
        } else if (packet.eventType === 'mappings-update') {
          if (packet.payload) {
            await this.settingsService.updateMappingsForUser(username, packet.payload);
          }
          this.server.to(`user:${username}`).emit('event', {
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

