import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

/**
 * Google AdSense Banner Component
 * Usage:
 * <AdBanner dataAdSlot="XXXXXXXXXX" />
 * 
 * Make sure to replace the Google AdSense Publisher ID in index.html
 */
export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = ''
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only attempt push if not already pushed for this instance
    if (pushedRef.current) return;

    try {
      if (
        adRef.current &&
        !adRef.current.getAttribute('data-adsbygoogle-status') &&
        adRef.current.children.length === 0
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch (e: any) {
      // Gracefully silence known harmless AdSense duplicate push warnings in SPA navigation
      if (!e?.message?.includes?.('All \'ins\' elements')) {
        console.warn('AdSense notice:', e?.message || e);
      }
    }
  }, []);

  // Temporarily return null to prevent empty spaces and "AdSense keywords" placeholders before AdSense is fully approved.
  // Once you get AdSense approval and your actual publisher ID, you can restore the code below.
  return null;

  /*
  return (
    <div className={`ad-container my-4 text-center overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual publisher ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
  */
}
