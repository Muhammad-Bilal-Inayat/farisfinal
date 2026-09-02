import { useState, useEffect, useMemo } from 'react';
import ResponsiveImage from '../components/ResponsiveImage';
import { 
  Users, 
  Briefcase, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Star,
  RotateCcw,
  MessageSquare,
  Car,
  Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import AdBanner from '../components/AdBanner';
import { getVehicleImageByName } from '../utils/imageUtils';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export interface Vehicle {
  id: number;
  name: string;
  nameAr?: string;
  year: number;
  passengerCapacity: number;
  luggageCapacity: number;
  features?: string;
  imageUrl?: string;
  startingPrice: number;
  category?: string;
  description?: string;
}

export const getVehicleImage = (name: string) => {
  return getVehicleImageByName(name);
};

export const getDetailedSpecs = (vehicle: Vehicle, isAr: boolean = false) => {
  const name = vehicle.name.toLowerCase();
  
  if (name.includes('mercedes')) {
    return [
      { label: isAr ? 'نظام الصوت' : 'Audio', value: isAr ? 'برومستر بريميوم' : 'Burmester Premium' },
      { label: isAr ? 'المقاعد' : 'Seating', value: isAr ? 'جلد فاخر، تبريد/تدفئة' : 'Executive Nappa Leather' },
      { label: isAr ? 'الشاشات' : 'Screens', value: isAr ? 'شاشات ترفيه خلفية' : 'Rear Entertainment' },
      { label: isAr ? 'الإضاءة' : 'Lighting', value: isAr ? 'إضاءة محيطية (٦٤ لون)' : 'Ambient (64 Colors)' }
    ];
  } else if (name.includes('gmc') || name.includes('escalade')) {
    return [
      { label: isAr ? 'نظام الصوت' : 'Audio', value: 'Bose Premium' },
      { label: isAr ? 'المقاعد' : 'Seating', value: isAr ? 'صف ثاني منفصل (كابتن)' : 'Captain Chairs (2nd Row)' },
      { label: isAr ? 'الشاشات' : 'Screens', value: isAr ? 'شاشات خلفية مزدوجة' : 'Dual Rear Screens' },
      { label: isAr ? 'مساحة الأرجل' : 'Legroom', value: isAr ? 'ممتازة - فئة XL' : 'Extended XL Wheelbase' }
    ];
  } else if (name.includes('staria') || name.includes('vito')) {
    return [
      { label: isAr ? 'الدخول' : 'Access', value: isAr ? 'أبواب كهربائية منزلقة' : 'Power Sliding Doors' },
      { label: isAr ? 'التكييف' : 'Climate', value: isAr ? 'مكيف خلفي منفصل' : 'Rear Multi-Zone AC' },
      { label: isAr ? 'المساحة' : 'Space', value: isAr ? 'مساحة واسعة للأمتعة' : 'Extra Luggage Bay' },
      { label: isAr ? 'المقاعد' : 'Seating', value: isAr ? 'قابلة للطي والتعديل' : 'Flexible Foldable' }
    ];
  } else {
    return [
      { label: isAr ? 'التكييف' : 'Climate', value: isAr ? 'تكييف عالي الكفاءة' : 'High-Efficiency AC' },
      { label: isAr ? 'المقاعد' : 'Seating', value: isAr ? 'مريحة ومناسبة للسفر' : 'Comfortable Touring' },
      { label: isAr ? 'الاتصال' : 'Connectivity', value: 'Bluetooth & USB' }
    ];
  }
};

export default function Vehicles() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { companyName } = useSiteSettings();
  const { openWhatsApp } = useWhatsApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const carParam = searchParams.get('car');

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load vehicles', error);
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', label: isAr ? 'عرض الكل' : 'All Fleet' },
    { id: 'luxury', label: isAr ? 'فئة النخبة (VIP)' : 'VIP Luxury' },
    { id: 'suv', label: isAr ? 'سيارات عائلية (SUV)' : 'Family SUVs' },
    { id: 'sedan', label: isAr ? 'سيدان فاخر' : 'Premium Sedan' },
    { id: 'van', label: isAr ? 'فانات واسعة' : 'Spacious Vans' },
    { id: 'bus', label: isAr ? 'حافلات المجموعات' : 'Group Buses' }
  ];

  const getExactCarName = (carParam: string) => {
    if (carParam.toLowerCase() === 'staria') return 'Hyundai Staria';
    if (carParam.toLowerCase() === 'gmc') return 'GMC Yukon';
    if (carParam.toLowerCase() === 'taurus') return 'Ford Taurus';
    if (carParam.toLowerCase() === 'camry') return 'Toyota Camry';
    return null;
  };

  const filteredVehicles = useMemo(() => {
    let list = vehicles;

    if (selectedCategory !== 'all') {
      list = list.filter(v => v.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.name.toLowerCase().includes(q) || 
        (v.features && v.features.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [vehicles, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#F1F4F8] min-h-screen text-[var(--color-dark-charcoal)]">
      <PageCustomRenderer pageKey="vehicles" position="top" />
      <Helmet>
        <title>{isAr ? 'أسطول السيارات الفاخرة | ' : 'Our VIP Fleet | '}{companyName}</title>
        <meta name="description" content={isAr ? 'تصفح أسطول سياراتنا الفاخرة للعمرة، شاملة جمس يوكون، مرسيدس، وهيونداي ستاريا مع توضيح المواصفات التفصيلية وسعة الركاب.' : 'Browse our premium Umrah fleet including GMC Yukon, Mercedes S-Class, and Hyundai Staria with detailed specs and pax capacity.'} />
      </Helmet>
      <Breadcrumbs items={[{ label: t('vehicles') || 'Our Fleet' }]} />
{/* Hero Header */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-10 sm:pt-12 sm:pb-14 shadow-2xs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-dark-charcoal)] mb-3">
            {isAr ? 'أسطول سيارات النخبة' : 'Our Elite Fleet'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6">
            {isAr 
              ? 'تشكيلة واسعة من أحدث طرازات السيارات الفاخرة (2025/2026)، مجهزة بأعلى معايير الراحة والأمان لضمان رحلة روحانية استثنائية.' 
              : 'A comprehensive selection of the latest 2025/2026 model luxury vehicles, maintained to the highest standards for an exceptional spiritual journey.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/routes-rates"
              className="inline-flex items-center gap-2 bg-[#006644] hover:bg-[#005237] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <span>{isAr ? 'احجز أسطولك - جدول كافة المسارات والأسعار' : 'Book Your Fleet - All 17 Routes & Rates'}</span>
              <span className="text-[var(--color-luxury-gold)]">➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col">
              
              {/* Category Filter & Search Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                
                {/* Scrollable Categories */}
                <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-1 xl:pb-0">
                  <div className="flex items-center gap-2 min-w-max">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? 'bg-[var(--color-saudi-green)] text-white shadow-md'
                            : 'bg-slate-50 text-[var(--color-dark-charcoal)] hover:bg-slate-100 border border-slate-200/90'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
                  <div className="relative w-full xl:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isAr ? "ابحث عن سيارة (مثلاً جمس، مرسيدس)..." : "Search model (e.g. GMC, Mercedes)..."}
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-[var(--color-saudi-green)] focus:ring-1 focus:ring-[var(--color-saudi-green)] transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* View: Fleet Grid */}
              <div>
                {/* Active Car Filter Notification Banner */}
                {carParam && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 sm:p-4 flex items-center justify-between mb-6 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-saudi-green)] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Star size={14} />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                          {isAr ? `عرض النتائج المطابقة لـ "${carParam}"` : `Showing matches for "${carParam}"`}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-600 mt-0.5 block">
                          {isAr ? 'تم تطبيق الفلتر بناءً على طلبك من الصفحة السابقة.' : 'Filter applied from your homepage selection.'}
                        </span>
                      </div>
                    </div>
                    <Link 
                      to="/vehicles" 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-[var(--color-dark-charcoal)] border border-slate-200/90 hover:bg-slate-50 text-[10px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
                    >
                      {isAr ? 'عرض كل السيارات' : 'View All Cars'}
                    </Link>
                  </div>
                )}

                {/* Grid Layout for Individual Cars */}
                {filteredVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredVehicles.map(v => {
                      const displayTitle = isAr ? v.nameAr || v.name : v.name;
                      const featuresList = v.features ? v.features.split(',').map(f => f.trim()) : [];
                      
                      return (
                        <div 
                          key={v.id} 
                          className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col"
                        >
                          {/* Image Section */}
                          <div className="aspect-[16/10] relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                            <ResponsiveImage src={getVehicleImageByName(v.name, v.imageUrl)} alt={displayTitle} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                            
                            {/* Year Badge */}
                            <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto bg-[var(--color-saudi-green)] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-md">
                              {isAr ? `موديل ${v.year || '2025/2026'}` : `${v.year || '2025/2026'} Model`}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-5 flex-grow flex flex-col">
                            {/* Category & Name */}
                            <div className="mb-4">
                              {v.category && (
                                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-saudi-green)] block mb-1">
                                  {isAr 
                                    ? v.category === 'suv' ? 'دفع رباعي (عائلي)' : v.category === 'sedan' ? 'سيدان' : v.category === 'van' ? 'فان' : v.category === 'luxury' ? 'نخبة / VIP' : 'باصات' 
                                    : v.category}
                                </span>
                              )}
                              <h2 className="text-xl font-extrabold text-[var(--color-dark-charcoal)] leading-tight">
                                {displayTitle}
                              </h2>
                            </div>

                            {/* Core Specs / Capacities */}
                            <div className="grid grid-cols-2 gap-3 mb-5 border-y border-slate-100 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                  <Users size={14} className="text-[var(--color-saudi-green)]" />
                                </div>
                                <div>
                                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('pass')}</span>
                                  <span className="block text-sm font-extrabold text-[var(--color-dark-charcoal)]">{v.passengerCapacity} Max</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                  <Briefcase size={14} className="text-[var(--color-luxury-gold)]" />
                                </div>
                                <div>
                                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('luggage_short')}</span>
                                  <span className="block text-sm font-extrabold text-[var(--color-dark-charcoal)]">{v.luggageCapacity} Bags</span>
                                </div>
                              </div>
                            </div>

                            {/* Key Highlights / Features */}
                            {(featuresList.length > 0 || getDetailedSpecs(v, isAr).length > 0) && (
                              <div className="mb-6 flex-grow">
                                <ul className="space-y-2">
                                  {featuresList.slice(0, 2).map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                                      <Check size={14} className="text-[var(--color-saudi-green)] shrink-0 mt-0.5" />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                  {featuresList.length === 0 && getDetailedSpecs(v, isAr).slice(0, 3).map((spec, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                                      <Check size={14} className="text-[var(--color-saudi-green)] shrink-0 mt-0.5" />
                                      <span><strong className="font-bold text-gray-900">{spec.label}:</strong> {spec.value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Actions / Book Now */}
                            <div className="mt-auto flex gap-3 pt-4 border-t border-gray-100">
                              <Link 
                                to={`/booking?vehicle=${v.id}`}
                                className="flex-1 bg-[var(--color-dark-charcoal)] hover:bg-black text-white text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                              >
                                {t('book_ride')}
                              </Link>
                              
                              <button 
                                onClick={() => openWhatsApp('booking', `Hello! I would like to inquire about the ${v.name} for my Umrah transport.`)}
                                className="flex-1 bg-white hover:bg-gray-50 text-[#25D366] border border-gray-200 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                              >
                                <MessageSquare size={14} /> WhatsApp
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Car size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-[var(--color-dark-charcoal)] mb-2">
                      {isAr ? 'لم يتم العثور على سيارات' : 'No Vehicles Found'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                      {isAr ? 'لا توجد سيارات تطابق معايير البحث الحالية.' : 'We couldn\'t find any vehicles matching your current search criteria.'}
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[var(--color-dark-charcoal)] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                    >
                      <RotateCcw size={14} /> {isAr ? 'إعادة ضبط الفلتر' : 'Reset Filters'}
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          )}

        </div>
      </section>

      <AdBanner dataAdSlot="vehicles-bottom" />
      <PageCustomRenderer pageKey="vehicles" position="bottom" />
    </div>
  );
}
