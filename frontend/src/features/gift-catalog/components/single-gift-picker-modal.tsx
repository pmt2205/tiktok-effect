'use client';

/* eslint-disable @next/next/no-img-element -- Gift icons come from the TikTok catalog. */
import { useMemo, useState } from 'react';
import { Gift } from '@/types';

export default function SingleGiftPickerModal({ gifts, selectedIds, language, saving, maxGifts, onClose, onSave }: {
  gifts: Gift[];
  selectedIds: number[];
  language: 'vi' | 'en';
  saving: boolean;
  maxGifts: number;
  onClose: () => void;
  onSave: (ids: number[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [draftIds, setDraftIds] = useState(selectedIds.slice(0, maxGifts));
  const filteredGifts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return gifts.slice(0, 60);
    return gifts.filter((gift) => gift.name.toLowerCase().includes(normalized) || String(gift.giftId).includes(normalized)).slice(0, 60);
  }, [gifts, query]);

  const toggleGift = (giftId: number) => {
    setDraftIds((current) => current.includes(giftId)
      ? current.filter((id) => id !== giftId)
      : current.length < maxGifts ? [...current, giftId] : current);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="single-gift-picker-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-color bg-bg-surface shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-color p-5">
          <div>
            <h2 id="single-gift-picker-title" className="font-header text-lg font-bold text-text-main">
              {language === 'vi' ? 'Chọn quà cho Live Đơn' : 'Choose Single Live gifts'}
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              {Number.isFinite(maxGifts) ? (language === 'vi' ? `Đã chọn ${draftIds.length}/${maxGifts}.` : `${draftIds.length}/${maxGifts} selected.`) : (language === 'vi' ? `Đã chọn ${draftIds.length}. Không giới hạn.` : `${draftIds.length} selected. Unlimited.`)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-xl border border-border-color text-text-muted transition-all duration-200 hover:border-primary hover:text-text-main cursor-pointer" aria-label={language === 'vi' ? 'Đóng' : 'Close'}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={language === 'vi' ? 'Tìm tên hoặc ID quà...' : 'Search gift name or ID...'}
              className="w-full rounded-xl border border-border-color bg-bg-input py-2.5 pl-10 pr-3 text-sm text-text-main outline-none transition-all duration-200 placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredGifts.map((gift) => {
              const selected = draftIds.includes(gift.giftId);
              const disabled = !selected && draftIds.length >= maxGifts;
              return (
                <button
                  key={gift.giftId}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleGift(gift.giftId)}
                  className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_var(--color-primary-glow)]'
                      : 'border-border-color bg-bg-card hover:border-primary/40 hover:bg-bg-card-hover'
                  } disabled:cursor-not-allowed disabled:opacity-35`}
                >
                  <img src={gift.icon} alt="" className="h-10 w-10 shrink-0 object-contain" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-text-main">{gift.name}</strong>
                    <span className="text-xs text-text-muted">{gift.coins} {language === 'vi' ? 'xu' : 'coins'} · ID {gift.giftId}</span>
                  </span>
                  <i className={`fa-solid ${selected ? 'fa-circle-check text-primary text-lg' : 'fa-circle-plus text-text-muted'}`} />
                </button>
              );
            })}
          </div>
          {filteredGifts.length === 0 && (
            <p className="py-10 text-center text-sm text-text-muted">
              {language === 'vi' ? 'Không tìm thấy quà phù hợp.' : 'No matching gifts found.'}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-color p-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-border-color px-4 py-2 text-sm font-bold text-text-secondary transition-all duration-200 hover:text-text-main cursor-pointer">
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(draftIds)}
            className="keep-white rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            {saving && <i className="fa-solid fa-spinner mr-2 animate-spin" />}
            {language === 'vi' ? 'Lưu lựa chọn' : 'Save selection'}
          </button>
        </div>
      </div>
    </div>
  );
}
