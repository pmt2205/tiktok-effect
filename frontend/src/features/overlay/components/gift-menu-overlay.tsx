'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Gift, OverlaySettings } from '@/types';

interface GiftMenuOverlayProps {
  settings: OverlaySettings;
  giftsList: Gift[];
}

export default function GiftMenuOverlay({ settings, giftsList }: GiftMenuOverlayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || window.parent === window) return;
    const reportBounds = () => {
      window.parent.postMessage(
        {
          type: 'overlay-preview-target-bounds',
          target: 'menu',
          width: menu.offsetWidth,
          height: menu.offsetHeight,
        },
        window.location.origin,
      );
    };
    const observer = new ResizeObserver(reportBounds);
    observer.observe(menu);
    reportBounds();
    return () => observer.disconnect();
  }, [settings.menuScale, settings.menuColumns, settings.menuLayout, giftsList.length]);

  const isHorizontal = settings.menuLayout === 'horizontal';
  const scrollThreshold = settings.menuScrollThreshold !== undefined && settings.menuScrollThreshold > 0
    ? settings.menuScrollThreshold
    : (isHorizontal ? 5 : 10);

  const menuGifts = useMemo(() => {
    return giftsList.filter(g => g.menuShow === true && g.menuText && g.menuText.trim() !== '');
  }, [giftsList]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || menuGifts.length <= scrollThreshold) return;

    // Reset scroll offsets when changing modes
    container.scrollTop = 0;
    container.scrollLeft = 0;

    let animationFrameId: number;
    let scrollTop = container.scrollTop;
    let scrollLeft = container.scrollLeft;
    const speed = 1.5; // Scroll speed

    const scroll = () => {
      if (isHorizontal) {
        scrollLeft += speed;
        const firstGrid = container.firstElementChild as HTMLElement;
        if (firstGrid) {
          const gridWidth = firstGrid.offsetWidth;
          const gap = 32; // gap-8 (2rem = 32px)
          const cycleWidth = gridWidth + gap;

          if (scrollLeft >= cycleWidth) {
            scrollLeft = 0;
          }
        }
        container.scrollLeft = scrollLeft;
      } else {
        scrollTop += speed;
        const firstGrid = container.firstElementChild as HTMLElement;
        if (firstGrid) {
          const gridHeight = firstGrid.offsetHeight;
          const gap = 20; // gap-5 (1.25rem = 20px)
          const cycleHeight = gridHeight + gap;

          if (scrollTop >= cycleHeight) {
            scrollTop = 0;
          }
        }
        container.scrollTop = scrollTop;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [menuGifts, settings.menuColumns, settings.menuLayout, isHorizontal, scrollThreshold]);

  if (!settings.menuEnabled || menuGifts.length === 0) return null;

  // Calculate dynamic max height for vertical scrolling based on scrollThreshold
  const rows = settings.menuColumns === 2 ? Math.ceil(scrollThreshold / 2) : scrollThreshold;
  // Row height ~84px (w-16 h-16 + gap) + 24px container padding
  const calculatedMaxHeight = `${rows * 84 + 28}px`;

  const frameScale = settings.menuFrameScale !== undefined ? settings.menuFrameScale : 1.0;
  // Calculate extra side spacing for scaled frames to prevent clipping on left & text overlapping on right
  const extraSideGap = Math.max(0, (frameScale - 1.0) * 32);

  const renderGiftItem = (gift: Gift, isDup = false) => (
    <div
      key={isDup ? `${gift._id}-dup` : gift._id}
      className={`flex transition-all duration-200 select-none bg-transparent border-none shadow-none py-1 ${
        isHorizontal
          ? 'flex-col items-center text-center gap-2.5 max-w-[140px] shrink-0'
          : 'flex-row items-center gap-4.5 min-w-0'
      }`}
    >
      <div
        className="w-16 h-16 shrink-0 flex items-center justify-center relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        style={{
          marginLeft: `${extraSideGap}px`,
          marginRight: `${extraSideGap}px`,
          marginTop: isHorizontal ? `${extraSideGap}px` : undefined,
          marginBottom: isHorizontal ? `${extraSideGap}px` : undefined,
        }}
      >
        {/* Gift Icon with Fallback */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gift.icon || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png'}
          alt=""
          className="w-10 h-10 object-contain animate-gift-bob z-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
          }}
        />
        
        {/* Optional Custom Frame */}
        {settings.menuFrame && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`/frame/${settings.menuFrame}`}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-transform duration-150"
            style={{
              transform: `scale(${frameScale})`,
            }}
          />
        )}
      </div>
      <div className={`font-body flex items-center relative z-20 ${isHorizontal ? 'w-full justify-center text-center' : 'grow min-w-0'}`}>
        <span
          className={`font-extrabold text-white tracking-[0.5px] leading-snug ${
            isHorizontal
              ? 'text-[1.15rem] text-center line-clamp-2 max-w-[130px] break-words'
              : 'text-[1.35rem] truncate'
          }`}
          style={{
            textShadow:
              settings.theme === 'cyberpunk'
                ? '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(255, 0, 80, 0.5)'
                : '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0, 242, 254, 0.5)',
          }}
        >
          {gift.menuText}
        </span>
      </div>
    </div>
  );

  return (
    <div
      ref={menuRef}
      data-overlay-preview-target="menu"
      className="absolute z-20 animate-[fade-in-up_0.5s_ease-out] pointer-events-none select-none bg-transparent border-none shadow-none flex flex-col gap-4 items-start text-left"
      style={{
        left: `${settings.menuX !== undefined ? settings.menuX : 15}%`,
        top: `${settings.menuY !== undefined ? settings.menuY : 20}%`,
        transform: `scale(${settings.menuScale !== undefined ? settings.menuScale : 1.0})`,
        transformOrigin: 'top left',
        maxWidth: isHorizontal
          ? `calc(100vw - ${settings.menuX !== undefined ? settings.menuX : 15}%)`
          : (settings.menuColumns === 2 ? '800px' : '400px'),
      }}
    >
      {/* Title Header */}
      <div className="flex flex-col select-none shrink-0 w-full items-start justify-start">
        <h3
          className="font-header text-[1.8rem] font-extrabold text-white uppercase tracking-[2.5px] flex items-center gap-2.5 text-left"
          style={{
            textShadow:
              settings.theme === 'cyberpunk'
                ? '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(255, 0, 80, 0.6)'
                : '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0, 242, 254, 0.6)',
          }}
        >
          {settings.menuTitle || ' '}
        </h3>
      </div>

      {/* List items container with auto-scroll if items > threshold */}
      <div
        ref={scrollContainerRef}
        className={`min-w-0 w-full overflow-hidden flex py-4 px-2 ${
          isHorizontal ? 'flex-row items-start gap-8 justify-start' : 'flex-col gap-4'
        }`}
        style={{
          maxHeight: isHorizontal
            ? 'none'
            : (menuGifts.length > scrollThreshold ? calculatedMaxHeight : 'none'),
          // Smooth subtle fade mask on top & bottom when scrolling
          maskImage:
            menuGifts.length > scrollThreshold
              ? (isHorizontal
                ? 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)'
                : 'linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)')
              : 'none',
          WebkitMaskImage:
            menuGifts.length > scrollThreshold
              ? (isHorizontal
                ? 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)'
                : 'linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)')
              : 'none',
        }}
      >
        {/* Grid/Flex 1 (Original List) */}
        <div
          className={`shrink-0 ${
            isHorizontal
              ? 'flex flex-row items-start gap-8'
              : `grid gap-y-4 gap-x-8 ${settings.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
          }`}
        >
          {menuGifts.map((gift) => renderGiftItem(gift, false))}
        </div>

        {/* Grid/Flex 2 (Duplicated List for infinite scroll loop) */}
        {menuGifts.length > scrollThreshold && (
          <div
            className={`shrink-0 ${
              isHorizontal
                ? 'flex flex-row items-start gap-8'
                : `grid gap-y-4 gap-x-8 ${settings.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
            }`}
          >
            {menuGifts.map((gift) => renderGiftItem(gift, true))}
          </div>
        )}
      </div>
    </div>
  );
}
