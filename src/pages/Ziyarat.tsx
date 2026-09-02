import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Car, 
  Compass, 
  Coffee, 
  Award,
  PhoneCall
} from 'lucide-react';
import ZiyaratMap from '../components/ZiyaratMap';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { ziyaratHero, ziyaratHighlights, ziyaratCallToAction } from '../data/ziyaratContent';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Ziyarat() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openWhatsApp } = useWhatsApp();

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-20">
      <PageCustomRenderer pageKey="ziyarat" position="top" />
      <Helmet>
        <title>{isAr ? 'جولات المزارات | فارس للنقل' : 'Ziyarat Tours | Faris VIP Transport'}</title>
        <meta 
          name="description" 
          content={isAr ? 'استكشف المعالم التاريخية والإسلامية المقدسة في مكة المكرمة والمدينة المنورة مع خدمة النقل الفاخر والخريطة التفاعلية.' : 'Explore the sacred historical sites in Makkah (Cave of Hira, Thawr, Arafat, Mina) and Madinah (Masjid Quba, Mount Uhud, Qiblatayn, Seven Mosques) with our interactive Ziyarat route map and luxury private transport.'} 
        />
        <meta name="keywords" content="Ziyarat transport Makkah, Ziyarat transport Madinah, Makkah Ziyarat tour, Madinah Ziyarat tour, نقل زيارات مكة, نقل زيارات المدينة" />
      </Helmet>
      <Breadcrumbs items={[{ label: t('ziyarat') || 'Ziyarat Tours' }]} />
{/* Hero Header */}
      <div className="bg-white border-b border-slate-200/80 py-10 md:py-14 text-center shadow-2xs">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-[var(--color-saudi-green)] mb-3 border border-slate-200/90 shadow-2xs">
            <Compass size={14} className="text-[var(--color-luxury-gold)]" /> {isAr ? ziyaratHero.badgeAr : ziyaratHero.badgeEn}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-[var(--color-dark-charcoal)] tracking-tight">
            {t('Ziyarat Tours')}
          </h1>
          <p className="text-sm md:text-base max-w-2xl mx-auto text-[var(--color-dark-charcoal)] font-normal">
            {isAr ? ziyaratHero.descriptionAr : ziyaratHero.descriptionEn}
          </p>
        </div>
      </div>

      {/* Interactive Ziyarat Map Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 max-w-7xl">
        <ZiyaratMap />
      </div>

      {/* VIP Ziyarat Experience Highlights */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-7xl">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-saudi-green)] block mb-1">
            {isAr ? 'لماذا تختارنا' : 'Why Choose Faris VIP'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-charcoal)]">
            {isAr ? 'تجربة مزارات استثنائية متكاملة' : 'The Ultimate Ziyarat Experience'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ziyaratHighlights.map((highlight) => {
            const Icon = highlight.icon;
            const BadgeIcon = highlight.badgeIcon;
            return (
              <div key={highlight.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between text-left rtl:text-right">
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-4 shadow-2xs`} style={{ color: highlight.iconColor }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-dark-charcoal)] mb-2">
                    {isAr ? highlight.titleAr : highlight.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-dark-charcoal)]/70 leading-relaxed font-medium">
                    {isAr ? highlight.descriptionAr : highlight.descriptionEn}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <BadgeIcon size={14} className="text-[var(--color-saudi-green)]" /> {isAr ? highlight.badgeTextAr : highlight.badgeTextEn}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Callout Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-2xl mt-14 p-8 sm:p-12 text-center text-white shadow-xl border border-emerald-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-luxury-gold)] text-[var(--color-dark-charcoal)] mb-3 shadow-sm">
              <Sparkles size={13} /> {isAr ? ziyaratCallToAction.badgeAr : ziyaratCallToAction.badgeEn}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
              {isAr ? ziyaratCallToAction.titleAr : ziyaratCallToAction.titleEn}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mb-6 leading-relaxed">
              {isAr ? ziyaratCallToAction.descriptionAr : ziyaratCallToAction.descriptionEn}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link 
                to="/booking" 
                className="bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg"
              >
                {t('book_now')}
              </Link>
              <button
                type="button"
                onClick={() => openWhatsApp('booking', isAr ? ziyaratCallToAction.whatsappMessageAr : ziyaratCallToAction.whatsappMessageEn)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-2"
              >
                <PhoneCall size={14} /> {t('book_via_whatsapp')}
              </button>
            </div>
          </div>
        </div>

      </div>
      <PageCustomRenderer pageKey="ziyarat" position="bottom" />
    </div>
  );
}
