import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function About() {
  const { companyName } = useSiteSettings();
  const { t, i18n } = useTranslation();
  
  const isAr = i18n.language === 'ar';

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-20">
      <PageCustomRenderer pageKey="about" position="top" />
      <Helmet>
        <title>{isAr ? `من نحن | ${companyName}` : `About Us | ${companyName}`}</title>
        <meta name="description" content={isAr ? 'تعرف على شركة فارس للنقل، المتخصصة في تقديم خدمات النقل الفاخرة لكبار الشخصيات والمعتمرين في المملكة العربية السعودية.' : 'Learn about Faris VIP Transport, specializing in luxury transportation for VIPs and pilgrims in Saudi Arabia.'} />
        <meta name="keywords" content="Umrah transport, VIP Umrah transport, private Umrah transportation, Umrah car service, نقل عمرة, سيارات خاصة للعمرة" />
      </Helmet>
      <Breadcrumbs items={[{ label: t('about') || 'About Us' }]} />
<div className="bg-white border-b border-slate-200/80 py-12 text-center shadow-2xs">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-dark-charcoal)]">
          {t('about_page_title')} {companyName}
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-[var(--color-dark-charcoal)] font-normal">
          {t('about_page_subtitle')}
        </p>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90 mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-dark-charcoal)] mb-4">{t('our_mission')}</h2>
          <p className="text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium mb-6">
            {t('our_mission_desc')}
          </p>
          <p className="text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium">
            {t('our_mission_desc2')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90">
            <h3 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-4">{t('our_values')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[var(--color-saudi-green)] mt-0.5 shrink-0 shadow-2xs">✓</div>
                <span className="text-[var(--color-dark-charcoal)]/70 font-medium"><strong>{t('val_excellence')}:</strong> {t('val_excellence_desc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[var(--color-saudi-green)] mt-0.5 shrink-0 shadow-2xs">✓</div>
                <span className="text-[var(--color-dark-charcoal)]/70 font-medium"><strong>{t('val_integrity')}:</strong> {t('val_integrity_desc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[var(--color-saudi-green)] mt-0.5 shrink-0 shadow-2xs">✓</div>
                <span className="text-[var(--color-dark-charcoal)]/70 font-medium"><strong>{t('val_respect')}:</strong> {t('val_respect_desc')}</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90">
            <h3 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-4">{t('why_book_with_us')}</h3>
            <p className="text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium">
              {t('why_book_with_us_desc')}
            </p>
          </div>
        </div>
      </div>
      <PageCustomRenderer pageKey="about" position="bottom" />
    </div>
  );
}

