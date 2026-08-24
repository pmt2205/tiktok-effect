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
import { ChatService } from '../chat/chat.service';
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
    private readonly chatService: ChatService,
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

    // Register NPC Gifts change callback to broadcast to specific user rooms
    this.giftsService.registerNpcChangeCallback((appUsername, category, gifts) => {
      this.settingsService.getSettingsForUser(appUsername).then(settings => {
        if (settings.liveMode === 'npc' && settings.activeNpcCategory === category) {
          this.server.to(`user:${appUsername}`).emit('event', { type: 'gifts-update', data: gifts });
        }
      }).catch(err => {
        this.logger.error(`Failed to check settings for NPC gifts update: ${err.message}`);
      });
    });

    // Register Settings/Mappings change callbacks to broadcast to specific user rooms
    this.settingsService.registerCallbacks({
      onSettingsUpdate: async (appUsername, settings) => {
        this.logger.log(`Broadcasting settings-update to room user:${appUsername}`);
        this.server.to(`user:${appUsername}`).emit('event', { type: 'settings-update', data: settings });
        try {
          const activeGifts = settings.liveMode === 'npc'
            ? await this.giftsService.findAllNpcGiftsForUser(appUsername, settings.activeNpcCategory)
            : await this.giftsService.findAllForUser(appUsername);
          this.server.to(`user:${appUsername}`).emit('event', { type: 'gifts-update', data: activeGifts });
        } catch (err: any) {
          this.logger.error(`Failed to broadcast dynamic gifts update on settings update: ${err.message}`);
        }
      },
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
    let settings: any = null;
    try {
      settings = await this.settingsService.getSettingsForUser(username);
      client.emit('event', {
        type: 'settings-update',
        data: settings,
      });
    } catch (err) {
      this.logger.error(`Failed to send settings to new client ${client.id}:`, err);
    }



    // Send database custom gifts for this user
    try {
      const dbGifts = (settings && settings.liveMode === 'npc')
        ? await this.giftsService.findAllNpcGiftsForUser(username, settings.activeNpcCategory)
        : await this.giftsService.findAllForUser(username);
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
    let isAdmin = false;
 
    // Verify token for administrative/mutation commands
    try {
      if (packet.token) {
        const decoded = this.jwtService.verify(packet.token);
        username = decoded.username;
        isAdmin = decoded.role === 'admin';
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
 
    // Admins can specify targetUsername to connect, disconnect, or simulate events for other users
    const targetUsername = (isAdmin && packet.targetUsername) ? packet.targetUsername : username;
 
    const adminCommands = ['connect-stream', 'disconnect-stream', 'simulate-event', 'subscribe-streamer'];
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
      case 'subscribe-streamer':
        if (isAdmin && packet.streamerUsername) {
          // Leave other streamer rooms to clean up subscriptions
          const rooms = Array.from(client.rooms);
          for (const room of rooms) {
            if (room.startsWith('user:')) {
              await client.leave(room);
            }
          }
          await client.join(`user:${packet.streamerUsername}`);
          this.logger.log(`Admin client ${client.id} subscribed to room user:${packet.streamerUsername}`);
 
          // Emit the initial payload values for the selected streamer
          client.emit('event', {
            type: 'status',
            data: this.tiktokService.getStatus(packet.streamerUsername),
          });
 
          const gifts = this.tiktokService.getAvailableGifts(packet.streamerUsername);
          if (gifts && gifts.length > 0) {
            client.emit('event', {
              type: 'gifts-list',
              data: gifts,
            });
          }
 
          let settings: any = null;
          try {
            settings = await this.settingsService.getSettingsForUser(packet.streamerUsername);
            client.emit('event', {
              type: 'settings-update',
              data: settings,
            });
          } catch (err) {
            this.logger.error(`Failed to send settings for streamer ${packet.streamerUsername}:`, err);
          }
 
          try {
            const dbGifts = (settings && settings.liveMode === 'npc')
              ? await this.giftsService.findAllNpcGiftsForUser(packet.streamerUsername, settings.activeNpcCategory)
              : await this.giftsService.findAllForUser(packet.streamerUsername);
            client.emit('event', {
              type: 'gifts-update',
              data: dbGifts,
            });
          } catch (err) {
            this.logger.error(`Failed to send database gifts for streamer ${packet.streamerUsername}:`, err);
          }
        }
        break;
 
      case 'connect-stream':
        if (packet.username) {
          this.tiktokService.connect(targetUsername, packet.username);
        }
        break;
 
      case 'disconnect-stream':
        this.tiktokService.disconnect(targetUsername);
        break;
 
      case 'get-status':
        client.emit('event', {
          type: 'status',
          data: this.tiktokService.getStatus(targetUsername),
        });
        break;
 
      case 'simulate-event':
        if (packet.eventType === 'gift' || packet.eventType === 'chat') {
          this.logger.log(`Broadcasting simulated ${packet.eventType} event to room user:${targetUsername}`);
          this.server.to(`user:${targetUsername}`).emit('event', {
            type: packet.eventType,
            data: { ...packet.payload, isSimulated: true },
          });
        } else if (packet.eventType === 'settings-update') {
          if (packet.payload) {
            const updatedSettings = await this.settingsService.updateSettingsForUser(targetUsername, packet.payload);
            this.server.to(`user:${targetUsername}`).emit('event', {
              type: 'settings-update',
              data: updatedSettings,
            });
          }
        }
        break;

      case 'send-chat-message':
        if (packet.receiver && packet.message && username) {
          try {
            const savedMsg = await this.chatService.createMessage(username, packet.receiver, packet.message);
            this.server.to(`user:${username}`).emit('event', {
              type: 'chat-message',
              data: savedMsg,
            });
            this.server.to(`user:${packet.receiver}`).emit('event', {
              type: 'chat-message',
              data: savedMsg,
            });
          } catch (err: any) {
            this.logger.error(`Failed to handle chat message command: ${err.message}`);
            client.emit('event', {
              type: 'error',
              data: 'Failed to process chat message',
            });
          }
        }
        break;
 
      default:
        this.logger.warn(`Unknown command type: ${packet.type}`);
    }
  }
}

