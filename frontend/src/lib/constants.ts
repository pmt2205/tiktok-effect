import { MockUser } from '@/types';

// Backend URL configuration
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export const WS_URL = BACKEND_URL;

// Default overlay settings
export const DEFAULT_SETTINGS = {
  duration: 5,
  density: 2,
  theme: 'neon-pulse',
  menuEnabled: false,
  menuTitle: 'MENU QUÀ TẶNG',
  menuX: 15,
  menuY: 20,
  menuScale: 1.0,
  menuColumns: 1,
  menuLayout: 'vertical',
  menuFrame: '',
  menuFrameScale: 1.0,
  menuScrollThreshold: 5,
  jarEnabled: false,
  jarX: 75,
  jarY: 50,
  jarScale: 1.0,
  jarClearedAt: 0,
  jarGiftSize: 1.0,
  jarFallSpeed: 1.0,
  jarType: 'standard',
  jarColor: 'silver',
  jarDecorationEnabled: false,
  jarDecoration: 'pro_1',
  jarDanceEnabled: true,
  jarDancePosition: 'left',
  jarDanceScale: 1.0,
  jarDanceOffsetX: 185,
  jarDanceVideo: '/dance/capy_dance.mp4',
  jarEffectEnabled: false,
  jarEffectVideo: '/jar/effect_jar/effect1.mp4',
  jarEffectScale: 1.0,
  jarEffectX: 0,
  jarEffectY: 0,
  jarEffectDelay: 0,
  videoEnabled: true,
  soundEnabled: true,
  treeEnabled: false,
  treeType: 'standard',
  treeImage: 'tree.png',
  treeX: 20,
  treeY: 50,
  treeScale: 1.0,
  treeGiftSize: 1.0,
  treeClearedAt: 0,
  treeDebug: false,
  ttsEnabled: true,
  ttsVoice: 'auto',
  ttsRate: 1.0,
  ttsPitch: 1.0,
  ttsVolume: 1.0,
  ttsTemplate: '{nickname} nói: {comment}',
  ttsMaxChars: 100,
  ttsFilterEmoji: true,
  ttsFilterBadWords: true,
  ttsMode: 'all',
  likeLeaderboardEnabled: true,
  likeLeaderboardTitle: 'BXH TAP TAY ❤️',
  likeLeaderboardX: 78,
  likeLeaderboardY: 15,
  likeLeaderboardScale: 1.0,
  likeLeaderboardTopCount: 3,
  likeLeaderboardResetAt: 0,
};

// Mock users for simulator
export const MOCK_USERS: MockUser[] = [
  { uniqueId: 'rose_fan_99', nickname: 'Rose Giver Pro', profile: 'https://i.pravatar.cc/100?img=1' },
  { uniqueId: 'alex_gamer', nickname: 'Alex Live', profile: 'https://i.pravatar.cc/100?img=2' },
  { uniqueId: 'anna_cute', nickname: 'Anna ✨', profile: 'https://i.pravatar.cc/100?img=5' },
  { uniqueId: 'viet_stream', nickname: 'Nguyễn Văn A', profile: 'https://i.pravatar.cc/100?img=8' },
  { uniqueId: 'whale_donator', nickname: 'Mr. Whale 🐳', profile: 'https://i.pravatar.cc/100?img=12' },
];

// Mock chat messages
export const MOCK_CHATS = [
  'Hello streamer! Great content! 👍',
  'Chào mọi người nhé!',
  'OMG! That play was insane!',
  'Double tap double tap room guys! ❤️',
  'Where are you from?',
  'Nice effect setup!',
];

/**
 * Format large numbers for display (e.g. 10400 -> 10.4K)
 */
export function formatNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}
