import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface PageCustomConfig {
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescriptionEn?: string;
  seoDescriptionAr?: string;
  seoKeywords?: string;
  topHtml?: string;
  topHtmlAr?: string;
  bottomHtml?: string;
  bottomHtmlAr?: string;
  customCss?: string;
  customJs?: string;
  fullOverrideHtml?: string;
  fullOverrideHtmlAr?: string;
  enableFullOverride?: boolean;
  isActive?: boolean;
}

interface PageCustomRendererProps {
  pageKey: string;
  position?: 'top' | 'bottom';
  children?: React.ReactNode;
}

// In-memory cache for fast client switching
const pageConfigCache: Record<string, PageCustomConfig> = {};

export function usePageCustom(pageKey: string) {
  const [config, setConfig] = useState<PageCustomConfig>(() => pageConfigCache[pageKey] || {});

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/page_custom/${pageKey}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data) {
          pageConfigCache[pageKey] = data;
          setConfig(data);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [pageKey]);

  return config;
}

export default function PageCustomRenderer({ pageKey, position = 'top', children }: PageCustomRendererProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const config = usePageCustom(pageKey);

  // Inject custom CSS for this page
  useEffect(() => {
    if (!config.customCss) return;
    const styleId = `custom-page-css-${pageKey}`;
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = config.customCss;

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [config.customCss, pageKey]);

  // Inject custom JS script for this page
  useEffect(() => {
    if (!config.customJs) return;
    const scriptId = `custom-page-js-${pageKey}`;
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'text/javascript';
      scriptTag.text = `try { ${config.customJs} } catch(e) { console.error('Custom JS error for ${pageKey}:', e); }`;
      document.body.appendChild(scriptTag);
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [config.customJs, pageKey]);

  if (config.isActive && config.enableFullOverride) {
    if (position === 'top') {
      const fullHtml = isAr ? (config.fullOverrideHtmlAr || config.fullOverrideHtml) : config.fullOverrideHtml;
      const currentTitle = isAr ? config.seoTitleAr : config.seoTitleEn;
      const currentDesc = isAr ? config.seoDescriptionAr : config.seoDescriptionEn;
      return (
        <>
          {(currentTitle || currentDesc || config.seoKeywords) && (
            <Helmet>
              {currentTitle && <title>{currentTitle}</title>}
              {currentDesc && <meta name="description" content={currentDesc} />}
              {config.seoKeywords && <meta name="keywords" content={config.seoKeywords} />}
            </Helmet>
          )}
          {fullHtml && (
            <div
              id={`custom-full-override-${pageKey}`}
              className="w-full transition-all duration-300 min-h-screen"
              dangerouslySetInnerHTML={{ __html: fullHtml }}
            />
          )}
        </>
      );
    }
    // If it's a full override and we are at the 'bottom' position, render nothing (since top handled it)
    return null;
  }

  if (position === 'top') {
    const currentTopHtml = isAr ? (config.topHtmlAr || config.topHtml) : config.topHtml;
    const currentTitle = isAr ? config.seoTitleAr : config.seoTitleEn;
    const currentDesc = isAr ? config.seoDescriptionAr : config.seoDescriptionEn;

    return (
      <>
        {(currentTitle || currentDesc || config.seoKeywords) && (
          <Helmet>
            {currentTitle && <title>{currentTitle}</title>}
            {currentDesc && <meta name="description" content={currentDesc} />}
            {config.seoKeywords && <meta name="keywords" content={config.seoKeywords} />}
          </Helmet>
        )}

        {currentTopHtml && (
          <div
            id={`custom-top-section-${pageKey}`}
            className="w-full transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: currentTopHtml }}
          />
        )}
        {children}
      </>
    );
  }

  if (position === 'bottom') {
    const currentBottomHtml = isAr ? (config.bottomHtmlAr || config.bottomHtml) : config.bottomHtml;

    return (
      <>
        {children}
        {currentBottomHtml && (
          <div
            id={`custom-bottom-section-${pageKey}`}
            className="w-full transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: currentBottomHtml }}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}
