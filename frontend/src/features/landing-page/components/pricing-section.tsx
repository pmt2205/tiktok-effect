'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { plans } from '../lib/landing-data';

const ContactSubscriptionModal = dynamic(() => import('./contact-subscription-modal'));

export default function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <>
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
                {'renewalPrice' in plan && plan.renewalPrice && (
                  <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[0.7rem] font-bold text-primary">
                    <i className="fa-solid fa-rotate" />
                    <span>Gia hạn: {plan.renewalPrice}</span>
                  </div>
                )}
                <p className="mt-2 text-xs text-text-muted min-h-[32px]">{plan.note}</p>

                <ul className="mt-6 grow space-y-3 border-t border-border-color pt-6 text-xs text-text-secondary">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-success text-sm shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.price === 'Miễn phí' ? <Link
                  href="/login"
                  className="mt-8 block rounded-xl border border-border-color bg-white/5 py-3 text-center text-xs font-extrabold text-white transition-all duration-300 hover:border-secondary focus:border-secondary focus:outline-none focus:ring-3 focus:ring-secondary-glow"
                >
                  Dùng thử miễn phí
                </Link> : <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`mt-8 block w-full cursor-pointer rounded-xl py-3 text-center text-xs font-extrabold transition-all duration-300 focus:outline-none focus:ring-3 focus:ring-secondary-glow ${
                    plan.popular
                      ? 'keep-white bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_16px_var(--color-primary-glow)] hover:-translate-y-0.5'
                      : 'border border-border-color bg-white/5 text-white hover:border-secondary'
                  }`}
                >
                  Đăng ký {plan.name}
                </button>}
              </article>
            ))}
          </div>
        </div>
      </section>
      {selectedPlan && <ContactSubscriptionModal planName={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </>
  );
}
