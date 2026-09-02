import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';

export default function MobileBottomBar() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openWhatsApp } = useWhatsApp();
  const location = useLocation();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-3 flex gap-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <button 
        onClick={() => openWhatsApp('general', isAr ? 'السلام عليكم، أرغب في الاستفسار عن خدمات النقل.' : 'Assalamu Alaikum, I would like to inquire about Umrah transport.')}
        className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
        aria-label="WhatsApp"
      >
        <Phone size={16} />
        <span>{isAr ? 'تواصل واتساب' : 'WhatsApp'}</span>
      </button>
      <Link 
        to="/booking"
        className="flex-1 bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-all active:scale-98 text-center"
        aria-label={t('book_now')}
      >
        <Calendar size={16} />
        <span>{t('book_now')}</span>
      </Link>
    </div>
  );
}

