// Shared event type definitions used across backend modules

export interface TiktokStatus {
  status: 'disconnected' | 'connecting' | 'connected';
  username: string;
  viewerCount: number;
  error: string | null;
}

export interface ChatEvent {
  nickname: string;
  uniqueId: string;
  comment: string;
  profilePictureUrl: string;
}

export interface GiftEvent {
  nickname: string;
  uniqueId: string;
  giftName: string;
  repeatCount: number;
  diamondCount: number;
  giftPictureUrl: string;
  profilePictureUrl: string;
  isSimulated: boolean;
}

export interface RoomUserEvent {
  viewerCount: number;
}

export interface OverlaySettings {
  soundEnabled: boolean;
  duration: number;
  density: number;
  theme: string;
}

export interface GiftMapping {
  effect: string;
  sound: string;
  videoUrl?: string;
}

export type GiftMappings = Record<string, GiftMapping>;

export interface WsPacket {
  type: string;
  data?: any;
  username?: string;
  eventType?: string;
  payload?: any;
}
