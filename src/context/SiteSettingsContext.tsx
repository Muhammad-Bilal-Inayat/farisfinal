import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettings {
  companyName: string;
  websiteDomain: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  popupEnabled?: string;
  popupTitle?: string;
  popupDescription?: string;
  popupImageBase64?: string;
  homePageConfig?: string;
}

const SiteSettingsContext = createContext<SiteSettings>({
  companyName: 'Faris VIP Umrah Transport',
  websiteDomain: 'FarisVIPUmrahTransport.com'
});

export const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('faris_site_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      companyName: 'Faris VIP Umrah Transport',
      websiteDomain: 'FarisVIPUmrahTransport.com'
    };
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.companyName && data.websiteDomain) {
          setSettings(data);
          try {
            localStorage.setItem('faris_site_settings', JSON.stringify(data));
          } catch (e) {}
          
          // Dynamically update document title and canonicals
          document.title = data.seoTitle || `${data.companyName} | VIP Umrah Transportation in Saudi Arabia`;
          
          if (data.seoDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', data.seoDescription);
          }

          if (data.seoKeywords) {
            let metaKey = document.querySelector('meta[name="keywords"]');
            if (!metaKey) {
              metaKey = document.createElement('meta');
              metaKey.setAttribute('name', 'keywords');
              document.head.appendChild(metaKey);
            }
            metaKey.setAttribute('content', data.seoKeywords);
          }

          const canonical = document.querySelector('link[rel="canonical"]');
          if (canonical) canonical.setAttribute('href', `https://${data.websiteDomain}/`);
          
          const ogUrl = document.querySelector('meta[property="og:url"]');
          if (ogUrl) ogUrl.setAttribute('content', `https://${data.websiteDomain}/`);

          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', data.seoTitle || data.companyName);

          // Update favicon dynamically
          let icon = document.querySelector('link[rel="icon"]');
          if (!icon) {
            icon = document.createElement('link');
            icon.setAttribute('rel', 'icon');
            document.head.appendChild(icon);
          }
          icon.setAttribute('href', '/uploads/logo.png');
        }
      })
      .catch(console.error);
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
