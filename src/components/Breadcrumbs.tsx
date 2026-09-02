import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t('home'),
        "item": typeof window !== 'undefined' ? window.location.origin + "/" : "/"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": typeof window !== 'undefined' ? (item.path ? window.location.origin + item.path : window.location.href) : (item.path || "")
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className={`py-3 px-4 bg-gray-50 border-b border-gray-200 hidden md:block ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl flex items-center text-sm overflow-x-auto whitespace-nowrap hide-scrollbar">
        <Link 
          to="/" 
          className="text-gray-500 hover:text-[var(--color-saudi-green)] transition-colors flex items-center gap-1.5"
          aria-label={t('home')}
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">{t('home')}</span>
        </Link>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center">
              <ChevronRight className={`w-4 h-4 text-gray-400 mx-1.5 flex-shrink-0 ${isAr ? 'rotate-180' : ''}`} />
              {isLast || !item.path ? (
                <span className="text-gray-900 font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-gray-500 hover:text-[var(--color-saudi-green)] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
    </nav>
  );
}
