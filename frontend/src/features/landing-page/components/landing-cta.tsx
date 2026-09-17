import Link from 'next/link';

export default function LandingCta() {
  return (
    <>
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
    </>
  );
}

