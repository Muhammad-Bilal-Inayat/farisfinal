import React, { useState } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function BrandLogo({ className = '', size = 'md', showSubtitle = true }: BrandLogoProps) {
  const { companyName } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  // Responsive heights:
  // sm: mobile drawers / compact
  // md: main navbar (h-9 to h-11)
  // lg: footer / hero splash
  const imgClasses = 
    size === 'sm' ? 'h-8 sm:h-9' : 
    size === 'lg' ? 'h-14 sm:h-16' : 
    'h-9 sm:h-10 lg:h-11';

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      {!imgError ? (
        <img 
          src="/image.png" 
          alt={companyName || "Faris VIP Umrah Transport"}
          onError={() => setImgError(true)}
          className={`${imgClasses} w-auto object-contain transition-transform duration-200 hover:scale-105`}
        />
      ) : (
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className={`rounded-xl bg-gradient-to-br from-[#05513F] via-[#087A5A] to-[#023126] text-white flex items-center justify-center font-black shadow-md border border-amber-400/40 shrink-0 ${
            size === 'sm' ? 'w-8 h-8 text-xs' :
            size === 'lg' ? 'w-12 h-12 text-base' :
            'w-9 h-9 sm:w-10 sm:h-10 text-sm'
          }`}>
            <span className="text-amber-300 font-serif font-black">F</span>
          </div>
          <div className="flex flex-col text-left rtl:text-right leading-tight">
            <div className={`font-black tracking-tight text-[#0c2e22] flex items-center gap-1 ${
              size === 'sm' ? 'text-xs sm:text-sm' :
              size === 'lg' ? 'text-lg sm:text-xl' :
              'text-xs sm:text-sm lg:text-base'
            }`}>
              <span>FARIS</span>
              <span className="text-amber-600 font-extrabold">VIP</span>
            </div>
            {showSubtitle && (
              <span className={`text-[9px] sm:text-[10px] text-emerald-800 font-bold tracking-wider uppercase ${
                size === 'sm' ? 'hidden' : 'block'
              }`}>
                Umrah Transport
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

