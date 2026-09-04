import React, { useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useLocation } from 'react-router-dom';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

export default function AdBanner({ slotId, format = 'auto', responsive = true, className = '' }: AdBannerProps) {
  const settings = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings.adsenseEnabled === 'true' && slotId && typeof window !== 'undefined') {
      try {
        // Push ad instruction to adsbygoogle array
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense Error: ", e);
      }
    }
  }, [settings.adsenseEnabled, slotId, location.pathname]);

  if (settings.adsenseEnabled !== 'true' || !slotId) {
    return null;
  }

  const isSandbox = settings.adsenseSandbox === 'true';

  if (isSandbox) {
    return (
      <div className={`w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-8 text-slate-400 my-4 min-h-[100px] ${className}`}>
        <span className="font-bold uppercase tracking-widest text-xs">AdSense Slot</span>
        <span className="font-mono text-[10px] mt-1">{slotId}</span>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden flex justify-center my-4 min-h-[100px] ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={settings.adsensePublisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
