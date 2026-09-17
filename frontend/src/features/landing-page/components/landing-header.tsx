import Image from 'next/image';
import Link from 'next/link';

interface LandingHeaderProps {
  isLightMode: boolean;
  mobileMenuOpen: boolean;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}

export default function LandingHeader({ isLightMode, mobileMenuOpen, onToggleTheme, onToggleMobileMenu, onCloseMobileMenu }: LandingHeaderProps) {
  return (
    <>
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
              onClick={onToggleTheme}
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
              onClick={() => onToggleMobileMenu()}
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
              <a href="#hero" onClick={() => onCloseMobileMenu()} className="py-1 text-text-secondary hover:text-white">Trang chủ</a>
              <a href="#demo" onClick={() => onCloseMobileMenu()} className="flex items-center justify-between py-1 text-secondary font-bold">
                <span>Demo (Video, Hũ 3D & Simulator)</span>
                <span className="keep-white rounded bg-secondary/20 px-2 py-0.5 text-[0.65rem] text-secondary">HOT</span>
              </a>
              <a href="#features" onClick={() => onCloseMobileMenu()} className="py-1 text-text-secondary hover:text-white">Tính năng</a>
              <a href="#workflow" onClick={() => onCloseMobileMenu()} className="py-1 text-text-secondary hover:text-white">Cách hoạt động</a>
              <a href="#pricing" onClick={() => onCloseMobileMenu()} className="py-1 text-text-secondary hover:text-white">Bảng giá</a>
              <a href="#faq" onClick={() => onCloseMobileMenu()} className="py-1 text-text-secondary hover:text-white">Hỏi đáp</a>
              <div className="mt-2 pt-3 border-t border-border-color flex items-center justify-between">
                <Link href="/login" onClick={() => onCloseMobileMenu()} className="text-sm font-bold text-text-secondary">Đăng nhập</Link>
                <Link href="/login" onClick={() => onCloseMobileMenu()} className="keep-white rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-extrabold text-white">Bắt đầu ngay</Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

