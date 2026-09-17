import { features } from '../lib/landing-data';

export default function FeaturesSection() {
  return (
    <>
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
    </>
  );
}

