import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Faq() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') }
  ];

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-20">
      <PageCustomRenderer pageKey="faq" position="top" />
      <Helmet>
        <title>{isAr ? 'الأسئلة الشائعة | شركة فارس للنقل' : 'FAQ | Faris VIP Umrah Transport'}</title>
        <meta name="description" content={isAr ? 'إجابات على أكثر الأسئلة شيوعاً حول حجز خدمات النقل والتوصيل للعمرة والزيارات بين مكة المكرمة والمدينة المنورة ومطار جدة.' : 'Frequently asked questions about VIP Umrah transportation, pricing, luggage allowance, and bookings across Saudi Arabia.'} />
      </Helmet>
      <Breadcrumbs items={[{ label: t('faq') || 'FAQ' }]} />

      <div className="bg-white border-b border-slate-200/80 py-12 text-center shadow-2xs">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-dark-charcoal)]">{t('faq_page_title')}</h1>
        <p className="text-lg max-w-2xl mx-auto text-[var(--color-dark-charcoal)] font-normal">{t('faq_page_subtitle')}</p>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-3xl">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition-all">
              <button 
                className="w-full text-left rtl:text-right px-6 py-5 flex justify-between items-center font-bold text-[var(--color-dark-charcoal)] hover:bg-slate-50/70 transition-colors cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-base sm:text-lg font-bold">{faq.q}</span>
                {open === i ? <ChevronUp size={20} className="text-[var(--color-saudi-green)] shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-[var(--color-dark-charcoal)]/80 font-medium leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <PageCustomRenderer pageKey="faq" position="bottom" />
    </div>
  );
}

