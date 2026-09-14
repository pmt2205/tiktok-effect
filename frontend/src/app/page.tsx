'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Real-Time Green Screen / Chroma Key Video Component (Removes Green Screen Completely!)
function ChromaKeyVideo({
  src,
  className = '',
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId: number;

    const processFrame = () => {
      if (video && !video.paused && !video.ended && video.readyState >= 2) {
        const vw = video.videoWidth || 300;
        const vh = video.videoHeight || 300;

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, vw, vh);
          const frame = ctx.getImageData(0, 0, vw, vh);
          const d = frame.data;
          const len = d.length;

          for (let i = 0; i < len; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            // Green Screen removal threshold:
            // Green is dominant: g > 60 and g > r * 1.05 and g > b * 1.08
            if (g > 60 && g > r * 1.05 && g > b * 1.08) {
              d[i + 3] = 0; // Set Alpha = 0 (100% Transparent)
            } else if (g > 45 && g > r && g > b) {
              const diff = g - Math.max(r, b);
              if (diff > 5) {
                d[i + 3] = Math.max(0, 255 - diff * 4);
              }
            }
          }
          ctx.putImageData(frame, 0, 0);
        }
      }
      animId = requestAnimationFrame(processFrame);
    };

    const tryPlay = () => {
      if (video) {
        video.play().catch(() => {});
      }
    };

    tryPlay();
    animId = requestAnimationFrame(processFrame);

    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      cancelAnimationFrame(animId);
    };
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Video is opacity-0 (not display:none) so browser continuously decodes frames */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain opacity-0 pointer-events-none"
      />
      <canvas ref={canvasRef} className="relative z-10 h-full w-full object-contain" />
    </div>
  );
}

// Demo Media Items — Video Effects Grid (User can swap MP4 files easily)
const demoVideos = [
  { id: 'video-rose-1', title: 'Hiệu Ứng Rose User Dance 4K', src: '/videouser/userrose.mp4', gift: 'Hoa Hồng 🌹', badge: 'Rose Dance', desc: 'Hiệu ứng nhảy theo quà Rose cực hot.' },
  { id: 'video-capy-1', title: 'Capybara Dance Effect (Xóa Phông Xanh 100%)', src: '/dance/capy_dance.mp4', gift: 'Sư Tử 🦁', badge: 'Capybara Dance', desc: 'Hiệu ứng Capybara nhảy nhót vui nhộn.' },
  { id: 'video-lion-1', title: 'Hiệu Ứng Sư Tử Luxury Dance 4K', src: '/videouser/userrose.mp4', gift: 'Sư Tử Vàng 🦁', badge: 'Lion VIP', desc: 'Kích hoạt video dance độc quyền.' },
  { id: 'video-diamond-1', title: 'Hiệu Ứng Mưa Kim Cương 4K', src: '/videouser/userrose.mp4', gift: 'Kim Cương 💎', badge: 'Diamond Effect', desc: 'Hiệu ứng mưa kim cương lấp lánh.' },
  { id: 'video-crown-1', title: 'Hiệu Ứng Vinh Danh Top Gifter', src: '/videouser/userrose.mp4', gift: 'Vương Miện 👑', badge: 'Crown VIP', desc: 'Hiệu ứng vương miện rực rỡ vinh danh.' },
  { id: 'video-concert-1', title: 'Hiệu Ứng Sân Sấu Concert Neon', src: '/videouser/userrose.mp4', gift: 'Vé Concert 🎵', badge: 'Neon Concert', desc: 'Sân khấu hiệu ứng ánh sáng concert.' },
  
  // Page 2 Demo Items
  { id: 'video-rose-2', title: 'Vũ Điệu Hoa Hồng 4K (Tự Tạo)', src: '/videouser/userrose.mp4', gift: 'Hoa Hồng Đỏ 🌹', badge: 'Custom Rose', desc: 'Video nhảy custom theo yêu cầu.' },
  { id: 'video-capy-2', title: 'Capybara Special Edition 3D', src: '/dance/capy_dance.mp4', gift: 'Gấu Trúc 🐼', badge: 'Capybara VIP', desc: 'Hiệu ứng Capybara xóa phông xanh.' },
  { id: 'video-lion-2', title: 'Hiệu Ứng Sư Tử Hoàng Gia 4K', src: '/videouser/userrose.mp4', gift: 'Sư Tử Kim Cương 🦁', badge: 'Royal Lion', desc: 'Sư tử xuất hiện hào quang rực rỡ.' },
  { id: 'video-diamond-2', title: 'Hiệu Ứng Tháp Kim Cương 4K', src: '/videouser/userrose.mp4', gift: 'Tháp Kim Cương 💎', badge: 'Diamond Tower', desc: 'Bùng nổ kim cương trên livestream.' },
  { id: 'video-crown-2', title: 'Hiệu Ứng Mũ Hoàng Gia VIP', src: '/videouser/userrose.mp4', gift: 'Nón Hoàng Gia 👑', badge: 'Royal Crown', desc: 'Tôn vinh người ủng hộ phòng live.' },
  { id: 'video-concert-2', title: 'Hiệu Ứng Đèn Laser Live Show', src: '/videouser/userrose.mp4', gift: 'Loa Laser 🔊', badge: 'Laser Show', desc: 'Đèn chiếu laser không gian 3D.' },
];

const demoJars = [
  { id: 'jar-pro-1', title: 'Hũ Quà Glass Neon 3D', category: 'jar', src: '/jar/jar_pro_1.png', badge: '3D Glass', desc: 'Hũ thủy tinh trong suốt phát sáng Neon Cyberpunk khi nhận gift.' },
  { id: 'jar-pro-2', title: 'Hũ Quà VIP Metal 3D', category: 'jar', src: '/jar/jar_pro_2.png', badge: 'Metal VIP', desc: 'Hũ kim loại cao cấp tích tụ năng lượng quà rơi tự nhiên.' },
  { id: 'jar-pro-3', title: 'Hũ Quà Crystal 4K', category: 'jar', src: '/jar/jar_pro_3.png', badge: 'Crystal 4K', desc: 'Hũ pha lê rực rỡ phản chiếu ánh sáng sống động trên OBS.' },
  { id: 'jar-pro-4', title: 'Hũ Quà Hoàng Gia Pro', category: 'jar', src: '/jar/jar_pro_4.png', badge: 'Legendary', desc: 'Hũ phong cách hoàng gia đính đá quý dành cho streamer đỉnh cao.' },
  { id: 'tree-1', title: 'Cây Quà Tích Lũy', category: 'jar', src: '/tree/tree.png', badge: 'Tree Effect', desc: 'Mô hình Cây Quà tự động nở hoa theo tổng xu tích lũy phiên live.' },
  { id: 'tree-2', title: 'Cây Quà Tích Lũy 3D', category: 'jar', src: '/tree/ChatGPT Image 15_42_48 2 thg 9, 2026.png', badge: 'Tree Effect', desc: 'Mô hình Cây Quà tự động nở hoa theo tổng xu tích lũy phiên live.' },
];

// Menu Frames (Khung Menu Quà OBS)
const demoMenuFrames = [
  { id: 'frame-1', title: 'Khung Menu Hoàng Gia Vàng Kim', category: 'frame', src: '/frame/khung1.png', badge: 'Menu Vàng 24K', desc: 'Bảng khung hiển thị danh sách quà & bảng giá streamer phong cách hoàng gia.' },
  { id: 'frame-vuongmien', title: 'Khung Menu Vương Miện VIP', category: 'frame', src: '/frame/vuongmien.png', badge: 'Menu Vương Miện', desc: 'Khung đính vương miện đính đá sang trọng hiển thị danh sách gift.' },
  { id: 'frame-kpop', title: 'Khung Menu Sân Sấu Neon K-Pop', category: 'frame', src: '/frame/kpop.png', badge: 'Menu Neon', desc: 'Khung bảng quà phong cách concert K-Pop hiện đại rực rỡ.' },
  { id: 'frame-vang', title: 'Khung Menu Hào Quang Vàng', category: 'frame', src: '/frame/vang.png', badge: 'Menu Glow', desc: 'Khung hào quang lấp lánh trình bày bảng danh sách quà trên livestream.' },
  { id: 'frame-may', title: 'Khung Menu Mây Trắng Cute', category: 'frame', src: '/frame/may.png', badge: 'Menu Cute', desc: 'Khung mây trắng xinh xắn dễ thương cho phiên live tương tác.' },
];

const features = [
  { icon: 'fa-wand-magic-sparkles', title: 'Hiệu Ứng Quà Thời Gian Thực', text: 'Tự động kích hoạt video MP4 4K & âm thanh MP3 cực phiêu ngay khi viewer tặng gift trên TikTok Live.' },
  { icon: 'fa-jar', title: 'Hũ Quà & Cây Quà 3D Tích Lũy', text: 'Mọi món gift rơi tự nhiên vào hũ quà 3D chân thực. Cây quà tự động lớn dần theo mốc tích lũy.' },
  { icon: 'fa-crown', title: 'Vinh Danh Top Gifter Thời Gian Thực', text: 'Bảng xếp hạng & khung đại diện Top 1, Top 2, Top 3 tự động cập nhật với hiệu ứng ánh kim lấp lánh.' },
  { icon: 'fa-volume-high', title: 'TTS Đọc Tên Viewer & Gift AI', text: 'Giọng đọc AI tự nhiên công bố người tặng quà, chúc mừng viewer và tăng tương tác tức thì.' },
  { icon: 'fa-sliders', title: 'Điều Chỉnh Trực Tiếp Zero-Reload', text: 'Thay đổi vị trí, kích thước, hiệu ứng ngay trên Dashboard mà không tốn công dựng lại OBS Scene.' },
  { icon: 'fa-bolt', title: 'Siêu Nhẹ & Tối Ưu OBS Studio', text: 'Kết nối qua Browser Source với độ trễ < 50ms, không tốn tài nguyên CPU/GPU máy tính streamer.' },
];

const plans = [
  {
    name: 'Gói Thường',
    price: 'Miễn phí',
    note: 'Thích hợp cho streamer mới bắt đầu trải nghiệm phiên live gọn nhẹ',
    accent: 'secondary',
    features: ['5 gift kích hoạt hiệu ứng video', 'Menu quà tối đa 5 vị trí', 'Hũ quà & Cây quà cơ bản', 'Cập nhật thời gian thực < 100ms'],
  },
  {
    name: 'Gói Pro',
    price: '99K',
    period: '/ tháng',
    note: 'Dành cho streamer live chuyên nghiệp thường xuyên',
    accent: 'primary',
    features: [
      '15 gift hiệu ứng custom video & sound',
      'Full bộ Hũ Quà 3D & Cây Quà Pro',
      'Menu quà tối đa 15 vị trí',
      'TTS AI đọc tên gift & bình luận',
      'Khung vinh danh Top Gifter VIP',
      'Hỗ trợ kỹ thuật 24/7',
    ],
  },
  {
    name: 'Gói Pro Max',
    price: '299K',
    period: '/ tháng',
    note: 'Giải pháp toàn diện nhất cho Streamer & MCN chuyên nghiệp',
    accent: 'mixed',
    popular: true,
    features: [
      'Không giới hạn số lượng gift & hiệu ứng',
      'Full tùy chọn Hũ Quà 3D, Cây Quà & Name Jar',
      'Tải video & âm thanh custom riêng',
      'TTS AI chuẩn giọng vùng miền',
      'Vinh danh Top Gifter & Tap-tap Counter',
      'Ưu tiên dựng Hũ Quà & Video 3D theo yêu cầu',
    ],
  },
];

const faqs = [
  {
    q: 'TikTok Live Effect kết nối với OBS Studio như thế nào?',
    a: 'Bạn chỉ cần copy đường dẫn URL Browser Source duy nhất từ Dashboard và dán vào phần Browser Source trong OBS Studio. Mọi tùy chỉnh giao diện sẽ tự động đồng bộ tức thì.',
  },
  {
    q: 'Trình overlay có gây giật lag hay giảm FPS khi đang chơi game không?',
    a: 'Hoàn toàn không! Mọi xử lý hiệu ứng được tối ưu hóa GPU trang web với dung lượng cực nhẹ, không ảnh hưởng đến hiệu năng game hay luồng stream của bạn.',
  },
  {
    q: 'Tôi có thể tải video MP4 hoặc âm thanh MP3 cá nhân lên không?',
    a: 'Có! Hệ thống hỗ trợ tải video MP4, WebM (nền trong suốt) và tệp âm thanh MP3/WAV cá nhân để bạn tự do tạo dấu ấn riêng cho kênh livestream.',
  },
  {
    q: 'Tôi muốn đặt thiết kế hũ quà 3D hoặc video hiệu ứng riêng thì làm thế nào?',
    a: 'Chúng tôi nhận thiết kế hũ quà 3D mang thương hiệu cá nhân và dựng video hiệu ứng theo yêu cầu. Bạn chỉ cần liên hệ Hotline/Zalo 0795 533 253 để được hỗ trợ tức thì.',
  },
];

// Interactive Vertical Video Effect Card Component (Clean Vertical Box, No Text)
function VideoEffectCard({
  item,
  onOpenModal,
}: {
  item: { id: string; title: string; src: string; gift: string; badge: string; desc: string };
  onOpenModal: (item: any) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <article
      onClick={() => onOpenModal(item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="glass-card group relative overflow-hidden rounded-2xl border border-border-color bg-bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:border-secondary/70 hover:shadow-[0_12px_32px_var(--color-secondary-glow)] cursor-pointer"
    >
      {/* Clean Vertical Box (Aspect 9:16) — No text underneath */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/90 group">
        {item.src.includes('capy_dance') ? (
          <ChromaKeyVideo src={item.src} className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            src={item.src}
            loop
            muted
            playsInline
            className="h-full w-full object-cover filter drop-shadow-md"
          />
        )}

        {/* Hover Auto-Play Overlay Badge */}
        {!isPlaying && !item.src.includes('capy_dance') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-opacity duration-300 group-hover:bg-black/10">
            <div className="keep-white flex h-10 w-10 items-center justify-center rounded-full bg-secondary/90 text-black shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-play text-xs ml-0.5" />
            </div>
          </div>
        )}

        {/* Top-left subtle badge tag */}
        <span className="keep-white absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[0.65rem] font-extrabold text-secondary backdrop-blur-md border border-white/10">
          {item.badge}
        </span>

        {/* Expand icon on hover bottom right */}
        <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md transition-opacity">
          <i className="fa-solid fa-expand text-xs" />
        </div>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'jar' | 'frame' | 'topgifter' | 'sandbox'>('all');
  
  // Video Pagination State (6 videos per page)
  const [videoPage, setVideoPage] = useState(1);
  const VIDEOS_PER_PAGE = 6;
  const totalVideoPages = Math.ceil(demoVideos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = demoVideos.slice((videoPage - 1) * VIDEOS_PER_PAGE, videoPage * VIDEOS_PER_PAGE);

  // Modal Lightbox States
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [lightboxVideo, setLightboxVideo] = useState<{ src: string; title: string; gift: string; desc: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Simulator States
  const [simulatedGifts, setSimulatedGifts] = useState<Array<{ id: number; user: string; gift: string; icon: string; combo: number }>>([]);
  const [activeDanceOverlay, setActiveDanceOverlay] = useState(true);
  const [activeCrownOverlay, setActiveCrownOverlay] = useState(false);

  // Sync theme state with HTML root class
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light-mode');
    setIsLightMode(isLight);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('light-mode');
      localStorage.setItem('theme_preference', 'dark');
      setIsLightMode(false);
    } else {
      root.classList.add('light-mode');
      localStorage.setItem('theme_preference', 'light');
      setIsLightMode(true);
    }
  };

  // Trigger simulated gifts
  const triggerGift = (type: string) => {
    const id = Date.now();
    let gift = 'Hoa Hồng 🌹';
    let icon = '🌹';
    let user = 'Streamer_Fan_' + Math.floor(Math.random() * 900 + 100);
    let combo = Math.floor(Math.random() * 8) + 1;

    if (type === 'rose') {
      gift = 'Hoa Hồng';
      icon = '🌹';
      setActiveDanceOverlay(true);
    } else if (type === 'lion') {
      gift = 'Sư Tử (Lion)';
      icon = '🦁';
      combo = 1;
      setActiveDanceOverlay(true);
    } else if (type === 'diamond') {
      gift = 'Kim Cương 💎';
      icon = '💎';
      combo = 5;
    } else if (type === 'top1') {
      gift = 'Vương Miện Top 1 VIP';
      icon = '👑';
      user = 'Đại_Gia_Pro';
      combo = 99;
      setActiveCrownOverlay(true);
      setTimeout(() => setActiveCrownOverlay(false), 6000);
    }

    setSimulatedGifts((prev) => [{ id, user, gift, icon, combo }, ...prev.slice(0, 3)]);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-bg-dark text-text-main transition-colors duration-300">
      {/* Background Glowing Atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-25">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-primary/25 blur-[140px] animate-glow-drift" />
        <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-secondary/25 blur-[150px] animate-glow-drift" style={{ animationDelay: '-6s' }} />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-accent/20 blur-[130px] animate-glow-drift" style={{ animationDelay: '-12s' }} />
      </div>

      {/* Landing Page Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border-color bg-bg-dark/85 backdrop-blur-2xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-24 transition-transform duration-300 group-hover:scale-105">
              <Image src="/logo.png" alt="TikTok Live Effect Logo" fill priority className="object-contain" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-header text-base font-extrabold tracking-wide text-white flex items-center gap-1.5">
                TIKTOK LIVE <span className="keep-white rounded bg-gradient-to-r from-primary to-secondary px-1.5 py-0.5 text-[0.65rem] uppercase text-white font-extrabold shadow-sm">PRO</span>
              </span>
              <span className="text-[0.65rem] font-semibold text-secondary uppercase tracking-widest">Overlay Engine</span>
            </div>
          </Link>

          {/* Header Navigation Links */}
          <nav className="hidden items-center gap-8 font-header text-sm font-semibold text-text-secondary md:flex">
            <a href="#hero" className="transition-colors duration-200 hover:text-white">Trang chủ</a>
            <a href="#demo" className="relative flex items-center gap-1.5 text-secondary font-bold transition-colors duration-200 hover:text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary"></span>
              </span>
              <span>Demo</span>
            </a>
            <a href="#features" className="transition-colors duration-200 hover:text-secondary">Tính năng</a>
            <a href="#workflow" className="transition-colors duration-200 hover:text-secondary">Cách hoạt động</a>
            <a href="#pricing" className="transition-colors duration-200 hover:text-secondary">Bảng giá</a>
            <a href="#faq" className="transition-colors duration-200 hover:text-secondary">Hỏi đáp</a>
          </nav>

          {/* Right Header Actions & Light/Dark Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border-color bg-white/5 text-text-secondary transition-all duration-200 hover:border-secondary hover:text-white active:scale-95 cursor-pointer shadow-sm"
              title={isLightMode ? 'Chuyển sang Chế độ Tối (Dark)' : 'Chuyển sang Chế độ Sáng (Light)'}
              aria-label="Toggle Theme Mode"
            >
              {isLightMode ? (
                <i className="fa-solid fa-moon text-secondary text-sm" />
              ) : (
                <i className="fa-solid fa-sun text-primary text-sm" />
              )}
            </button>

            {/* Login & Get Started Buttons */}
            <Link
              href="/login"
              className="hidden px-3.5 py-2 text-xs font-bold text-text-secondary transition-colors duration-200 hover:text-white sm:block sm:text-sm"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login"
              className="keep-white rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(255,0,80,0.4)] active:translate-y-0 sm:text-sm"
            >
              <i className="fa-solid fa-bolt mr-1.5" />
              Bắt đầu
            </Link>

            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-color bg-white/5 text-text-secondary md:hidden"
              aria-label="Toggle Mobile Navigation Menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-base`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border-color bg-bg-surface/95 px-5 py-4 backdrop-blur-2xl md:hidden animate-[fade-in-up_0.2s_ease-out]">
            <nav className="flex flex-col gap-3 font-header text-sm font-semibold">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="py-1 text-text-secondary hover:text-white">Trang chủ</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-1 text-secondary font-bold">
                <span>Demo (Video, Hũ 3D & Simulator)</span>
                <span className="keep-white rounded bg-secondary/20 px-2 py-0.5 text-[0.65rem] text-secondary">HOT</span>
              </a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 text-text-secondary hover:text-white">Tính năng</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-1 text-text-secondary hover:text-white">Cách hoạt động</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1 text-text-secondary hover:text-white">Bảng giá</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 text-text-secondary hover:text-white">Hỏi đáp</a>
              <div className="mt-2 pt-3 border-t border-border-color flex items-center justify-between">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-text-secondary">Đăng nhập</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="keep-white rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-extrabold text-white">Bắt đầu ngay</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative flex min-h-[88vh] items-center pt-24 pb-16 sm:pt-28 lg:pt-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image src="/space-bg.png" alt="TikTok Live Overlay Background" fill priority className="object-cover object-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/60 via-bg-dark/80 to-bg-dark" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Hero Left Content */}
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3.5 py-1.5 text-xs font-extrabold text-secondary backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                </span>
                🔴 REAL-TIME OVERLAY FOR TIKTOK LIVE & OBS
              </div>

              <h1 className="font-header text-4xl font-extrabold leading-[1.15] text-white min-[420px]:text-5xl lg:text-6xl">
                Bùng Nổ Tương Tác <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  TikTok Live
                </span> Với Hiệu Ứng 4K
              </h1>

              <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
                Tự động kích hoạt <strong className="text-white">Video User 4K</strong>, âm thanh remix, <strong className="text-white">Hũ Quà 3D</strong> và vinh danh Top Gifter trực tiếp trên OBS Studio theo thời gian thực.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/login"
                  className="keep-white flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_6px_24px_var(--color-primary-glow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(255,0,80,0.5)] active:translate-y-0"
                >
                  Bắt đầu miễn phí
                </Link>

                <a
                  href="#demo"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border-color bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-secondary hover:bg-secondary/10"
                >
                  Xem Video Demo
                </a>
              </div>

              {/* Real-time Stats Counter */}
              <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border-color pt-8 sm:grid-cols-4">
                <div>
                  <div className="font-header text-2xl font-extrabold text-white sm:text-3xl">10.000+</div>
                  <div className="text-xs text-text-muted mt-1">Phiên Live Hoạt Động</div>
                </div>
                <div>
                  <div className="font-header text-2xl font-extrabold text-secondary sm:text-3xl">&lt; 50ms</div>
                  <div className="text-xs text-text-muted mt-1">Độ Trễ Nhận Gift</div>
                </div>
                <div>
                  <div className="font-header text-2xl font-extrabold text-primary sm:text-3xl">10+</div>
                  <div className="text-xs text-text-muted mt-1">Mẫu Hũ & Video 3D</div>
                </div>
                <div>
                  <div className="font-header text-2xl font-extrabold text-success sm:text-3xl">99.9%</div>
                  <div className="text-xs text-text-muted mt-1">Uptime OBS Studio</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Preview Card: Dance Character SIDE BY SIDE WITH Jar 3D (Background Completely Removed via ChromaKeyVideo Canvas!) */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-color bg-bg-surface/80 p-4 shadow-[0_12px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-border-color pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-danger animate-pulse" />
                    <span className="font-header text-xs font-bold text-white uppercase tracking-wider">OBS Stream Canvas (Đã Xóa Phông Xanh 100%)</span>
                  </div>
                  <span className="keep-white rounded-full bg-success/20 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-success">60 FPS • 4K</span>
                </div>

                {/* OBS Stream Canvas Layout: Dance Character RIGHT BESIDE Jar 3D */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/80 border border-white/10 flex items-center justify-center gap-1 sm:gap-2 px-2">
                  <Image src="/space-bg.png" alt="Stream background preview" fill className="object-cover opacity-35" />
                  
                  {/* Left: Capybara Dance Character (ChromaKeyVideo renders HTML5 Canvas to strip green screen pixels completely!) */}
                  <div className="relative z-10 flex flex-col items-center justify-center shrink-0 -mr-4 sm:-mr-6">
                    <ChromaKeyVideo
                      src="/dance/capy_dance.mp4"
                      className="h-44 w-44 sm:h-48 sm:w-48"
                    />
                  </div>

                  {/* Right: Jar 3D Container */}
                  <div className="relative z-10 flex flex-col items-center justify-center shrink-0">
                    <div className="relative h-40 w-40 sm:h-44 sm:w-44 animate-gift-bob">
                      <Image src="/jar/jar_pro_1.png" alt="Jar Pro 1 3D Preview" fill className="object-contain drop-shadow-[0_10px_25px_rgba(255,0,80,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Design Banner */}
      <section className="relative border-y border-primary/35 bg-gradient-to-r from-bg-surface via-bg-card to-bg-surface py-10 shadow-[0_0_30px_var(--color-primary-glow)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex max-w-3xl flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="keep-white flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl text-white shadow-[0_0_20px_var(--color-primary-glow)]">
              <i className="fa-solid fa-wand-magic-sparkles" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="keep-white rounded bg-primary px-2 py-0.5 text-[0.65rem] font-extrabold uppercase text-white">Dịch vụ thiết kế VIP</span>
                <span className="text-xs font-bold uppercase text-secondary">Nhận Làm Theo Yêu Cầu</span>
              </div>
              <h2 className="mt-1.5 font-header text-xl font-extrabold leading-snug text-white sm:text-2xl">
                Thiết Kế Hũ Quà & Video Hiệu Ứng Riêng Cho Streamer
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Dựng Hũ Quà 3D theo logo/thương hiệu cá nhân, video nhảy custom theo từng món gift và hiệu ứng âm thanh độc quyền 24/7.
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
            <a
              href="tel:0795533253"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-color bg-white/5 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-secondary hover:bg-secondary/10 sm:flex-initial"
            >
              <i className="fa-solid fa-phone text-secondary" />
              0795 533 253
            </a>
            <a
              href="https://zalo.me/0795533253"
              target="_blank"
              rel="noreferrer"
              className="keep-white flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-300 hover:-translate-y-0.5 sm:flex-initial"
            >
              <i className="fa-solid fa-comment-dots" />
              Chat Zalo Trực Tiếp
            </a>
          </div>
        </div>
      </section>

      {/* DEDICATED DEMO SHOWCASE SECTION (#demo) */}
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
            {[
              { id: 'all', label: 'Tất cả Demo', icon: 'fa-table-cells' },
              { id: 'video', label: 'Video Hiệu Ứng (Hover/Click 4K)', icon: 'fa-film' },
              { id: 'jar', label: 'Hũ Quà & Cây Quà 3D', icon: 'fa-jar' },
              { id: 'topgifter', label: 'Vinh Danh Top Gifter VIP', icon: 'fa-trophy' },
              { id: 'frame', label: 'Khung Menu Quà OBS', icon: 'fa-layer-group' },
            ].map((tab) => (
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
                    onOpenModal={(video) => setLightboxVideo(video)}
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
                <div className="glass-card relative flex flex-col items-center p-6 rounded-2xl border border-secondary/60 bg-gradient-to-b from-secondary/10 via-bg-surface to-bg-surface text-center shadow-[0_0_20px_rgba(0,242,254,0.15)]">
                  <span className="keep-white absolute top-3 right-3 rounded-full bg-secondary px-3 py-1 font-header text-xs font-extrabold text-black">
                    🥈 RANK 2 SILVER
                  </span>

                  <div className="relative h-20 w-20 my-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-secondary shadow-[0_0_15px_rgba(0,242,254,0.5)]" />
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
                    onClick={() => setLightboxImage({ src: item.src, title: item.title, desc: item.desc })}
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
                    onClick={() => setLightboxImage({ src: item.src, title: item.title, desc: item.desc })}
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

      {/* Features Grid Section */}
      <section id="features" className="scroll-mt-20 border-y border-border-color bg-bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
              BỘ CÔNG CỤ BÙNG NỔ INTERACTION
            </span>
            <h2 className="mt-2 font-header text-3xl font-extrabold text-white sm:text-4xl">
              Mọi Hiệu Ứng Streamer Cần Ở Một Nơi
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              Tối ưu hóa phiên livestream của bạn với bộ công cụ hiệu ứng tương tác tự động theo thời gian thực.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="glass-card group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-xl text-secondary transition-colors duration-300 group-hover:bg-secondary group-hover:text-black">
                  <i className={`fa-solid ${feature.icon}`} />
                </span>
                <h3 className="mt-6 font-header text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              QUY TRÌNH THIẾT LẬP SIÊU TỐC
            </span>
            <h2 className="mt-2 font-header text-3xl font-extrabold text-white sm:text-4xl">
              Lên Sóng Trực Tiếp Trong 3 Bước
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { step: '01', title: 'Kết Nối TikTok Live', desc: 'Nhập Username TikTok của bạn vào Dashboard. Hệ thống tự động phát hiện khi bạn bắt đầu phát livestream.' },
              { step: '02', title: 'Cấu Hình Hiệu Ứng', desc: 'Chọn các mẫu Hũ Quà 3D, gán Video/Âm thanh tương ứng với từng loại gift hoặc tùy chỉnh theo sở thích.' },
              { step: '03', title: 'Mở Overlay Trên OBS', desc: 'Sao chép đường dẫn Browser Source và dán vào OBS Studio. Bạn đã sẵn sàng bùng nổ tương tác!' },
            ].map((item) => (
              <div key={item.step} className="glass-card relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1">
                <span className="font-header text-4xl font-extrabold text-secondary opacity-80">{item.step}</span>
                <h3 className="mt-4 font-header text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-20 border-y border-border-color bg-bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
              GÓI DỊCH VỤ LINH HOẠT
            </span>
            <h2 className="mt-2 font-header text-3xl font-extrabold text-white sm:text-4xl">
              Bắt Đầu Miễn Phí, Nâng Cấp Khi Cần
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`glass-card relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  plan.popular ? 'border-primary shadow-[0_0_30px_var(--color-primary-glow)] scale-102' : 'border-border-color'
                }`}
              >
                {plan.popular && (
                  <span className="keep-white absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-extrabold uppercase text-white shadow-md">
                    Phổ Biến Nhất
                  </span>
                )}

                <h3 className="font-header text-xl font-bold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1 font-header text-3xl font-extrabold text-white sm:text-4xl">
                  <span>{plan.price}</span>
                  {plan.period && <span className="text-xs font-semibold text-text-muted">{plan.period}</span>}
                </div>
                <p className="mt-2 text-xs text-text-muted min-h-[32px]">{plan.note}</p>

                <ul className="mt-6 grow space-y-3 border-t border-border-color pt-6 text-xs text-text-secondary">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-success text-sm shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`mt-8 block rounded-xl py-3 text-center text-xs font-extrabold transition-all duration-300 ${
                    plan.popular
                      ? 'keep-white bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_16px_var(--color-primary-glow)] hover:-translate-y-0.5'
                      : 'border border-border-color bg-white/5 text-white hover:border-secondary'
                  }`}
                >
                  {plan.price === 'Miễn phí' ? 'Dùng thử miễn phí' : `Đăng ký ${plan.name}`}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
              GIẢI ĐÁP THẮC MẮC
            </span>
            <h2 className="mt-2 font-header text-3xl font-extrabold text-white sm:text-4xl">
              Câu Hỏi Thường Gặp Của Streamer
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card rounded-2xl border border-border-color overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-header text-base font-bold text-white cursor-pointer hover:text-secondary transition-colors"
                >
                  <span>{faq.q}</span>
                  <i className={`fa-solid fa-chevron-down text-sm transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-secondary' : 'text-text-muted'}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed border-t border-border-color/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-header text-3xl font-extrabold text-white sm:text-4xl">
            Sẵn Sàng Nâng Tầm Phút Livestream Tiếp Theo?
          </h2>
          <p className="mt-4 text-sm text-text-muted sm:text-base">
            Tạo tài khoản miễn phí và thiết lập hiệu ứng TikTok Live đầu tiên chỉ trong 2 phút.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="keep-white rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_6px_24px_var(--color-primary-glow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(255,0,80,0.5)]"
            >
              <i className="fa-solid fa-rocket mr-2" />
              Mở TikTok Live Effect Ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div className="modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border-color bg-bg-surface p-6 shadow-2xl animate-[fade-in-up_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-color bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/60 p-4">
              <Image src={lightboxImage.src} alt={lightboxImage.title} fill className="object-contain" />
            </div>
            <h3 className="mt-4 font-header text-xl font-bold text-white">{lightboxImage.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{lightboxImage.desc}</p>
          </div>
        </div>
      )}

      {/* Lightbox Video Preview Modal (ENLARGE 4K VIDEO PLAYER WITH CHROMA KEY SUPPORT) */}
      {lightboxVideo && (
        <div className="modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl rounded-2xl border border-secondary/40 bg-bg-surface p-6 shadow-[0_0_50px_var(--color-secondary-glow)] animate-[fade-in-up_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <button
              onClick={() => setLightboxVideo(null)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-color bg-white/10 text-white hover:bg-white/20 cursor-pointer z-20"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-2xl flex items-center justify-center">
              {lightboxVideo.src.includes('capy_dance') ? (
                <ChromaKeyVideo src={lightboxVideo.src} className="h-full w-full" />
              ) : (
                <video
                  src={lightboxVideo.src}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-color pb-3">
              <div>
                <span className="keep-white rounded bg-secondary/20 px-2.5 py-0.5 text-xs font-extrabold text-secondary">
                  VIDEO DEMO 4K (ĐÃ XÓA PHÔNG XANH)
                </span>
                <h3 className="mt-1 font-header text-xl font-bold text-white">{lightboxVideo.title}</h3>
              </div>
              <span className="font-header text-sm font-bold text-primary">{lightboxVideo.gift}</span>
            </div>

            <p className="mt-2 text-xs text-text-muted">{lightboxVideo.desc}</p>
            
            <div className="mt-4 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-color/40">
              <span className="font-mono text-secondary">Đường dẫn tệp: {lightboxVideo.src}</span>
              <span className="text-success font-bold">✓ Sẵn Sàng Thay Thế MP4</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border-color py-8 transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-text-muted sm:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-header font-bold text-white">© 2026 TikTok Live Effect Engine</span>
            <span>•</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#hero" className="hover:text-white transition-colors">Trang chủ</a>
            <a href="#demo" className="hover:text-secondary transition-colors">Demo</a>
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
            <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
