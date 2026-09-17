'use client';

import { useState } from 'react';
import Image from 'next/image';
import VideoEffectCard from './video-effect-card';
import { DEMO_TABS, demoJars, demoMenuFrames, demoVideos } from '../lib/landing-data';
import type { LandingImage, LandingVideo } from '../types';

interface DemoShowcaseSectionProps {
  onOpenImage: (item: LandingImage) => void;
  onOpenVideo: (item: LandingVideo) => void;
}

export default function DemoShowcaseSection({ onOpenImage, onOpenVideo }: DemoShowcaseSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'jar' | 'frame' | 'topgifter' | 'sandbox'>('all');
  const [videoPage, setVideoPage] = useState(1);
  const videosPerPage = 6;
  const totalVideoPages = Math.ceil(demoVideos.length / videosPerPage);
  const paginatedVideos = demoVideos.slice((videoPage - 1) * videosPerPage, videoPage * videosPerPage);

  return (
    <section id="demo" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="keep-white rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-extrabold uppercase text-secondary">
              KHU VỰC DEMO HIỆU ỨNG LIVE
            </span>
            <h2 className="mt-4 font-header text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Trải Nghiệm Thực Tế Video & Overlay 3D
            </h2>
            <p className="mt-4 text-base text-text-muted">
              Rê chuột vào thẻ video để phát nhanh hoặc bấm để phóng to 4K. Khám phá bộ sưu tập hũ quà 3D, vinh danh Top Gifter & dùng thử Simulator!
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {DEMO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-header text-xs font-bold transition-all duration-300 cursor-pointer sm:text-sm ${
                  activeTab === tab.id
                    ? 'keep-white bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_16px_var(--color-primary-glow)]'
                    : 'border border-border-color bg-white/5 text-text-secondary hover:border-secondary/50 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 1. Multiple Video Effects Grid (Vertical Box 9:16, No Text, 6 Videos per Page) */}
          {(activeTab === 'all' || activeTab === 'video') && (
            <div className="mt-12">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-color pb-3">
                <div>
                  <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
                    <span>Bộ Sưu Tập Video Hiệu Ứng Gift (Vertical Overlay • Hover Xem Thử • Click 4K)</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-secondary">
                  <span>{videoPage}/{totalVideoPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {paginatedVideos.map((item) => (
                  <VideoEffectCard
                    key={item.id}
                    item={item}
                    onOpenModal={(video) => onOpenVideo(video)}
                  />
                ))}
              </div>

              {/* 6 Videos per Page Pagination Controls */}
              {totalVideoPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                    disabled={videoPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-color bg-white/5 text-xs font-bold text-text-muted hover:border-secondary hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>

                  {Array.from({ length: totalVideoPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setVideoPage(pageNum)}
                        className={`h-9 min-w-9 rounded-xl px-3 text-xs font-bold transition-all duration-300 cursor-pointer ${
                          videoPage === pageNum
                            ? 'keep-white bg-gradient-to-r from-primary to-secondary text-white shadow-[0_2px_10px_var(--color-primary-glow)]'
                            : 'border border-border-color bg-white/5 text-text-muted hover:border-secondary hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setVideoPage((p) => Math.min(totalVideoPages, p + 1))}
                    disabled={videoPage === totalVideoPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-color bg-white/5 text-xs font-bold text-text-muted hover:border-secondary hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Top Gifter VIP Display Section (Show on 'all' or 'topgifter') */}
          {(activeTab === 'all' || activeTab === 'topgifter') && (
            <div className="mt-14">
              <div className="mb-6 flex flex-wrap items-center justify-between border-b border-border-color pb-3">
                <div>
                  <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
                    <i className="fa-solid fa-trophy text-warning" />
                    <span>Khung Vinh Danh Top Gifter VIP (Bảng Xếp Hạng Người Tặng Quà)</span>
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">Hiển thị avatar Top 1, Top 2, Top 3 Gifter tự động cập nhật hiệu ứng ánh kim lấp lánh khi có người ủng hộ.</p>
                </div>
                <span className="keep-white rounded bg-warning/20 px-2.5 py-1 text-xs font-extrabold text-warning">TOP RANK 1-3</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {/* Rank 1 Gold */}
                <div className="glass-card relative flex flex-col items-center p-6 rounded-2xl border-2 border-warning/60 bg-gradient-to-b from-warning/10 via-bg-surface to-bg-surface text-center shadow-[0_0_30px_rgba(255,183,3,0.2)]">
                  <span className="keep-white absolute top-3 right-3 rounded-full bg-warning px-3 py-1 font-header text-xs font-extrabold text-black">
                    🥇 RANK 1 GOLD
                  </span>
                  
                  <div className="relative h-24 w-24 my-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-warning animate-pulse shadow-[0_0_20px_rgba(255,183,3,0.8)]" />
                    <Image src="/logo.png" alt="Top 1 Avatar" width={80} height={80} className="rounded-full object-cover" />
                    <span className="absolute -top-3 text-3xl">👑</span>
                  </div>

                  <h4 className="font-header text-lg font-extrabold text-white">@Đại_Gia_Pro</h4>
                  <span className="text-xs font-bold text-warning mt-0.5">Top 1 Gifter • 299.999 Xu</span>
                  <p className="mt-2 text-xs text-text-muted">Khung vàng 24K rực rỡ lấp lánh đè trên góc livestream OBS.</p>
                </div>

                {/* Rank 2 Silver */}
                <div className="glass-card relative flex flex-col items-center p-6 rounded-2xl border border-secondary/60 bg-gradient-to-b from-secondary/10 via-bg-surface to-bg-surface text-center shadow-[0_0_20px_var(--color-secondary-glow)]">
                  <span className="keep-white absolute top-3 right-3 rounded-full bg-secondary px-3 py-1 font-header text-xs font-extrabold text-black">
                    🥈 RANK 2 SILVER
                  </span>

                  <div className="relative h-20 w-20 my-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-secondary shadow-[0_0_15px_var(--color-secondary-glow)]" />
                    <Image src="/logo.png" alt="Top 2 Avatar" width={68} height={68} className="rounded-full object-cover" />
                  </div>

                  <h4 className="font-header text-base font-extrabold text-white">@Streamer_Fan_99</h4>
                  <span className="text-xs font-bold text-secondary mt-0.5">Top 2 Gifter • 150.000 Xu</span>
                  <p className="mt-2 text-xs text-text-muted">Khung bạch kim hào quang tự động xuất hiện tên viewer.</p>
                </div>

                {/* Rank 3 Bronze */}
                <div className="glass-card relative flex flex-col items-center p-6 rounded-2xl border border-primary/50 bg-gradient-to-b from-primary/10 via-bg-surface to-bg-surface text-center">
                  <span className="keep-white absolute top-3 right-3 rounded-full bg-primary px-3 py-1 font-header text-xs font-extrabold text-white">
                    🥉 RANK 3 BRONZE
                  </span>

                  <div className="relative h-20 w-20 my-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(255,0,80,0.4)]" />
                    <Image src="/logo.png" alt="Top 3 Avatar" width={68} height={68} className="rounded-full object-cover" />
                  </div>

                  <h4 className="font-header text-base font-extrabold text-white">@Top_Gifter_01</h4>
                  <span className="text-xs font-bold text-primary mt-0.5">Top 3 Gifter • 85.000 Xu</span>
                  <p className="mt-2 text-xs text-text-muted">Khung đồng ánh kim vinh danh người hỗ trợ phiên live.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. 3D Jars Gallery (Show on 'all' or 'jar') */}
          {(activeTab === 'all' || activeTab === 'jar') && (
            <div className="mt-14">
              <div className="mb-6 flex items-center justify-between border-b border-border-color pb-3">
                <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
                  <i className="fa-solid fa-jar text-secondary" />
                  <span>Bộ Sưu Tập Hũ Quà & Cây Quà 3D Pro</span>
                </h3>
                <span className="text-xs text-text-muted">Bấm vào hình để phóng to xem chi tiết</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {demoJars.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => onOpenImage({ src: item.src, title: item.title, desc: item.desc })}
                    className="glass-card group relative flex flex-col overflow-hidden rounded-2xl border border-border-color bg-bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 cursor-pointer"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 p-4">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="keep-white absolute top-3 left-3 rounded-md bg-secondary/80 px-2.5 py-1 text-[0.65rem] font-extrabold text-white backdrop-blur-md">
                        {item.badge}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col grow">
                      <h4 className="font-header text-base font-bold text-white group-hover:text-secondary transition-colors">{item.title}</h4>
                      <p className="mt-1.5 text-xs text-text-muted leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border-color/60 pt-3 text-xs text-secondary font-bold">
                      <span>Phóng to xem 3D</span>
                      <i className="fa-solid fa-magnifying-glass-plus" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* 5. Menu Frame Showcase (Show on 'all' or 'frame') */}
          {(activeTab === 'all' || activeTab === 'frame') && (
            <div className="mt-14">
              <div className="mb-6 flex flex-wrap items-center justify-between border-b border-border-color pb-3">
                <div>
                  <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-primary" />
                    <span>Bộ Khung Menu Quà & Bảng Giá (Gift Menu Overlays)</span>
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">Các mẫu khung hiển thị bảng giá & menu danh sách quà trên màn hình livestream OBS Studio.</p>
                </div>
                <span className="text-xs text-text-muted">Bấm vào hình để phóng to</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {demoMenuFrames.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => onOpenImage({ src: item.src, title: item.title, desc: item.desc })}
                    className="glass-card group relative flex flex-col overflow-hidden rounded-2xl border border-border-color bg-bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 cursor-pointer"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 p-4">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="keep-white absolute top-2 left-2 rounded bg-primary px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                        {item.badge}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col grow">
                      <h4 className="font-header text-sm font-bold text-white group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="mt-1 text-[0.75rem] text-text-muted leading-snug">{item.desc}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border-color/60 pt-2 text-[0.7rem] text-primary font-bold">
                      <span>Xem khung Menu</span>
                      <i className="fa-solid fa-expand" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
  );
}
