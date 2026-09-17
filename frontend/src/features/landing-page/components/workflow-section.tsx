import { WORKFLOW_STEPS } from '../lib/landing-data';

export default function WorkflowSection() {
  return (
    <>
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
            {WORKFLOW_STEPS.map((item) => (
              <div key={item.step} className="glass-card relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1">
                <span className="font-header text-4xl font-extrabold text-secondary opacity-80">{item.step}</span>
                <h3 className="mt-4 font-header text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
