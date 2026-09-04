import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { 
  Menu, X, Phone, User, ChevronDown, ChevronRight, Home, 
  Car, MapPin, Sparkles, Compass, Info, HelpCircle, Mail, 
  FileText, Shield, Calendar, MessageSquare, Globe, ArrowRight,
  Search, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useBookingTracker } from '../context/BookingTrackerContext';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { companyName } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const { openWhatsApp } = useWhatsApp();
  const { openTracker } = useBookingTracker();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Track scroll for subtle navbar shadow adjustment
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  const navLinks = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('vehicles'), path: '/vehicles', icon: Car },
    { name: t('routes_rates'), path: '/routes-rates', icon: MapPin },
    { name: t('ziyarat'), path: '/ziyarat', icon: Compass },
    { name: isAr ? 'التقييمات' : 'Reviews', path: '/reviews', icon: Star },
  ];

  const companyLinks = [
    { name: t('services'), path: '/services', icon: Sparkles },
    { name: t('about'), path: '/about-us', icon: Info },
    { name: t('faq'), path: '/faq', icon: HelpCircle },
    { name: t('contact'), path: '/contact', icon: Mail },
    { name: t('terms'), path: '/terms', icon: FileText },
    { name: t('privacy'), path: '/privacy', icon: Shield },
  ];

  return (
    <>
      <header className={clsx(
        "fixed top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md transition-shadow duration-200 border-b border-gray-200/90",
        isScrolled ? "shadow-md" : "shadow-2xs"
      )}>
        {/* Top Utility Ribbon for Laptops and Desktops (lg:flex) */}
        <div className="hidden lg:block bg-gradient-to-r from-emerald-950 via-[#05513F] to-emerald-900 text-white text-[11px] font-semibold py-1.5 px-4 sm:px-6 lg:px-8 border-b border-amber-400/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Assurance badges */}
            <div className="flex items-center gap-4 text-emerald-100">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Shield size={13} className="text-amber-400" />
                <span>{isAr ? 'مرخص ومعتمد من الهيئة العامة للنقل' : 'Licensed & Certified VIP Chauffeur Transport'}</span>
              </span>
              <span className="hidden xl:inline text-emerald-300/60">•</span>
              <span className="hidden xl:flex items-center gap-1 text-emerald-100">
                <Sparkles size={12} className="text-amber-300" />
                <span>{isAr ? 'متابعة حية للرحلات وانتظار مجاني 60 دقيقة في المطار' : 'Live Flight Tracking & 60-Min Free Airport Waiting'}</span>
              </span>
            </div>

            {/* Right: Quick contact hotline & WhatsApp + Track Booking button */}
            <div className="flex items-center gap-3 xl:gap-4">
              <button
                type="button"
                onClick={() => openTracker()}
                className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-white border border-amber-400/35 transition-all text-[11px] font-bold cursor-pointer"
                title={isAr ? 'الاستعلام اللحظي عن حالة الحجز' : 'Instant booking status tracker'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <Search size={11} className="text-amber-300" />
                <span>{isAr ? 'تتبع حالة الحجز' : 'Track Booking'}</span>
              </button>

              <a 
                href="https://wa.me/966576124752"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white hover:text-amber-300 transition-colors"
                aria-label="Contact WhatsApp Support"
              >
                <MessageSquare size={12} className="text-[#25D366]" />
                <span className="font-bold tracking-wider" dir="ltr">+966 57 612 4752</span>
              </a>
              <span className="text-emerald-400/40">|</span>
              <span className="text-emerald-200 font-medium">{isAr ? 'مكة المكرمة • المدينة المنورة • جدة' : 'Makkah • Madinah • Jeddah'}</span>
            </div>
          </div>
        </div>

        {/* Main Header Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="flex items-center shrink-0 py-1" 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Faris VIP Umrah Transport Home"
            >
              <BrandLogo size="md" />
            </Link>

            {/* Laptop & Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2 shrink min-w-0" aria-label="Main Navigation">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={clsx(
                      "flex items-center gap-1 xl:gap-1.5 px-1.5 lg:px-2 xl:px-2.5 py-1.5 rounded-xl text-xs xl:text-[13px] 2xl:text-[14px] font-bold tracking-tight transition-all relative select-none shrink-0",
                      isActive 
                        ? "text-[#05513F] bg-emerald-50/90 font-extrabold shadow-2xs" 
                        : "text-gray-700 hover:text-[#05513F] hover:bg-gray-50/90"
                    )}
                    aria-label={item.name}
                  >
                    <Icon size={13} className={clsx("shrink-0 transition-colors", isActive ? "text-[#05513F]" : "text-gray-400 group-hover:text-[#05513F]")} />
                    <span className="whitespace-nowrap">{item.name}</span>
                    {isActive && (
                      <span className="hidden lg:block absolute bottom-0.5 left-2 right-2 h-0.5 bg-[#05513F] rounded-full" />
                    )}
                  </Link>
                );
              })}
              
              {/* Company Dropdown (Laptop & Desktop) */}
              <div className="relative group shrink-0">
                <button 
                  type="button"
                  className={clsx(
                    "flex items-center gap-1 px-1.5 lg:px-2 xl:px-2.5 py-1.5 rounded-xl text-xs xl:text-[13px] 2xl:text-[14px] font-bold tracking-tight text-gray-700 hover:text-[#05513F] hover:bg-gray-50/90 transition-all cursor-pointer select-none",
                    companyLinks.some(link => location.pathname === link.path) && "text-[#05513F] bg-emerald-50/90 font-extrabold"
                  )}
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-label={t('company')}
                >
                  <Info size={13} className="text-gray-400 group-hover:text-[#05513F] shrink-0" />
                  <span className="whitespace-nowrap">{t('company')}</span>
                  <ChevronDown size={11} aria-hidden="true" className="group-hover:rotate-180 transition-transform duration-200 text-gray-400" />
                </button>
                <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-1.5 w-56 bg-white/98 backdrop-blur-md shadow-xl border border-gray-100 rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 divide-y divide-gray-50" role="menu" aria-label={t('company')}>
                  <div className="py-1">
                    {companyLinks.map(link => {
                      const SubIcon = link.icon;
                      const isSubActive = location.pathname === link.path;
                      return (
                        <Link 
                          key={link.path} 
                          to={link.path} 
                          className={clsx(
                            "flex items-center gap-2.5 px-4 py-2.5 text-xs lg:text-[13px] font-semibold transition-colors",
                            isSubActive 
                              ? "bg-emerald-50 text-[#05513F] font-bold" 
                              : "text-gray-700 hover:bg-emerald-50/60 hover:text-[#05513F]"
                          )}
                          role="menuitem" 
                          aria-label={link.name}
                        >
                          <SubIcon size={15} className="text-emerald-700 shrink-0" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </nav>

            {/* Laptop & Desktop Right Action Cluster */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* Language Switcher */}
              <LanguageSwitcher variant="pill" />

              {/* User Dashboard / Login */}
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="text-sm font-bold uppercase tracking-wider text-gray-800 hover:text-[#05513F] transition-colors flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs active:scale-95" 
                  aria-label={t('dashboard')}
                >
                  <User size={13} className="text-[#05513F] shrink-0" aria-hidden="true" /> 
                  <span className="whitespace-nowrap max-w-[75px] xl:max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="text-sm font-bold uppercase tracking-wider text-gray-700 hover:text-[#05513F] hover:bg-gray-50 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-xl" 
                  aria-label={t('login')}
                >
                  <User size={13} aria-hidden="true" className="shrink-0" /> 
                  <span className="whitespace-nowrap">{t('login')}</span>
                </Link>
              )}

              {/* VIP Book Now Button (Prominent Call to Action) */}
              <Link 
                to="/booking" 
                className="bg-gradient-to-r from-[#05513F] via-[#087A5A] to-[#05513F] hover:opacity-95 active:scale-95 text-white px-2.5 lg:px-3.5 xl:px-4 py-1.5 rounded-xl text-xs xl:text-[13px] font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-amber-400/30"
                aria-label={t('book_now')}
              >
                <Calendar size={13} className="text-amber-300 shrink-0" />
                <span>{t('book_now')}</span>
              </Link>
            </div>

            {/* Mobile Controls (< 1024px) */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
              {/* Mobile Track Button */}
              <button 
                type="button"
                onClick={() => openTracker()}
                className="text-xs font-bold px-2 sm:px-2.5 py-1.5 rounded-lg border border-emerald-300/80 bg-emerald-50 text-[#05513F] hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                aria-label={t('track_booking')}
                title={t('track_booking')}
              >
                <Search size={13} className="text-[#05513F]" />
                <span className="hidden xs:inline">{isAr ? 'حالة الحجز' : 'Track'}</span>
              </button>

              <LanguageSwitcher variant="compact" />

              <button 
                type="button"
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-900 bg-gray-100 hover:bg-emerald-50 active:scale-95 rounded-xl border border-gray-200 transition-all cursor-pointer select-none"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-label="Open mobile navigation menu"
              >
                <Menu size={22} className="text-gray-900 stroke-[2.5]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Sheet */}
            <motion.div 
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 w-full max-h-[92vh] bg-white flex flex-col shadow-2xl rounded-b-3xl border-b border-gray-200 overflow-hidden"
            >
              {/* Header inside Drawer */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <BrandLogo size="md" />
                </Link>

                <div className="flex items-center gap-2">
                  <LanguageSwitcher variant="compact" />

                  <button 
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={20} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {/* User Profile Bar */}
                <div className="p-1">
                  {user ? (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="w-full py-4 px-4 bg-emerald-50 border border-emerald-200 text-[#05513F] rounded-2xl text-xs font-black flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#05513F] text-white flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div className="text-left rtl:text-right">
                          <div className="text-sm font-bold text-gray-500 uppercase">{t('dashboard')}</div>
                          <div className="text-sm font-black text-[#05513F]">{user.name}</div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="rtl:rotate-180 text-[#05513F]" />
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        to="/login" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="py-4 px-4 bg-gray-50 border border-gray-200 hover:border-emerald-600 text-gray-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <User size={16} className="text-gray-600" /> 
                        <span>{t('login')}</span>
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="py-4 px-4 bg-emerald-50 border border-emerald-200 text-[#05513F] rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <span>{isAr ? 'إنشاء حساب' : 'Register'}</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Instant Track Booking Card in Mobile Drawer */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-amber-50/50 rounded-2xl border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#05513F] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Search size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">{isAr ? 'الاستعلام اللحظي' : 'Live Status Checker'}</div>
                      <div className="text-xs font-black text-gray-900">{isAr ? 'تتبع حالة الحجز والسائق' : 'Track Booking & Driver'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openTracker();
                    }}
                    className="px-3.5 py-2 bg-[#05513F] hover:bg-emerald-800 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs shrink-0 cursor-pointer transition-all"
                  >
                    {isAr ? 'استعلام' : 'Check'}
                  </button>
                </div>

                {/* Primary Nav Links */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-black uppercase text-gray-400 px-3 tracking-wider">
                    {isAr ? 'القائمة الرئيسية' : 'Main Menu'}
                  </div>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link 
                        key={link.path} 
                        to={link.path} 
                        className={clsx(
                          "flex items-center justify-between px-4 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-98",
                          isActive 
                            ? "bg-[#05513F] text-white shadow-sm" 
                            : "text-gray-800 bg-gray-50/80 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                            isActive ? "bg-white/20 text-white" : "bg-white text-emerald-800 border border-gray-100"
                          )}>
                            <Icon size={18} />
                          </div>
                          <span>{link.name}</span>
                        </div>
                        <ChevronRight size={18} className={clsx("rtl:rotate-180", isActive ? "text-white" : "text-gray-400")} />
                      </Link>
                    );
                  })}
                </div>

                {/* Company & Support Sub-menu */}
                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setCompanyDropdownOpen(prev => !prev)}
                    className="flex justify-between items-center w-full px-4 py-4 rounded-2xl text-sm font-bold tracking-wide text-gray-800 bg-gray-50/80 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 border border-gray-100 flex items-center justify-center shrink-0">
                        <Info size={18} />
                      </div>
                      <span>{t('company')} & {isAr ? 'الدعم' : 'Support'}</span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={clsx("text-gray-500 transition-transform duration-200", companyDropdownOpen ? "rotate-180" : "")} 
                    />
                  </button>

                  {companyDropdownOpen && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1">
                      {companyLinks.map(link => {
                        const SubIcon = link.icon;
                        const isSubActive = location.pathname === link.path;
                        return (
                          <Link 
                            key={link.path} 
                            to={link.path} 
                            className={clsx(
                              "flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-bold transition-colors",
                              isSubActive ? "text-[#05513F] bg-white font-extrabold shadow-2xs" : "text-gray-700 hover:text-gray-900 hover:bg-white"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <SubIcon size={16} className="text-emerald-700" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Buttons */}
              <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 gap-3 shrink-0 shadow-lg">
                <button 
                  type="button"
                  onClick={() => { 
                    openWhatsApp('general', isAr ? 'السلام عليكم، أرغب في الاستفسار عن خدمات النقل لرحلة العمرة.' : 'Assalamu Alaikum, I would like to inquire about Umrah transport services.');
                    setMobileMenuOpen(false); 
                  }}
                  className="flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#1EBE5D] py-4 px-3 rounded-xl font-black text-xs shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <MessageSquare size={17} />
                  <span className="truncate">{isAr ? 'واتساب مباشر' : 'WhatsApp'}</span>
                </button>

                <Link 
                  to="/booking" 
                  className="flex items-center justify-center gap-2 text-white bg-[#B8922E] hover:bg-amber-600 py-4 px-3 rounded-xl font-black text-xs shadow-md active:scale-98 transition-all text-center cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)} 
                >
                  <Calendar size={17} />
                  <span className="truncate">{t('book_now')}</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}



