import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, Phone, CalendarCheck, Search } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useBookingTracker } from '../context/BookingTrackerContext';
import clsx from 'clsx';

export default function MobileBottomBar() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openWhatsApp } = useWhatsApp();
  const { openTracker } = useBookingTracker();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: t('home'), path: '/', icon: Home },
    { name: isAr ? 'المسارات' : 'Routes', path: '/routes-rates', icon: MapPin },
    { 
      name: t('book_now'), 
      path: '/booking', 
      icon: CalendarCheck, 
      highlight: true 
    },
    { 
      name: isAr ? 'تتبع الحجز' : 'Track', 
      action: () => openTracker(), 
      icon: Search, 
      isAction: true, 
      color: location.pathname.startsWith('/track') ? 'text-[#05513F]' : 'text-gray-600' 
    },
    { 
      name: isAr ? 'واتساب' : 'WhatsApp', 
      action: () => openWhatsApp('general', isAr ? 'السلام عليكم، أرغب في الاستفسار عن خدمات النقل.' : 'Assalamu Alaikum, I would like to inquire about Umrah transport.'), 
      icon: Phone, 
      isAction: true, 
      color: 'text-[#25D366]' 
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-end z-[60] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,10px)] h-[76px] px-1">
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.path;

        if (item.isAction) {
          return (
             <button key={idx} onClick={item.action} className="flex flex-col items-center justify-center w-full h-[60px] space-y-1 text-gray-500 hover:text-[#25D366] transition-colors pb-1">
               <item.icon size={22} className={item.color} />
               <span className="text-[10px] font-bold text-[#25D366] mt-0.5">{item.name}</span>
             </button>
          )
        }

        if (item.highlight) {
          return (
             <Link key={idx} to={item.path} className="flex flex-col items-center justify-center w-full h-full relative -top-5 z-50">
               <div className="bg-[var(--color-saudi-green)] text-[var(--color-luxury-gold)] p-3.5 rounded-full shadow-xl border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                 <item.icon size={26} strokeWidth={2.5} />
               </div>
               <span className="text-[11px] font-black text-[var(--color-saudi-green)] mt-1.5">{item.name}</span>
             </Link>
          )
        }

        return (
          <Link key={idx} to={item.path} className={clsx("flex flex-col items-center justify-center w-full h-[60px] space-y-1 transition-colors pb-1", isActive ? "text-[var(--color-saudi-green)]" : "text-gray-500 hover:text-gray-900")}>
            <item.icon size={22} className={isActive ? "text-[var(--color-saudi-green)]" : "text-gray-500"} strokeWidth={isActive ? 2.5 : 2} />
            <span className={clsx("text-[10px] font-bold mt-0.5", isActive ? "text-[var(--color-saudi-green)]" : "text-gray-500")}>{item.name}</span>
          </Link>
        )
      })}
    </div>
  );
}
