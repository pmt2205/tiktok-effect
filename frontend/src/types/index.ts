// Shared TypeScript type definitions for the frontend

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
  isSimulated?: boolean;
}

export interface GiftEvent {
  nickname: string;
  uniqueId: string;
  giftName: string;
  repeatCount: number;
  diamondCount: number;
  giftPictureUrl: string;
  profilePictureUrl: string;
  isSimulated?: boolean;
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
}

export interface GiftMapping {
  effect: string;
  videoUrl?: string;
}

export type GiftMappings = Record<string, GiftMapping>;

export interface WsEventPacket {
  type: string;
  data?: unknown;
}

export interface LogEntry {
  id: string;
  time: string;
  tag: string;
  message: string;
  className: string;
}

export interface MockUser {
  uniqueId: string;
  nickname: string;
  profile: string;
}

export interface BannerInfo {
  bannerEl?: HTMLDivElement;
  timer: ReturnType<typeof setTimeout>;
  combo: number;
  lastRepeatEnd?: boolean;
}

export interface Gift {
  _id?: string;
  giftId: number;
  name: string;
  coins: number;
  icon: string;
  videos: string[];
}
