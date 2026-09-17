'use client';

import { useState } from 'react';
import { faqs } from '../lib/landing-data';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
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
  );
}

