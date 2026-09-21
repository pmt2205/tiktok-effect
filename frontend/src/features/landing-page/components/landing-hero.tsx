import Image from 'next/image';
import Link from 'next/link';
import ChromaKeyVideo from './chroma-key-video';

export default function LandingHero() {
  return (
    <>
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
                      <Image src="/jar/jar_custom/jar_ct1/jar.png" alt="Hũ quà mèo hồng custom" fill className="object-contain drop-shadow-[0_10px_25px_var(--color-primary-glow)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
