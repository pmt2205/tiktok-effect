import React from 'react';
import { UserSubTab } from '@/components/layout/user-sidebar';

const items: Array<{ tab: UserSubTab; icon: string; accent: 'primary' | 'secondary'; vi: string; en: string }> = [
  { tab: 'catalog', icon: 'fa-gift', accent: 'secondary', vi: 'Danh mục quà', en: 'Gift Catalog' },
  { tab: 'menu', icon: 'fa-layer-group', accent: 'primary', vi: 'Menu quà', en: 'Gift Menu' },
  { tab: 'jar', icon: 'fa-box-archive', accent: 'secondary', vi: 'Hũ quà', en: 'Gift Jar' },
  { tab: 'tree', icon: 'fa-tree', accent: 'primary', vi: 'Cây quà', en: 'Gift Tree' },
  { tab: 'tts', icon: 'fa-volume-high', accent: 'secondary', vi: 'Giọng nói TTS', en: 'Text-to-Speech' },
  { tab: 'topgifter', icon: 'fa-crown', accent: 'primary', vi: 'Top Gifter', en: 'Top Gifter Alert' },
  { tab: 'likeleaderboard', icon: 'fa-heart', accent: 'primary', vi: 'BXH Tap Tay', en: 'Like Leaderboard' },
];

export default function QuickFeatureShortcuts({ language, onSelect }: { language: 'vi' | 'en'; onSelect?: (tab: UserSubTab) => void }) {
  return <section className="flex flex-col gap-4"><h3 className="font-header text-lg font-extrabold text-white flex items-center gap-2"><i className="fa-solid fa-wand-magic-sparkles text-secondary" /><span>{language === 'vi' ? 'Lối tắt chức năng' : 'Feature Shortcuts'}</span></h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{items.map((item) => { const primary = item.accent === 'primary'; return <button key={item.tab} type="button" onClick={() => onSelect?.(item.tab)} className={`glass-card rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 ${primary ? 'hover:border-primary/50' : 'hover:border-secondary/50'}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${primary ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'}`}><i className={`fa-solid ${item.icon}`} /></span><span className="mt-3 block font-header text-base font-bold text-white">{language === 'vi' ? item.vi : item.en}</span><span className="mt-1 block text-xs text-text-muted">{language === 'vi' ? 'Mở thiết lập hiệu ứng' : 'Open effect settings'}</span></button>; })}</div></section>;
}
