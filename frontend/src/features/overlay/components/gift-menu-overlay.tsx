'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Gift, OverlaySettings } from '@/types';

interface GiftMenuOverlayProps {
  settings: OverlaySettings;
  giftsList: Gift[];
}

export default function GiftMenuOverlay({ settings, giftsList }: GiftMenuOverlayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isHorizontal = settings.menuLayout === 'horizontal';
  const scrollThreshold = isHorizontal ? 5 : 10;

  const menuGifts = useMemo(() => {
    return giftsList.filter(g => g.menuShow !== false && g.menuText && g.menuText.trim() !== '');
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

  return (
    <div
      className={`absolute z-20 animate-[fade-in-up_0.5s_ease-out] transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none flex flex-col gap-4 ${
        isHorizontal ? 'items-center text-center' : 'items-start'
      }`}
      style={{
        left: `${settings.menuX !== undefined ? settings.menuX : 15}%`,
        top: `${settings.menuY !== undefined ? settings.menuY : 20}%`,
        transform: `scale(${settings.menuScale !== undefined ? settings.menuScale : 1.0})`,
        transformOrigin: 'top left',
        width: isHorizontal ? '1000px' : (settings.menuColumns === 2 ? '800px' : '400px'),
      }}
    >
      {/* Title Header */}
      <div
        className={`flex flex-col select-none shrink-0 w-full ${
          isHorizontal ? 'items-center justify-center' : 'items-start'
        }`}
      >
        <h3
          className="font-header text-[1.8rem] font-extrabold text-white uppercase tracking-[2.5px] flex items-center gap-2.5 text-center"
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
        className={`min-w-0 w-full overflow-hidden flex ${
          isHorizontal ? 'flex-row items-center gap-8 justify-center' : 'flex-col gap-5'
        }`}
        style={{
          maxHeight: isHorizontal
            ? 'none'
            : (menuGifts.length > scrollThreshold
              ? (settings.menuColumns === 2 ? '380px' : '760px')
              : 'none'),
          // Premium fade effect using mask-image
          maskImage:
            menuGifts.length > scrollThreshold
              ? (isHorizontal
                ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                : 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)')
              : 'none',
          WebkitMaskImage:
            menuGifts.length > scrollThreshold
              ? (isHorizontal
                ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                : 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)')
              : 'none',
        }}
      >
        {/* Grid/Flex 1 (Original List) */}
        <div
          className={`shrink-0 ${
            isHorizontal
              ? 'flex flex-row items-center gap-8'
              : `grid gap-y-5 gap-x-8 ${settings.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
          }`}
        >
          {menuGifts.map((gift) => (
            <div
              key={gift._id}
              className="flex items-center gap-4.5 transition-all duration-200 select-none bg-transparent border-none shadow-none"
            >
              <div className="w-14 h-14 shrink-0 flex items-center justify-center relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gift.icon} alt="" className="w-11 h-11 object-contain animate-gift-bob" />
              </div>
              <div className="grow min-w-0 font-body flex items-center">
                <span
                  className="text-[1.35rem] font-extrabold text-white tracking-[0.5px] leading-snug truncate"
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
          ))}
        </div>

        {/* Grid/Flex 2 (Duplicated List for infinite scroll loop) */}
        {menuGifts.length > scrollThreshold && (
          <div
            className={`shrink-0 ${
              isHorizontal
                ? 'flex flex-row items-center gap-8'
                : `grid gap-y-5 gap-x-8 ${settings.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
            }`}
          >
            {menuGifts.map((gift) => (
              <div
                key={`${gift._id}-dup`}
                className="flex items-center gap-4.5 transition-all duration-200 select-none bg-transparent border-none shadow-none"
              >
                <div className="w-14 h-14 shrink-0 flex items-center justify-center relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gift.icon} alt="" className="w-11 h-11 object-contain animate-gift-bob" />
                </div>
                <div className="grow min-w-0 font-body flex items-center">
                  <span
                    className="text-[1.35rem] font-extrabold text-white tracking-[0.5px] leading-snug truncate"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
