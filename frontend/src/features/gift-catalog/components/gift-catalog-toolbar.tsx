import React from 'react';
import Select from '@/components/ui/select';

type CoinRange = { id: string; labelVi: string; labelEn: string };

export default function GiftCatalogToolbar({ language, searchQuery, onSearchChange, coinRange, coinRanges, onCoinRangeChange, videoEnabled, soundEnabled, disabled, onVideoChange, onSoundChange }: { language: 'vi' | 'en'; searchQuery: string; onSearchChange: (value: string) => void; coinRange: string; coinRanges: CoinRange[]; onCoinRangeChange: (value: string) => void; videoEnabled: boolean; soundEnabled: boolean; disabled: boolean; onVideoChange: (value: boolean) => void; onSoundChange: (value: boolean) => void }) {
  return (
    <div className="glass-card flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 w-full p-3 rounded-2xl border border-border-color backdrop-blur-md relative z-30">
      <div className="relative w-full lg:max-w-xs shrink-0">
        <input
          type="text"
          placeholder={language === 'vi' ? 'Tìm theo tên, ID hoặc số xu...' : 'Search name, ID or coins...'}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-bg-input border border-border-color rounded-xl pl-9 pr-8 py-2 text-text-main font-body text-[0.82rem] outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
        />
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[0.8rem]" />
        {searchQuery && (
          <button type="button" onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 select-none">
        <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[0.78rem] font-bold cursor-pointer transition-colors ${videoEnabled ? 'bg-primary/15 border-primary text-text-main' : 'bg-bg-input border-border-color text-text-muted'}`}>
          <input type="checkbox" checked={videoEnabled} onChange={(event) => onVideoChange(event.target.checked)} className="sr-only" disabled={disabled} />
          <i className="fa-solid fa-video text-primary" />
          <span>{language === 'vi' ? 'Video quà' : 'Gift Video'}</span>
        </label>
        <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[0.78rem] font-bold cursor-pointer transition-colors ${soundEnabled ? 'bg-primary/15 border-primary text-text-main' : 'bg-bg-input border-border-color text-text-muted'}`}>
          <input type="checkbox" checked={soundEnabled} onChange={(event) => onSoundChange(event.target.checked)} className="sr-only" disabled={disabled} />
          <i className="fa-solid fa-volume-high text-primary" />
          <span>{language === 'vi' ? 'Âm thanh' : 'Sound'}</span>
        </label>
      </div>

      <Select value={coinRange} options={coinRanges.map((range) => ({ value: range.id, label: language === 'vi' ? range.labelVi : range.labelEn }))} onChange={onCoinRangeChange} className="mb-0 w-full sm:w-52 shrink-0" />
    </div>
  );
}
