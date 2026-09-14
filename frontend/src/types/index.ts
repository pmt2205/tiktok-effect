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

export interface TopGifterJoinEvent {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  totalDiamonds: number;
  rank: number;
  isSimulated?: boolean;
}

export interface LikeEvent {
  nickname: string;
  uniqueId: string;
  profilePictureUrl: string;
  likeCount: number;
  totalLikeCount?: number;
  isSimulated?: boolean;
}

export interface LikeLeaderboardItem {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
  totalLikes: number;
  rank: number;
}

export interface OverlaySettings {
  duration: number;
  density: number;
  theme: string;
  menuEnabled?: boolean;
  menuTitle?: string;
  menuX?: number;
  menuY?: number;
  menuScale?: number;
  menuColumns?: number;
  menuLayout?: string;
  menuFrame?: string;
  menuFrameScale?: number;
  menuScrollThreshold?: number;
  jarEnabled?: boolean;
  jarX?: number;
  jarY?: number;
  jarScale?: number;
  jarClearedAt?: number;
  jarGiftSize?: number;
  jarFallSpeed?: number;
  jarType?: string;
  jarColor?: string;
  jarNameEnabled?: boolean;
  jarNameImage?: string;
  jarNameScale?: number;
  jarNameX?: number;
  jarNameY?: number;
  jarDanceEnabled?: boolean;
  jarDancePosition?: string;
  jarDanceScale?: number;
  jarDanceOffsetX?: number;
  jarDanceVideo?: string;
  liveMode?: string;
  singleGiftIds?: number[];
  subscriptionTier?: 'free' | 'pro' | 'promax';
  activeNpcCategory?: string;
  allowNpc?: boolean;
  allowedNpcCategories?: string[];
  singleEnabled?: boolean;
  npcEnabled?: boolean;
  videoEnabled?: boolean;
  soundEnabled?: boolean;
  treeEnabled?: boolean;
  treeType?: string;
  treeImage?: string;
  treeX?: number;
  treeY?: number;
  treeScale?: number;
  treeGiftSize?: number;
  treeClearedAt?: number;
  treeDebug?: boolean;
  ttsEnabled?: boolean;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  ttsVolume?: number;
  ttsTemplate?: string;
  ttsMaxChars?: number;
  ttsFilterEmoji?: boolean;
  ttsFilterBadWords?: boolean;
  ttsMode?: string;
  topGifterEnabled?: boolean;
  topGifterDuration?: number;
  topGifterRankLimit?: number;
  topGifterMinDiamonds?: number;
  likeLeaderboardEnabled?: boolean;
  likeLeaderboardTitle?: string;
  likeLeaderboardX?: number;
  likeLeaderboardY?: number;
  likeLeaderboardScale?: number;
  likeLeaderboardTopCount?: number;
  likeLeaderboardResetAt?: number;
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
  activeVideo?: string;
  sounds?: string[];
  activeSound?: string;
  menuText?: string;
  menuShow?: boolean;
}

export interface NpcCategory {
  _id: string;
  name: string;
  displayName: string;
}
