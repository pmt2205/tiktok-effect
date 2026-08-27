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
  jarEnabled: false,
  jarX: 75,
  jarY: 50,
  jarScale: 1.0,
  jarClearedAt: 0,
  jarGiftSize: 1.0,
  jarFallSpeed: 1.0,
  jarType: 'standard',
  jarColor: 'silver',
};

// Default gift mappings
export const DEFAULT_MAPPINGS = {
  rose: { effect: 'video', videoUrl: 'rose.mp4' },
  'hoa hồng': { effect: 'video', videoUrl: 'rose.mp4' },
  galaxy: { effect: 'star' },
  lion: { effect: 'star' },
  tiktok: { effect: 'video', videoUrl: 'tiktok.mp4' },
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

// Gift pictures map
export const GIFT_PICTURES: Record<string, string> = {
  Rose: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png',
  Galaxy: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/galaxy.png',
  Lion: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/lion.png',
  Cap: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/cap.png',
};

// Density levels
export const DENSITY_LEVELS = ['Low', 'Medium', 'High'];

// Effect options for mapping form
export const EFFECT_OPTIONS = [
  { value: 'rose-petal', label: 'Rose Petals' },
  { value: 'star', label: 'Cosmic Blast' },
  { value: 'sparkle', label: 'Gold Stars' },
  { value: 'video', label: 'Green Screen Video (.mp4)' },
];

// Theme options
export const THEME_OPTIONS = [
  { value: 'neon-pulse', label: 'Neon Pulse (Default)' },
  { value: 'glassmorphism', label: 'Minimal Glass' },
  { value: 'cyberpunk', label: 'Cyberpunk Glow' },
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
