import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'admin' | 'drawer';
}

export default function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';
  const isAr = currentLang === 'ar';

  const switchLanguage = (lang: 'en' | 'ar') => {
    if (lang === currentLang) return;
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('i18nextLng', lang);
      localStorage.setItem('faris_vip_lang', lang);
      window.dispatchEvent(new CustomEvent('faris_lang_change', { detail: { lang } }));
    } catch (e) {}
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    switchLanguage(nextLang);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`text-xs font-black px-2 sm:px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 ${className}`}
        aria-label={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
        title={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
      >
        <Globe size={13} className="text-emerald-700" />
        <span>{isAr ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>
        <button
          type="button"
          onClick={() => switchLanguage('en')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            !isAr 
              ? 'bg-white text-[var(--color-saudi-green)] shadow-xs border border-slate-200/80' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>English</span>
          {!isAr && <Check size={12} className="text-emerald-600" />}
        </button>

        <button
          type="button"
          onClick={() => switchLanguage('ar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            isAr 
              ? 'bg-white text-[var(--color-saudi-green)] shadow-xs border border-slate-200/80' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>العربية</span>
          {isAr && <Check size={12} className="text-emerald-600" />}
        </button>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-[var(--color-saudi-emerald)] border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer ${className}`}
        aria-label={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
        title={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
      >
        <Globe size={14} />
        <span>{isAr ? 'English' : 'العربية'}</span>
      </button>
    );
  }

  // Default 'pill' variant for Main Header
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`text-sm font-bold px-2 xl:px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:border-[#05513F] hover:text-[#05513F] hover:bg-emerald-50/50 transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 ${className}`}
      aria-label={isAr ? 'Switch language to English' : 'تبديل اللغة إلى العربية'}
      title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <Globe size={13} className="text-emerald-700 shrink-0" />
      <span className="whitespace-nowrap font-sans">{isAr ? 'English' : 'العربية'}</span>
    </button>
  );
}
