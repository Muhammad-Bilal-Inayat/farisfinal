import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useTranslation } from 'react-i18next';

export default function PromoPopup() {
  const { popupEnabled, popupTitle, popupDescription, popupImageBase64 } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (popupEnabled === 'true') {
      const hasSeen = sessionStorage.getItem('promo_popup_seen');
      if (!hasSeen) {
        // Delay popup slightly for better UX
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [popupEnabled]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('promo_popup_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>
        
        {popupImageBase64 && (
          <img width="500" height="250" loading="lazy" decoding="async" src={popupImageBase64} alt={popupTitle || 'Promo'} className="w-full h-56 sm:h-64 object-cover" />
        )}
        
        <div className="p-6 sm:p-8 text-center">
          {popupTitle && <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{popupTitle}</h3>}
          {popupDescription && <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">{popupDescription}</p>}
          
          <button 
            onClick={handleClose}
            className="w-full py-3.5 px-6 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
          >
            {isAr ? 'حسناً، فهمت' : 'Okay, I understand'}
          </button>
        </div>
      </div>
    </div>
  );
}
