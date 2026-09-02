import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Code,
  Globe,
  Palette,
  FileCode,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Search,
  Layers,
  HelpCircle,
  Check,
  RefreshCw,
  AlertTriangle,
  Code2
} from "lucide-react";
import { PageCustomConfig } from '../../components/PageCustomRenderer';

interface PageItem {
  key: string;
  nameEn: string;
  nameAr: string;
  path: string;
  icon: string;
  descriptionEn: string;
  descriptionAr: string;
}

const ALL_PAGES: PageItem[] = [
  {
    key: 'home',
    nameEn: 'Home Page',
    nameAr: 'الصفحة الرئيسية',
    path: '/',
    icon: '🏠',
    descriptionEn: 'Main landing page with hero banner, fleet highlights, and instant booking.',
    descriptionAr: 'الصفحة الرئيسية ومقدمة الموقع وحجز الأسطول السريع.'
  },
  {
    key: 'about',
    nameEn: 'About Us',
    nameAr: 'من نحن',
    path: '/about-us',
    icon: 'ℹ️',
    descriptionEn: 'Company history, VIP mission statement, and core values.',
    descriptionAr: 'معلومات عن الشركة ورسالة الخدمة الفاخرة لكبار الشخصيات.'
  },
  {
    key: 'vehicles',
    nameEn: 'Vehicles & Fleet',
    nameAr: 'الأسطول والسيارات',
    path: '/vehicles',
    icon: '🚗',
    descriptionEn: 'Complete fleet catalogue (GMC, Camry, HiAce, Staria, Coaster, Buses).',
    descriptionAr: 'كتالوج الأسطول الكامل مع صور وتفاصيل السيارات.'
  },
  {
    key: 'routes_rates',
    nameEn: 'Routes & Rates',
    nameAr: 'المسارات والأسعار',
    path: '/routes-rates',
    icon: '🗺️',
    descriptionEn: 'Fixed price tables for all 17 Umrah intercity routes and airport transfers.',
    descriptionAr: 'قوائم الأسعار الثابتة لجميع مسارات النقل والتوصيل.'
  },
  {
    key: 'services',
    nameEn: 'Services',
    nameAr: 'خدماتنا',
    path: '/services',
    icon: '⭐',
    descriptionEn: 'VIP Chauffeur, Airport Meet & Greet, Corporate and Group services.',
    descriptionAr: 'خدمات الاستقبال في المطار والنقل الفاخر والتنقل بين المدن.'
  },
  {
    key: 'ziyarat',
    nameEn: 'Ziyarat Tours',
    nameAr: 'رحلات المزارات',
    path: '/ziyarat',
    icon: '🕌',
    descriptionEn: 'Interactive holy sites guide for Makkah, Madinah, Taif, and Badr.',
    descriptionAr: 'دليل مزارات مكة المكرمة والمدينة المنورة والطائف وبدر.'
  },
  {
    key: 'faq',
    nameEn: 'FAQ',
    nameAr: 'الأسئلة الشائعة',
    path: '/faq',
    icon: '❓',
    descriptionEn: 'Frequently asked questions regarding pricing, booking, and luggage.',
    descriptionAr: 'إجابات الأسئلة الشائعة حول الحجوزات والأسعار والأمتعة.'
  },
  {
    key: 'contact',
    nameEn: 'Contact Us',
    nameAr: 'اتصل بنا',
    path: '/contact',
    icon: '📞',
    descriptionEn: 'Contact form, WhatsApp dispatch numbers, and office locations.',
    descriptionAr: 'نموذج الاتصال، أرقام الواتساب وموقع المكتب.'
  },
  {
    key: 'booking',
    nameEn: 'Booking Page',
    nameAr: 'صفحة الحجز',
    path: '/booking',
    icon: '📋',
    descriptionEn: 'Interactive trip booking workflow, vehicle selector, and checkout.',
    descriptionAr: 'خطوات حجز الرحلات واختيار السيارة وتأكيد الطلب.'
  },
  {
    key: 'terms',
    nameEn: 'Terms & Conditions',
    nameAr: 'الشروط والأحكام',
    path: '/terms',
    icon: '📜',
    descriptionEn: 'Booking rules, cancellation terms, and chauffeur policies.',
    descriptionAr: 'شروط الحجز وسياسات الإلغاء وحقوق العملاء.'
  },
  {
    key: 'privacy',
    nameEn: 'Privacy Policy',
    nameAr: 'سياسة الخصوصية',
    path: '/privacy',
    icon: '🔒',
    descriptionEn: 'Customer data safety, payment handling, and privacy standards.',
    descriptionAr: 'سياسة حماية البيانات وخصوصية عملاء وزوار الموقع.'
  }
];

const CODE_SNIPPETS = [
  {
    titleEn: 'VIP Announcement Banner',
    titleAr: 'شريط إعلان VIP علوي',
    category: 'HTML',
    code: `<div class="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white py-3 px-4 shadow-md text-center text-sm font-semibold flex items-center justify-center gap-2">
  <span>✨ Special Umrah Season Offer: 10% Discount on Madinah Ziyarat Tours!</span>
  <a href="/booking?service=ziyarat" class="underline font-bold hover:text-amber-100 ml-2">Book Now &rarr;</a>
</div>`
  },
  {
    titleEn: '24/7 WhatsApp Support Card',
    titleAr: 'بطاقة دعم واتساب 24/7',
    category: 'HTML',
    code: `<div class="my-8 max-w-4xl mx-auto p-6 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">📱</div>
    <div>
      <h4 class="font-bold text-emerald-950 text-lg">Need Immediate Chauffeur Dispatch?</h4>
      <p class="text-sm text-emerald-800">Our VIP transport coordinators are online on WhatsApp 24 hours a day.</p>
    </div>
  </div>
  <a href="https://wa.me/966576124752?text=Assalamu%20Alaikum,%20I%20need%20VIP%20transport%20assistance" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md">
    Chat on WhatsApp
  </a>
</div>`
  },
  {
    titleEn: 'Trust Badges Row (3 Columns)',
    titleAr: 'شريط ميزات وضمانات الجودة',
    category: 'HTML',
    code: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 max-w-5xl mx-auto px-4">
  <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
    <div class="text-3xl mb-2">⭐</div>
    <h5 class="font-bold text-slate-900 mb-1">5-Star Rated Service</h5>
    <p class="text-xs text-slate-600">Rated 4.9/5 by over 1,800+ international Umrah pilgrims.</p>
  </div>
  <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
    <div class="text-3xl mb-2">🛡️</div>
    <h5 class="font-bold text-slate-900 mb-1">Licensed Chauffeurs</h5>
    <p class="text-xs text-slate-600">All drivers possess official Ministry of Transport permits.</p>
  </div>
  <div class="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
    <div class="text-3xl mb-2">💵</div>
    <h5 class="font-bold text-slate-900 mb-1">Guaranteed Fixed Rates</h5>
    <p class="text-xs text-slate-600">No surge pricing, hidden parking tolls, or luggage fees.</p>
  </div>
</div>`
  },
  {
    titleEn: 'Custom Gold Highlight Styling (CSS)',
    titleAr: 'تنسيق الخطوط والألوان الذهبية (CSS)',
    category: 'CSS',
    code: `/* Custom Gold Glow for headings and buttons */
.vip-gold-glow {
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.8) !important;
}

.vip-badge-pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}`
  },
  {
    titleEn: 'Google Analytics / GTM Script',
    titleAr: 'كود التتبع والإحصائيات (JS)',
    category: 'JS',
    code: `console.log("VIP Page Tracking Active: " + window.location.pathname);
// You can initialize Google Tag Manager or Meta Pixel here
window.dataLayer = window.dataLayer || [];`
  }
];

export default function PagesCodeEditorAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [activeEditorTab, setActiveEditorTab] = useState<'html' | 'css' | 'js' | 'seo' | 'preview' | 'react_source'>('html');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [reactSourceCode, setReactSourceCode] = useState("");
  const [loadingSource, setLoadingSource] = useState(false);

  // All pages configs in memory
  const [allConfigs, setAllConfigs] = useState<Record<string, PageCustomConfig>>({});
  const [currentConfig, setCurrentConfig] = useState<PageCustomConfig>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);

  const token = localStorage.getItem('adminToken');

  // Load all custom page configs from server
  useEffect(() => {
    fetchAllPageConfigs();
  }, []);

  const fetchAllPageConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/page_custom');
      if (res.ok) {
        const data = await res.json();
        setAllConfigs(data);
        if (data[selectedPageKey]) {
          setCurrentConfig(data[selectedPageKey]);
        }
      }
    } catch (e) {
      console.error('Failed to load page configs', e);
    } finally {
      setLoading(false);
    }
  };

  // Switch selected page
  const handleSelectPage = (pageKey: string) => {
    setSelectedPageKey(pageKey);
    setCurrentConfig(allConfigs[pageKey] || {});
    setPreviewKey(prev => prev + 1);
  };

  // Update current config field
  const handleConfigChange = (field: keyof PageCustomConfig, value: any) => {
    const updated = { ...currentConfig, [field]: value };
    setCurrentConfig(updated);
    setAllConfigs(prev => ({ ...prev, [selectedPageKey]: updated }));
  };

  // Save current page changes to server
  
  const PAGE_FILE_MAP: Record<string, string> = {
    'home': 'Home.tsx',
    'about': 'About.tsx',
    'vehicles': 'Vehicles.tsx',
    'routes_rates': 'RoutesRates.tsx',
    'services': 'Services.tsx',
    'ziyarat': 'Ziyarat.tsx',
    'faq': 'Faq.tsx',
    'contact': 'Contact.tsx',
    'terms': 'Terms.tsx',
    'privacy': 'Privacy.tsx',
    'booking': 'Booking.tsx'
  };

  const fetchReactSource = async (key: string) => {
    const filename = PAGE_FILE_MAP[key];
    if (!filename) return;
    setLoadingSource(true);
    setReactSourceCode('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/source/${filename}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.content) {
        setReactSourceCode(data.content);
      }
    } catch (e) {
      console.error("Error fetching source", e);
    } finally {
      setLoadingSource(false);
    }
  };

  const saveReactSource = async () => {
    const filename = PAGE_FILE_MAP[selectedPageItem.key];
    if (!filename) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/source/${filename}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reactSourceCode })
      });
      const data = await res.json();
      if (data.success) {
        alert(isAr ? 'تم حفظ التعديلات بنجاح. قد تتطلب التغييرات إعادة بناء الموقع.' : 'Source code saved successfully. Changes may require a rebuild in production.');
      } else {
        alert("Error saving: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrentPage = async () => {
    if (!token) {
      setToastMessage({ text: isAr ? 'يرجى تسجيل الدخول مجدداً' : 'Please log in again', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/page_custom/${selectedPageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentConfig)
      });

      if (res.ok) {
        setToastMessage({
          text: isAr
            ? `تم حفظ وتحديث كود صفحة (${selectedPageItem?.nameAr || selectedPageKey}) بنجاح مباشر!`
            : `Code & Content for (${selectedPageItem?.nameEn || selectedPageKey}) saved and synced live!`,
          type: 'success'
        });
        setPreviewKey(prev => prev + 1);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      setToastMessage({ text: isAr ? 'فشل حفظ التعديلات' : 'Failed to save changes', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Reset current page config to default
  const handleResetToDefault = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من رغبتك في استعادة الكود الافتراضي لهذه الصفحة؟' : 'Are you sure you want to reset this page to default template code?')) {
      const emptyConfig: PageCustomConfig = {};
      setCurrentConfig(emptyConfig);
      setAllConfigs(prev => ({ ...prev, [selectedPageKey]: emptyConfig }));
      setToastMessage({
        text: isAr ? 'تمت استعادة الإعدادات الافتراضية. اضغط "حفظ ومزامنة" لتطبيقها' : 'Reset to default template. Click Save to apply.',
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Copy snippet or insert directly
  const handleInsertSnippet = (snippet: typeof CODE_SNIPPETS[0], index: number) => {
    if (snippet.category === 'HTML') {
      const current = currentConfig.topHtml || '';
      handleConfigChange('topHtml', current ? `${current}\n\n${snippet.code}` : snippet.code);
    } else if (snippet.category === 'CSS') {
      const current = currentConfig.customCss || '';
      handleConfigChange('customCss', current ? `${current}\n\n${snippet.code}` : snippet.code);
    } else if (snippet.category === 'JS') {
      const current = currentConfig.customJs || '';
      handleConfigChange('customJs', current ? `${current}\n\n${snippet.code}` : snippet.code);
    }

    setCopiedSnippetIndex(index);
    setToastMessage({
      text: isAr ? 'تم إدراج الكود في المحرر بنجاح!' : 'Snippet inserted into editor!',
      type: 'success'
    });
    setTimeout(() => {
      setCopiedSnippetIndex(null);
      setToastMessage(null);
    }, 2500);
  };

  const selectedPageItem = ALL_PAGES.find(p => p.key === selectedPageKey) || ALL_PAGES[0];

  const filteredPages = ALL_PAGES.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q) || p.path.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/50'
              : 'bg-red-950 text-red-200 border-red-500/50'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-red-400" />}
          <span className="text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-saudi-green)] uppercase tracking-wider mb-2">
            <Code size={16} />
            <span>{isAr ? 'إدارة أكواد ومحتوى الصفحات' : 'All Pages Code & Live Content Manager'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'تعديل كود ومحتوى جميع الصفحات' : 'Edit Code & Content for Every Page'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {isAr
              ? 'يمكنك تعديل كود HTML، وتنسيقات CSS، وأكواد JavaScript، ونصوص SEO لكل صفحة على حدة، وتظهر التعديلات مباشرة على الموقع الحي فور حفظها.'
              : 'Select any page to view and edit its custom HTML sections, CSS styling, JavaScript scripts, and SEO meta tags. Changes sync directly to the live site.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'استعادة الكود الافتراضي' : 'Reset to Default Template'}
          >
            <RotateCcw size={15} />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Default'}</span>
          </button>

          <button
            onClick={handleSaveCurrentPage}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isAr ? (saving ? 'جاري الحفظ...' : 'حفظ ومزامنة فورية') : (saving ? 'Saving...' : 'Save & Sync Live')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sidebar for Pages List + Right Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pages List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers size={16} className="text-[var(--color-saudi-green)]" />
                <span>{isAr ? 'قائمة الصفحات (11 صفحة)' : 'Pages Directory (11 Pages)'}</span>
              </h3>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {ALL_PAGES.length} Total
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في الصفحات...' : 'Search page...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] rtl:pr-9 rtl:pl-3"
              />
            </div>

            {/* Page Buttons List */}
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredPages.map(page => {
                const isSelected = selectedPageKey === page.key;
                const hasCustomCode = Boolean(
                  allConfigs[page.key]?.topHtml ||
                  allConfigs[page.key]?.bottomHtml ||
                  allConfigs[page.key]?.customCss ||
                  allConfigs[page.key]?.customJs ||
                  allConfigs[page.key]?.seoTitleEn
                );

                return (
                  <button
                    key={page.key}
                    onClick={() => handleSelectPage(page.key)}
                    className={`w-full text-left rtl:text-right p-3 rounded-xl transition-all duration-200 flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-saudi-green)] text-white border-[var(--color-saudi-green)] shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{page.icon}</span>
                      <div className="min-w-0">
                        <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {isAr ? page.nameAr : page.nameEn}
                        </div>
                        <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {page.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasCustomCode && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                          }`}
                          title="Contains custom code overrides"
                        >
                          {isAr ? 'معدل' : 'Custom'}
                        </span>
                      )}
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className={`p-1 rounded-md transition-colors ${
                          isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                        }`}
                        title="View Live Page"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Snippets Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-3">
              <Sparkles size={14} className="text-amber-500" />
              <span>{isAr ? 'مكتبة الأكواد الجاهزة (1-Click)' : 'Ready Code Snippets Library'}</span>
            </h4>
            <div className="space-y-2">
              {CODE_SNIPPETS.map((snippet, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-all flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {isAr ? snippet.titleAr : snippet.titleEn}
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {snippet.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleInsertSnippet(snippet, idx)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-[var(--color-saudi-green)] border border-slate-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    {copiedSnippetIndex === idx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedSnippetIndex === idx ? (isAr ? 'تم الإدراج' : 'Inserted') : (isAr ? 'إدراج' : 'Insert')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Workspace Top Header with Tabs */}
            <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedPageItem.icon}</span>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <span>{isAr ? selectedPageItem.nameAr : selectedPageItem.nameEn}</span>
                    <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      {selectedPageItem.path}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? selectedPageItem.descriptionAr : selectedPageItem.descriptionEn}
                  </p>
                </div>
              </div>

              {/* View on Frontend Link */}
              <a
                href={selectedPageItem.path}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <span>{isAr ? 'عرض الصفحة الحية' : 'Open Live Page'}</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Editor Sub-Tabs Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveEditorTab('html')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'html'
                    ? 'bg-white text-[var(--color-saudi-green)] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Code size={14} />
                <span>{isAr ? 'أكواد HTML والمحتوى' : 'Custom HTML & Content'}</span>
              </button>

              <button
                onClick={() => setActiveEditorTab('css')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'css'
                    ? 'bg-white text-[var(--color-saudi-green)] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Palette size={14} />
                <span>{isAr ? 'تنسيقات CSS المخصصة' : 'Custom CSS (Styling)'}</span>
              </button>

              <button
                onClick={() => setActiveEditorTab('js')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'js'
                    ? 'bg-white text-[var(--color-saudi-green)] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileCode size={14} />
                <span>{isAr ? 'أكواد JavaScript وتتبع' : 'Custom JavaScript & Scripts'}</span>
              </button>

              <button
                onClick={() => setActiveEditorTab('seo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'seo'
                    ? 'bg-white text-[var(--color-saudi-green)] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Globe size={14} />
                <span>{isAr ? 'بيانات SEO وعناوين الصفحة' : 'Page SEO & Meta Tags'}</span>
              </button>

              <button
                onClick={() => setActiveEditorTab('preview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ml-auto rtl:mr-auto rtl:ml-0 ${
                  activeEditorTab === 'preview'
                    ? 'bg-[var(--color-saudi-green)] text-white shadow-sm'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Eye size={14} />
                <span>{isAr ? 'معاينة حية فورية' : 'Live Interactive Preview'}</span>
              </button>
            </div>

            {/* Editor Workspace Content */}
            <div className="p-6">
              {/* TAB 1: HTML & CUSTOM SECTIONS */}
              {activeEditorTab === 'html' && (
                <div className="space-y-6">
                  {/* Top Section HTML (English) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{isAr ? 'كود HTML للجزء العلوي (إنجليزي / افتراضي)' : 'Top Section Custom HTML (English / Default)'}</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">renders directly at top of {selectedPageItem.path}</span>
                    </div>
                    <textarea
                      rows={6}
                      value={currentConfig.topHtml || ''}
                      onChange={e => handleConfigChange('topHtml', e.target.value)}
                      placeholder="<!-- Add custom HTML, announcement banners, cards or Tailwind utility classes -->"
                      className="w-full font-mono text-xs p-4 bg-slate-950 text-emerald-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                      spellCheck={false}
                    />
                  </div>

                  {/* Top Section HTML (Arabic) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{isAr ? 'كود HTML للجزء العلوي (عربي - اختياري)' : 'Top Section Custom HTML (Arabic - Optional)'}</span>
                      </label>
                      <span className="text-[11px] text-slate-500">يظهر عند تصفح الموقع باللغة العربية</span>
                    </div>
                    <textarea
                      rows={4}
                      value={currentConfig.topHtmlAr || ''}
                      onChange={e => handleConfigChange('topHtmlAr', e.target.value)}
                      placeholder="<!-- كود HTML مخصص باللغة العربية -->"
                      className="w-full font-mono text-xs p-4 bg-slate-950 text-emerald-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                      spellCheck={false}
                    />
                  </div>

                  {/* Bottom Section HTML */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{isAr ? 'كود HTML للجزء السفلي (فوق الفوتر)' : 'Bottom Section Custom HTML (Above Footer)'}</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">renders before footer on {selectedPageItem.path}</span>
                    </div>
                    <textarea
                      rows={5}
                      value={currentConfig.bottomHtml || ''}
                      onChange={e => handleConfigChange('bottomHtml', e.target.value)}
                      placeholder="<!-- Custom reviews, extra testimonials, contact cards, or trust guarantees -->"
                      className="w-full font-mono text-xs p-4 bg-slate-950 text-blue-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM CSS */}
              {activeEditorTab === 'css' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Palette size={15} className="text-purple-600" />
                        <span>{isAr ? `تنسيقات CSS الخاصة بصفحة (${selectedPageItem.nameAr})` : `Custom CSS Styles for ${selectedPageItem.nameEn}`}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'يتم تطبيق هذه التنسيقات فوراً وحصرياً على هذه الصفحة فقط بدون التأثير على باقي الصفحات.'
                          : 'Styles defined here are scoped and injected directly when users visit this page.'}
                      </p>
                    </div>
                  </div>

                  <textarea
                    rows={14}
                    value={currentConfig.customCss || ''}
                    onChange={e => handleConfigChange('customCss', e.target.value)}
                    placeholder={`/* Add CSS rules for ${selectedPageItem.key} */
.custom-highlight {
  background: linear-gradient(135deg, #087A5A 0%, #065F46 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
}`}
                    className="w-full font-mono text-xs p-4 bg-slate-950 text-purple-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* TAB 3: CUSTOM JAVASCRIPT & SCRIPTS */}
              {activeEditorTab === 'js' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <FileCode size={15} className="text-amber-500" />
                        <span>{isAr ? `أكواد JavaScript المخصصة لصفحة (${selectedPageItem.nameAr})` : `Custom JavaScript & Scripts for ${selectedPageItem.nameEn}`}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? 'يمكنك وضع أكواد تتبع أو تفاعلات مخصصة تعمل عند تحميل هذه الصفحة.'
                          : 'Execute custom client-side scripts, event tracking, or integration hooks for this page.'}
                      </p>
                    </div>
                  </div>

                  <textarea
                    rows={14}
                    value={currentConfig.customJs || ''}
                    onChange={e => handleConfigChange('customJs', e.target.value)}
                    placeholder={`// Custom JavaScript for ${selectedPageItem.path}
console.log("Active Page:", window.location.pathname);
// You can add tracking hooks or interactive popups here`}
                    className="w-full font-mono text-xs p-4 bg-slate-950 text-amber-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* TAB 4: PAGE SEO & META TAGS */}
              {activeEditorTab === 'seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        {isAr ? 'عنوان الصفحة (SEO Title - English)' : 'Page SEO Title (English)'}
                      </label>
                      <input
                        type="text"
                        value={currentConfig.seoTitleEn || ''}
                        onChange={e => handleConfigChange('seoTitleEn', e.target.value)}
                        placeholder={`Faris VIP Umrah Transport | ${selectedPageItem.nameEn}`}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        {isAr ? 'عنوان الصفحة (SEO Title - Arabic)' : 'Page SEO Title (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={currentConfig.seoTitleAr || ''}
                        onChange={e => handleConfigChange('seoTitleAr', e.target.value)}
                        placeholder={`شركة فارس لنقل المعتمرين | ${selectedPageItem.nameAr}`}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {isAr ? 'وصف الصفحة للبحث (Meta Description - English)' : 'Meta Description (English)'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentConfig.seoDescriptionEn || ''}
                      onChange={e => handleConfigChange('seoDescriptionEn', e.target.value)}
                      placeholder="Enter meta description for search engines..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {isAr ? 'وصف الصفحة للبحث (Meta Description - Arabic)' : 'Meta Description (Arabic)'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentConfig.seoDescriptionAr || ''}
                      onChange={e => handleConfigChange('seoDescriptionAr', e.target.value)}
                      placeholder="أدخل وصف الميتا لمحركات البحث..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {isAr ? 'الكلمات المفتاحية (Target Keywords)' : 'Target Keywords'}
                    </label>
                    <input
                      type="text"
                      value={currentConfig.seoKeywords || ''}
                      onChange={e => handleConfigChange('seoKeywords', e.target.value)}
                      placeholder="Umrah transport, VIP Umrah, Jeddah to Makkah, نقل معتمرين"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE INTERACTIVE PREVIEW */}
              {activeEditorTab === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{isAr ? 'جهاز العرض:' : 'Preview Viewport:'}</span>
                      <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 gap-1">
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            previewDevice === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Monitor size={14} />
                          <span>Desktop</span>
                        </button>
                        <button
                          onClick={() => setPreviewDevice('tablet')}
                          className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            previewDevice === 'tablet' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Tablet size={14} />
                          <span>Tablet</span>
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            previewDevice === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Smartphone size={14} />
                          <span>Mobile</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewKey(k => k + 1)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw size={13} />
                      <span>{isAr ? 'إعادة تحميل المعاينة' : 'Reload Preview'}</span>
                    </button>
                  </div>

                  {/* Iframe Viewport Container */}
                  <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200 flex items-center justify-center overflow-x-auto min-h-[550px]">
                    <div
                      className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 transition-all duration-300"
                      style={{
                        width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                        height: '620px'
                      }}
                    >
                      <iframe
                        key={previewKey}
                        src={selectedPageItem.path}
                        title={`Live Preview of ${selectedPageItem.nameEn}`}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

                          {/* TAB 6: REACT SOURCE CODE */}
              {activeEditorTab === 'react_source' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs shadow-inner">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-600" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{isAr ? 'تحذير (وضع المطورين المتقدم):' : 'Warning (Advanced Developer Mode):'}</p>
                      <p>
                        {isAr 
                          ? 'أنت الآن تقوم بتعديل كود المصدر الأساسي للصفحة (React/TypeScript). أي خطأ إملائي سيؤدي إلى تعطل النظام. في بيئات الإنتاج، قد يتم فقدان هذه التعديلات عند إعادة تشغيل الخادم ما لم يتم حفظها في مستودع الكود.' 
                          : 'You are directly editing the raw React/TypeScript source files. Syntax errors will crash the application build. In a serverless production environment (like Cloud Run), these changes may be lost on container restart unless committed to the repository.'}
                      </p>
                    </div>
                  </div>
                  {loadingSource ? (
                    <div className="text-center p-10 text-slate-500 font-medium">Loading source code...</div>
                  ) : (
                    <textarea
                      rows={25}
                      value={reactSourceCode}
                      onChange={(e) => setReactSourceCode(e.target.value)}
                      className="w-full font-mono text-xs p-4 bg-[#0d1117] text-[#c9d1d9] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed shadow-inner"
                      spellCheck={false}
                    />
                  )}
                </div>
              )}
            {/* Bottom Footer Action Bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>
                  {isAr
                    ? `التعديلات يتم حفظها في قاعدة البيانات وتتزامن فورياً مع صفحة (${selectedPageItem.nameAr})`
                    : `Saved modifications sync instantly with live frontend for ${selectedPageItem.nameEn}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => activeEditorTab === 'react_source' ? saveReactSource() : handleSaveCurrentPage()}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isAr ? (saving ? 'جاري الحفظ...' : 'حفظ ومزامنة فورية') : (saving ? 'Saving...' : 'Save & Sync Live')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
