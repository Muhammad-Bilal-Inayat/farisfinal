import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean; // Kept for backwards compatibility but not used since text is in image
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const { companyName } = useSiteSettings();

  // Define responsive heights based on size to ensure perfect scaling across Mobile, Tablet, PC
  // The new logo contains both emblem and text, so it needs to be slightly taller to read well.
  const sizeClasses = 
    size === 'sm' ? 'h-12 sm:h-14' : 
    size === 'lg' ? 'h-24 sm:h-28 lg:h-32' : 
    'h-14 sm:h-16 lg:h-20 xl:h-24';

  return (
    <div className={`flex items-center select-none ${className}`}>
        
      <img width="200" height="80"  
        src="/image.png" 
        alt={companyName || "Faris VIP Umrah Transport"}
        className={`${sizeClasses} w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105`}
      />
    </div>
  );
}
