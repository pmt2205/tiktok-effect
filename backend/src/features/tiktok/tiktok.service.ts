import { Injectable, Logger } from '@nestjs/common';
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { TiktokStatus, ChatEvent, GiftEvent } from '../../common/interfaces/events.interface';

@Injectable()
export class TiktokService {
  private readonly logger = new Logger(TiktokService.name);

  private connection: any = null;
  private username = '';
  private status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private viewerCount = 0;
  private lastError: string | null = null;

  // Callback functions set by the WebSocket gateway
  private onStatusChange?: (status: TiktokStatus) => void;
  private onChat?: (data: ChatEvent) => void;
  private onGift?: (data: GiftEvent) => void;
  private onRoomUser?: (data: { viewerCount: number }) => void;

  registerCallbacks(callbacks: {
    onStatusChange: (status: TiktokStatus) => void;
    onChat: (data: ChatEvent) => void;
    onGift: (data: GiftEvent) => void;
    onRoomUser: (data: { viewerCount: number }) => void;
  }) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onChat = callbacks.onChat;
    this.onGift = callbacks.onGift;
    this.onRoomUser = callbacks.onRoomUser;
  }

  getStatus(): TiktokStatus {
    return {
      status: this.status,
      username: this.username,
      viewerCount: this.viewerCount,
      error: this.lastError,
    };
  }

  private setConnectionStatus(newStatus: 'disconnected' | 'connecting' | 'connected', error: string | null = null) {
    this.status = newStatus;
    this.lastError = error;
    if (newStatus === 'disconnected') {
      this.viewerCount = 0;
    }

    const statusData = this.getStatus();
    this.onStatusChange?.(statusData);
    this.logger.log(`Status: ${newStatus}, User: ${this.username}, Error: ${error}`);
  }

  connect(username: string) {
    if (!username) return;

    // Clean up existing connection
    this.disconnect();

    this.username = username;
    this.setConnectionStatus('connecting');

    try {
      this.connection = new TikTokLiveConnection(username, {
        enableExtendedGiftInfo: false,
      });

      this.connection
        .connect()
        .then((state: any) => {
          this.setConnectionStatus('connected');
          this.logger.log(`Successfully connected to room ID: ${state.roomId}`);
        })
        .catch((err: Error) => {
          this.logger.error('Failed to connect:', err);
          this.setConnectionStatus(
            'disconnected',
            err.message || 'Failed to connect. Check if username is correct or stream is live.',
          );
        });

      // Chat handler
      this.connection.on('chat', (data: any) => {
        const chatData: ChatEvent = {
          nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
          uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
          comment: data.comment,
          profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
        };
        this.onChat?.(chatData);
      });

      // Gift handler
      this.connection.on('gift', (data: any) => {
        const giftData: GiftEvent = {
          nickname: data.nickname || data.user?.nickname || data.uniqueId || 'Anonymous',
          uniqueId: data.uniqueId || data.user?.uniqueId || 'anonymous',
          giftName: data.giftName || data.gift?.gift_name || 'Rose',
          repeatCount: data.repeatCount || 1,
          diamondCount: data.diamondCount || 0,
          giftPictureUrl: data.giftPictureUrl || data.giftDetails?.giftImage?.url_list?.[0] || '',
          profilePictureUrl: data.profilePictureUrl || data.user?.avatarMedium?.url_list?.[0] || '',
          isSimulated: false,
        };
        this.onGift?.(giftData);
      });

      // Viewer count handler
      this.connection.on('roomUser', (data: any) => {
        if (data.viewerCount !== undefined) {
          this.viewerCount = data.viewerCount;
          this.onRoomUser?.({ viewerCount: this.viewerCount });
        }
      });

      // Disconnect handler
      this.connection.on('disconnected', () => {
        this.logger.log('Connection closed by remote host.');
        this.setConnectionStatus('disconnected', 'Stream connection ended or username went offline.');
      });

      // Error handler
      this.connection.on('error', (err: Error) => {
        this.logger.error('Connector error:', err);
      });
    } catch (err: any) {
      this.logger.error('Initialization error:', err);
      this.setConnectionStatus('disconnected', err.message);
    }
  }

  disconnect() {
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (err) {
        this.logger.error('Error disconnecting:', err);
      }
      this.connection = null;
    }
    this.username = '';
    this.setConnectionStatus('disconnected');
  }
}
