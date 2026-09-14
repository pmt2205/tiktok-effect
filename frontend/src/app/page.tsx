import Image from 'next/image';
import Link from 'next/link';

const features = [
  { icon: 'fa-wand-magic-sparkles', title: 'Hiệu ứng quà theo thời gian thực', text: 'Gắn video và âm thanh vào gift TikTok, xem thử trước khi đưa lên sóng.' },
  { icon: 'fa-layer-group', title: 'Overlay dựng sẵn cho OBS', text: 'Menu quà, hũ quà, cây quà và bảng xếp hạng hoạt động trong cùng một nguồn trình duyệt.' },
  { icon: 'fa-sliders', title: 'Tùy chỉnh ngay khi đang live', text: 'Điều chỉnh vị trí, kích thước và giao diện mà không phải dựng lại scene OBS.' },
];

const plans = [
  { name: 'Thường', price: 'Miễn phí', note: 'Bắt đầu một phiên live gọn nhẹ', accent: 'secondary', features: ['5 gift hiệu ứng', 'Menu tối đa 5 gift', 'Hũ và cây quà cơ bản'] },
  { name: 'Pro', price: '99K', note: 'Dành cho streamer live thường xuyên', accent: 'primary', features: ['10 gift hiệu ứng', 'Menu tối đa 10 gift', 'Hiệu ứng video và âm thanh custom'] },
  { name: 'Pro Max', price: '299K', note: 'Toàn bộ công cụ cho phiên live chuyên nghiệp', accent: 'mixed', features: ['Gift và menu không giới hạn', 'Full tùy chọn hũ, cây và Name Jar', 'TTS, Tap Tay và Top Gifter'] },
];

export default function LandingPage() {
  return <main className="min-h-screen overflow-hidden bg-bg-dark text-text-main">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-color bg-bg-dark/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 min-[380px]:px-4 sm:h-16 sm:px-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="TikTok Live Effect trang chủ">
          <span className="relative h-8 w-16 min-[380px]:w-20 sm:h-9"><Image src="/logo.png" alt="TikTok Live Effect" fill priority className="object-contain" /></span>
          <span className="hidden font-header text-sm font-bold text-white sm:block">LIVE EFFECT</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-text-secondary md:flex" aria-label="Điều hướng chính">
          <a href="#features" className="transition-colors duration-200 hover:text-secondary">Tính năng</a>
          <a href="#pricing" className="transition-colors duration-200 hover:text-secondary">Bảng giá</a>
          <a href="#workflow" className="transition-colors duration-200 hover:text-secondary">Cách hoạt động</a>
        </nav>
        <div className="flex shrink-0 items-center gap-1 min-[380px]:gap-2">
          <Link href="/login" className="px-2 py-2 text-xs font-bold text-text-secondary transition-colors duration-200 hover:text-white min-[380px]:px-3 sm:text-sm">Đăng nhập</Link>
          <Link href="/login" className="rounded-md bg-gradient-to-r from-primary to-secondary px-3 py-2 text-xs font-bold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5 min-[380px]:px-4 sm:text-sm">Bắt đầu</Link>
        </div>
      </div>
    </header>

    <section className="relative flex min-h-[700px] items-end pt-14 sm:min-h-[720px] sm:pt-16 lg:min-h-[82vh]">
      <Image src="/space-bg.png" alt="Không gian hiệu ứng TikTok Live" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-black/20" />
      <div className="pointer-events-none absolute -bottom-14 -right-24 z-[2] h-[340px] w-[320px] opacity-25 min-[430px]:-right-14 min-[430px]:h-[400px] min-[430px]:w-[370px] sm:opacity-35 lg:hidden"><Image src="/jar/jar_pro_4.png" alt="" fill className="object-contain object-bottom" /></div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 min-[380px]:px-5 sm:pb-14 sm:pt-28 lg:px-8 lg:pb-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 text-[0.65rem] font-extrabold uppercase text-secondary min-[380px]:text-xs sm:mb-5"><span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_10px_var(--color-success-glow)]" />Overlay hoạt động theo thời gian thực</div>
          <h1 className="font-header text-4xl font-bold leading-tight text-white min-[380px]:text-[2.75rem] sm:text-5xl lg:text-6xl">TikTok Live Effect</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary min-[380px]:text-base min-[380px]:leading-7 sm:mt-5 sm:text-lg">Biến gift, lượt thích và bình luận thành hiệu ứng trực quan trên OBS. Thiết lập một lần, điều khiển toàn bộ phiên live trong một dashboard.</p>
          <div className="mt-7 grid gap-3 min-[430px]:flex min-[430px]:flex-wrap sm:mt-8">
            <Link href="/login" className="rounded-md bg-gradient-to-r from-primary to-secondary px-5 py-3 text-center text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5"><i className="fa-solid fa-bolt mr-2" />Bắt đầu miễn phí</Link>
            <a href="#workflow" className="rounded-md border border-border-color bg-black/30 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur-xl transition-all duration-200 hover:border-secondary"><i className="fa-solid fa-play mr-2 text-secondary" />Xem cách hoạt động</a>
          </div>
        </div>
      </div>
    </section>

    <section className="relative border-y border-primary/35 bg-bg-surface py-10 shadow-[0_0_30px_var(--color-primary-glow)] sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 min-[380px]:px-5 lg:flex-row lg:items-center lg:px-8">
        <div className="flex max-w-3xl flex-col items-start gap-4 min-[430px]:flex-row">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xl text-primary shadow-[0_0_18px_var(--color-primary-glow)]"><i className="fa-solid fa-pen-ruler" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-sm bg-primary px-2 py-1 text-[0.65rem] font-extrabold uppercase text-white">Thiết kế riêng</span><span className="text-xs font-bold uppercase text-secondary">Nhận làm theo yêu cầu</span></div>
            <h2 className="mt-2 font-header text-xl font-bold leading-snug text-white sm:text-2xl">Thiết kế hũ quà và video hiệu ứng dành riêng cho bạn</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">Thiết kế hũ quà theo phong cách cá nhân, thương hiệu hoặc chủ đề phiên live. Dựng video hiệu ứng riêng theo gift và yêu cầu của user.</p>
          </div>
        </div>
        <div className="grid w-full shrink-0 gap-2 min-[430px]:grid-cols-2 lg:flex lg:w-auto">
          <a href="tel:0795533253" className="rounded-md border border-border-color bg-white/5 px-4 py-3 text-center text-sm font-bold text-white transition-all duration-200 hover:border-secondary hover:bg-secondary/10"><i className="fa-solid fa-phone mr-2 text-secondary" />0795 533 253</a>
          <a href="https://zalo.me/0795533253" target="_blank" rel="noreferrer" className="rounded-md bg-gradient-to-r from-primary to-secondary px-5 py-3 text-center text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5"><i className="fa-solid fa-comment-dots mr-2" />Liên hệ Zalo</a>
        </div>
      </div>
    </section>

    <section id="features" className="scroll-mt-14 border-y border-border-color bg-bg-surface py-14 sm:scroll-mt-16 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 min-[380px]:px-5 lg:px-8">
        <div className="max-w-2xl"><span className="text-xs font-extrabold uppercase text-secondary">Bộ công cụ livestream</span><h2 className="mt-2 font-header text-2xl font-bold leading-tight text-white sm:text-3xl">Mọi hiệu ứng ở đúng nơi bạn cần</h2></div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature) => <article key={feature.title} className="glass-card rounded-lg p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary/10 text-lg text-secondary"><i className={`fa-solid ${feature.icon}`} /></span><h3 className="mt-5 font-header text-base font-bold text-white sm:text-lg">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-text-muted">{feature.text}</p></article>)}</div>
      </div>
    </section>

    <section id="workflow" className="scroll-mt-14 py-14 sm:scroll-mt-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 min-[380px]:px-5 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div><span className="text-xs font-extrabold uppercase text-primary">Từ dashboard đến OBS</span><h2 className="mt-2 font-header text-2xl font-bold text-white sm:text-3xl">Lên sóng trong ba bước</h2><p className="mt-4 text-sm leading-7 text-text-muted">Kết nối tài khoản TikTok, chọn gift và hiệu ứng, sau đó thêm URL overlay vào Browser Source của OBS.</p></div>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border-color bg-border-color sm:grid-cols-3">{['Kết nối TikTok Live', 'Chọn hiệu ứng', 'Mở overlay trên OBS'].map((step, index) => <li key={step} className="bg-bg-surface p-5 sm:p-6"><span className="font-header text-2xl font-bold text-secondary">0{index + 1}</span><strong className="mt-4 block text-sm text-white sm:mt-8">{step}</strong></li>)}</ol>
      </div>
    </section>

    <section id="pricing" className="scroll-mt-14 border-y border-border-color bg-bg-surface py-14 sm:scroll-mt-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 min-[380px]:px-5 lg:px-8">
        <div className="text-center"><span className="text-xs font-extrabold uppercase text-secondary">Gói sử dụng</span><h2 className="mt-2 font-header text-2xl font-bold text-white sm:text-3xl">Bắt đầu miễn phí, nâng cấp khi cần</h2></div>
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={`glass-card relative flex h-full flex-col rounded-lg p-5 sm:p-6 ${plan.accent === 'mixed' ? 'border-secondary shadow-[0_0_24px_var(--color-secondary-glow)] md:col-span-2 lg:col-span-1' : ''}`}>{plan.accent === 'mixed' && <span className="absolute right-4 top-4 text-[0.65rem] font-extrabold uppercase text-secondary">Đầy đủ nhất</span>}<h3 className="font-header text-xl font-bold text-white">{plan.name}</h3><div className="mt-4 font-header text-3xl font-bold text-white">{plan.price}<span className="ml-1 text-xs font-medium text-text-muted">{plan.price !== 'Miễn phí' ? '/ tháng' : ''}</span></div><p className="mt-2 min-h-10 text-sm text-text-muted">{plan.note}</p><ul className="mt-6 grow space-y-3 border-t border-border-color pt-5">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary"><i className="fa-solid fa-check mt-0.5 text-success" /><span>{feature}</span></li>)}</ul><Link href="/login" className={`mt-7 block rounded-md px-4 py-2.5 text-center text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${plan.accent === 'mixed' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'border border-border-color bg-white/5 text-white hover:border-secondary'}`}>{plan.price === 'Miễn phí' ? 'Dùng miễn phí' : `Chọn ${plan.name}`}</Link></article>)}</div>
      </div>
    </section>

    <section className="py-20 text-center"><div className="mx-auto max-w-2xl px-5"><h2 className="font-header text-3xl font-bold text-white">Sẵn sàng làm phiên live nổi bật hơn?</h2><p className="mt-3 text-sm text-text-muted">Tạo tài khoản và thiết lập hiệu ứng đầu tiên ngay hôm nay.</p><Link href="/login" className="mt-7 inline-block rounded-md bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5">Mở TikTok Live Effect</Link></div></section>

    <footer className="border-t border-border-color py-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-text-muted sm:flex-row lg:px-8"><span>© 2026 TikTok Live Effect</span><div className="flex gap-5"><a href="#features" className="hover:text-white">Tính năng</a><a href="#pricing" className="hover:text-white">Bảng giá</a><Link href="/login" className="hover:text-white">Đăng nhập</Link></div></div></footer>
  </main>;
}
