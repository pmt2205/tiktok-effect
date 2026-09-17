'use client';

import React, { useState } from 'react';
import { OverlaySettings } from '@/types';
import { TREE_OPTIONS } from '../lib/tree-options';
import LiveOverlayViewport from '@/features/user-dashboard/components/live-overlay-viewport';
import OverlayPreviewControls from '@/features/overlay-designers/components/overlay-preview-controls';

interface GiftTreeDesignerPanelProps {
  language: 'vi' | 'en';
  settings: OverlaySettings;
  savingSettings: boolean;
  onSaveSettings: (updates: Partial<OverlaySettings>) => Promise<void>;
  onSimulateEvent?: (eventType: string, payload: unknown) => void;
  fullOptions?: boolean;
}

export default function GiftTreeDesignerPanel({
  language,
  settings,
  savingSettings,
  onSaveSettings,
  onSimulateEvent,
  fullOptions = false,
}: GiftTreeDesignerPanelProps) {
  const [localX, setLocalX] = useState(settings.treeX !== undefined ? settings.treeX : 20);
  const [localY, setLocalY] = useState(settings.treeY !== undefined ? settings.treeY : 50);
  const [localScale, setLocalScale] = useState(settings.treeScale !== undefined ? settings.treeScale : 1.0);
  const [localGiftSize, setLocalGiftSize] = useState(settings.treeGiftSize !== undefined ? settings.treeGiftSize : 1.0);

  const handleToggleTree = (enabled: boolean) => {
    onSaveSettings({ treeEnabled: enabled });
  };

  const handleSliderChange = (field: 'giftSize', val: number) => {
    if (field === 'giftSize') {
      setLocalGiftSize(val);
    }
  };

  const handleSliderRelease = (field: 'giftSize', val: number) => {
    if (field === 'giftSize') {
      onSaveSettings({ treeGiftSize: val });
    }
  };

  const handleClearTree = () => {
    onSaveSettings({ treeClearedAt: Date.now() });
  };

  const handleSimulateDrop = (count: number) => {
    if (!onSimulateEvent) return;
    onSimulateEvent('gift', {
      nickname: 'Simulated Fan',
      uniqueId: 'simulated_fan',
      giftName: 'Rose',
      repeatCount: count,
      diamondCount: count,
      giftPictureUrl: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png',
      profilePictureUrl: 'https://i.pravatar.cc/100',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,480px)_minmax(0,1fr)] w-full items-start animate-[fade-in-up_0.4s_ease-out]">
      {/* Left Column: Settings Form */}
      <div className="order-2 min-w-0 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-tree text-primary animate-pulse" />
            <span>{language === 'vi' ? 'Thiết lập Cây Quà' : 'Gift Tree Settings'}</span>
          </h4>
          <p className="text-[0.7rem] text-text-muted">
            {language === 'vi' ? 'Tùy chỉnh cây quà nở icon của người xem tặng trên OBS.' : 'Customize your interactive viewer gift tree on OBS.'}
          </p>
        </div>

        {/* Enable Toggle */}
        <div className="flex justify-between items-center py-2 select-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.85rem] text-text-secondary font-bold">
              {language === 'vi' ? 'Hiển thị Cây Quà:' : 'Show Gift Tree:'}
            </span>
            <span className="text-[0.68rem] text-text-muted">
              {language === 'vi' ? 'Bật/tắt cây quà trên màn hình livestream' : 'Enable/disable gift tree on overlay'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={settings.treeEnabled || false} 
              onChange={(e) => handleToggleTree(e.target.checked)} 
              className="peer sr-only"
              disabled={savingSettings}
            />
            <span className="w-10 h-[20px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
          </label>
        </div>

        {/* Sub-settings visible only when Tree is Enabled */}
        {settings.treeEnabled && (
          <div className="flex flex-col gap-5 animate-[fade-in-up_0.25s_ease-out]">
            {/* Debug Coordinates Toggle */}
            <div className="flex justify-between items-center py-2 select-none border-t border-border-color/20 pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.85rem] text-text-secondary font-bold">
                  {language === 'vi' ? 'Định vị tọa độ cành (Debug):' : 'Debug Coordinates:'}
                </span>
                <span className="text-[0.68rem] text-text-muted">
                  {language === 'vi' ? 'Hiển thị chấm xanh và số hiệu tọa độ (X, Y) từng cành để dễ chỉnh sửa' : 'Show green dots with (X, Y) numbers on OBS'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={settings.treeDebug || false} 
                  onChange={(e) => onSaveSettings({ treeDebug: e.target.checked })} 
                  className="peer sr-only"
                  disabled={savingSettings}
                />
                <span className="w-10 h-[20px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
              </label>
            </div>

            {/* Tree Model Selector */}
            <div className="flex flex-col gap-2.5 border-t border-border-color/20 pt-3">
              <label className="text-[0.8rem] text-text-secondary font-bold select-none flex items-center justify-between">
                <span>{language === 'vi' ? 'Mẫu Cây Quà:' : 'Gift Tree Model:'}</span>
                <span className="text-[0.7rem] text-primary font-mono font-bold">
                  {TREE_OPTIONS.find(t => t.id === (settings.treeType || 'standard'))?.[language === 'vi' ? 'nameVi' : 'nameEn']}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TREE_OPTIONS.map((tree) => {
                  const isSelected = (settings.treeType || 'standard') === tree.id;
                  return (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() => onSaveSettings({ treeType: tree.id, treeImage: tree.file })}
                      disabled={savingSettings || (!fullOptions && tree.id !== 'standard')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer outline-none relative overflow-hidden ${
                        isSelected
                          ? 'bg-primary/15 border-primary shadow-[0_0_12px_var(--color-primary-glow)] text-white scale-[1.02]'
                          : 'bg-bg-surface border-border-color hover:border-primary/40 text-text-muted hover:text-white'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {/* PRO Badge */}
                      {tree.isPro && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[0.58rem] font-extrabold uppercase bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_6px_var(--color-primary-glow)]">
                          PRO
                        </div>
                      )}

                      {/* Thumbnail Image */}
                      <div className="w-20 h-20 relative flex items-center justify-center mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/tree/${tree.file}`}
                          alt={tree.nameVi}
                          className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                        />
                      </div>

                      <span className="text-[0.75rem] font-bold leading-tight text-center">
                        {language === 'vi' ? tree.nameVi : tree.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift Size Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
                <span>{language === 'vi' ? 'Kích thước icon quả:' : 'Gift Icon Size:'}</span>
                <span className="text-primary font-mono font-bold">{localGiftSize.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localGiftSize}
                onChange={(e) => handleSliderChange('giftSize', Number(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('giftSize', Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('giftSize', Number((e.target as HTMLInputElement).value))}
                disabled={savingSettings}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Left Column: Interactive Preview, Actions & Tips */}
      <div className="contents">
        {/* Live Overlay Viewport */}
        <LiveOverlayViewport
          enabled={settings.treeEnabled || false}
          showHeader={false}
          className="order-1 lg:row-span-2 !border-0 !bg-transparent !p-0 !backdrop-blur-none"
          viewportClassName="max-w-[420px] xl:max-w-[480px]"
          previewTarget="tree"
          previewSettings={{ ...settings, treeX: localX, treeY: localY, treeScale: localScale }}
          interactionLayer={(
            <OverlayPreviewControls
              x={localX}
              y={localY}
              scale={localScale}
              target="tree"
              settingKeys={{ x: 'treeX', y: 'treeY', scale: 'treeScale' }}
              label={language === 'vi' ? 'Kéo để di chuyển' : 'Drag to move'}
              disabled={savingSettings}
              maxScale={2.5}
              onChange={(next) => {
                setLocalX(next.x);
                setLocalY(next.y);
                setLocalScale(next.scale);
              }}
              onCommit={(next) => {
                void onSaveSettings({ treeX: next.x, treeY: next.y, treeScale: next.scale });
              }}
            />
          )}
        />

        <div className="order-3 bg-bg-card border border-border-color rounded-2xl p-5 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">

        {settings.treeEnabled && (
          <div className="flex flex-col gap-5 animate-[fade-in-up_0.25s_ease-out]">
            <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
              <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
                <i className="fa-solid fa-broom text-primary animate-pulse" />
                <span>{language === 'vi' ? 'Hành động nhanh' : 'Quick Actions'}</span>
              </h4>
              <p className="text-[0.7rem] text-text-muted">
                {language === 'vi' ? 'Thực hiện rung cây rụng quà hoặc kiểm tra hoạt động cây quà.' : 'Reset the tree states or test swaying physics in real-time.'}
              </p>
            </div>

            {/* Clear Tree Button */}
            <div className="flex flex-col gap-3">
              <span className="text-[0.82rem] text-text-secondary font-bold select-none">
                {language === 'vi' ? 'Dọn dẹp cây quà (Làm rụng quà):' : 'Clear Tree (Drop gifts):'}
              </span>
              <button
                type="button"
                onClick={handleClearTree}
                disabled={savingSettings}
                className="w-full py-2.5 rounded-xl text-[0.8rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_4px_16px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              >
                <i className="fa-solid fa-wind mr-2" />
                {language === 'vi' ? 'Thổi rụng toàn bộ quả' : 'Shake off all gifts'}
              </button>
            </div>

            {/* Simulate Drop Button */}
            {onSimulateEvent && (
              <div className="flex flex-col gap-3">
                <span className="text-[0.82rem] text-text-secondary font-bold select-none">
                  {language === 'vi' ? 'Chạy thử nở quà:' : 'Test blooming physics:'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSimulateDrop(1)}
                    disabled={savingSettings}
                    className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-primary text-white hover:shadow-[0_4px_12px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                  >
                    <i className="fa-solid fa-gift mr-1.5" />
                    {language === 'vi' ? 'Nở 1 Quà' : 'Bloom 1 Gift'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateDrop(5)}
                    disabled={savingSettings}
                    className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_4px_12px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                  >
                    <i className="fa-solid fa-gifts mr-1.5" />
                    {language === 'vi' ? 'Nở Combo x5' : 'Bloom Combo x5'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Box */}
        <div className="p-4 bg-bg-input border border-border-color rounded-2xl text-[0.72rem] text-text-muted select-none flex flex-col gap-2 mt-2">
          <div className="font-bold text-text-secondary flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-primary" />
            <span>Interactive Gift Tree Tips</span>
          </div>
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>
              {language === 'vi'
                ? 'Khi người xem tặng quà trên live, các icon quà sẽ nở dần (bloom) từ cành cây.'
                : 'Falling gift icons bloom on the branches automatically when viewer sends a gift.'}
            </li>
            <li>
              {language === 'vi'
                ? 'Cây quà đung đưa nhẹ theo gió. Khi cành cây đã đầy quả, quà mới sẽ làm rụng quà cũ xuống đất.'
                : 'The tree sways gently in the wind. When branches are full, new gifts knock older ones down.'}
            </li>
            <li>
              {language === 'vi'
                ? 'Bạn có thể thổi rụng toàn bộ quả trên cây bất kỳ lúc nào bằng nút "Thổi rụng toàn bộ quả".'
                : 'Click "Shake off all gifts" to blow all blooming particles off the tree branches.'}
            </li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}
