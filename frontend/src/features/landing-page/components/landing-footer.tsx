import Link from 'next/link';

export default function LandingFooter() {
  return (
    <>
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
    </>
  );
}

