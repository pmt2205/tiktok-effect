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
  repeatEnd?: boolean;
  giftType?: number;
  giftId?: number;
}

export interface RoomUserEvent {
  viewerCount: number;
}

export interface OverlaySettings {
  duration: number;
  density: number;
  theme: string;
  menuEnabled: boolean;
  menuTitle: string;
  menuX: number;
  menuY: number;
  menuScale: number;
  menuColumns: number;
}

export interface GiftMapping {
  effect: string;
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
