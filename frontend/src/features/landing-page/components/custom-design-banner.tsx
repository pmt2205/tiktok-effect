export default function CustomDesignBanner() {
  return (
    <>
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
    </>
  );
}

