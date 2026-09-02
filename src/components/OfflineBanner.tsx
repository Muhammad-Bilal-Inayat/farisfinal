import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Phone, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <aside aria-label="Connection Status" className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>{isAr ? 'تمت استعادة الاتصال بالإنترنت' : 'Back Online — Connection Restored'}</span>
      </aside>
    );
  }

  return (
    <aside aria-label="Connection Status" className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-amber-500 text-white px-4 py-2 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-100 shrink-0" />
          <span>
            {isAr 
              ? 'وضع السفر بلا إنترنت نشط: يمكنك استعراض كافة الأسعار والأسطول المحفوظ.' 
              : 'Travel Offline Mode Active: Cached Umrah routes, rates & fleet specs available.'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://wa.me/966576124752?text=Assalamu%20Alaikum,%20I%20need%20VIP%20Umrah%20transport%20assistance%20(Offline%20Mode)."
            className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'واتساب 24/7' : 'WhatsApp 24/7'}</span>
          </a>
          <a 
            href="tel:+966576124752"
            className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'اتصال مباشر' : 'Direct Call'}</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
