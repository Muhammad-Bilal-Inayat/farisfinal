import { VisualText, VisualSection, VisualImage, VisualDiv, VisualButton } from '../components/VisualElements';
import { useState, useEffect, useMemo } from "react";
import ResponsiveImage from '../components/ResponsiveImage';
import { Suspense, lazy } from 'react';
const BookingWidget = lazy(() => import('../components/BookingWidget'));
import { 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Car, 
  MapPin, 
  ArrowRight, 
  Wifi, 
  Compass, 
  Coffee, 
  Check, 
  PhoneCall,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QuickBookPills from '../components/QuickBookPills';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useBookingTracker } from '../context/BookingTrackerContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import PageCustomRenderer from '../components/PageCustomRenderer';
import TestimonialSlider from '../components/TestimonialSlider';
import { getVehicleImageByName } from '../utils/imageUtils';
import { useVehiclesSnapshot } from '../hooks/useVehiclesSnapshot';

const getVehicleImage = (name: string) => {
  return getVehicleImageByName(name);
};

const heroSlides = [
  {
    id: 'makkah-tower',
    name: 'Makkah Clock Tower & Holy Kaaba',
    location: 'Al-Masjid Al-Haram Grand Sanctuary',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=60&fm=webp',
  },
  {
    id: 'madinah-nabawi',
    name: 'Madinah Al-Munawwarah & Grand Umbrellas',
    location: 'Al-Masjid an-Nabawi Courtyard & Hotel Towers',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=60&fm=webp',
  },
  {
    id: 'vip-gmc-fleet',
    name: 'VIP GMC Yukon & Executive Fleet',
    location: 'Private Chauffeur & Highway VIP Transfers',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=60&fm=webp',
  },
  {
    id: 'jeddah-airport',
    name: 'Jeddah International Airport (JED)',
    location: 'Terminal 1 & Private Terminal VIP Meet & Greet',
    image: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?auto=format&fit=crop&w=1200&q=60&fm=webp',
  },
  {
    id: 'makkah-sacred-landscape',
    name: 'Makkah Holy Sanctuary & Mountains',
    location: 'Ghar Hira & Sacred Historical Routes',
    image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=60&fm=webp',
  },
];

export default function Home() {
  const { companyName, websiteDomain, homePageConfig } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openTracker, vehicleVersion } = useBookingTracker();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const localizedSlides = [
    {
      id: 'makkah-tower',
      name: isAr ? 'برج الساعة والحرم المكي الشريف' : 'Makkah Clock Tower & Holy Kaaba',
      location: isAr ? 'أبراج البيت والمسجد الحرام' : 'Al-Masjid Al-Haram Grand Sanctuary',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=60&fm=webp',
    },
    {
      id: 'madinah-nabawi',
      name: isAr ? 'المسجد النبوي الشريف والمظلات' : 'Madinah Al-Munawwarah & Grand Umbrellas',
      location: isAr ? 'ساحات الحرم النبوي وفنادق المركزية' : 'Al-Masjid an-Nabawi Courtyard & Hotel Towers',
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=60&fm=webp',
    },
    {
      id: 'vip-gmc-fleet',
      name: isAr ? 'أسطول جمس يوكون VIP الفاخر' : 'VIP GMC Yukon & Executive Fleet',
      location: isAr ? 'خدمة سائق خاص وتنقلات سريعة ومريحة' : 'Private Chauffeur & Highway VIP Transfers',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=60&fm=webp',
    },
    {
      id: 'jeddah-airport',
      name: isAr ? 'مطار الملك عبدالعزيز الدولي (JED)' : 'Jeddah International Airport (JED)',
      location: isAr ? 'صالة ١ واستقبال مباشر وسريع' : 'Terminal 1 & Private Terminal VIP Meet & Greet',
      image: 'https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?auto=format&fit=crop&w=1200&q=60&fm=webp',
    },
    {
      id: 'makkah-sacred-landscape',
      name: isAr ? 'معالم مكة المكرمة وطريق الهجرة' : 'Makkah Holy Sanctuary & Sacred Routes',
      location: isAr ? 'جولات المزارات الإسلامية والمعالم المقدسة' : 'Ghar Hira & Sacred Historical Routes',
      image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=60&fm=webp',
    },
  ];

  // Auto carousel effect changing background images every 6 seconds when visible
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        setCurrentSlide((prev) => (prev + 1) % localizedSlides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [localizedSlides.length]);

  
  const DEFAULT_LAYOUT = [
    { id: 'hero', enabled: true },
    { id: 'fleet_specs', enabled: true },
    { id: 'quick_routes', enabled: true },
    { id: 'routes', enabled: true },
    { id: 'vehicles', enabled: true },
    { id: 'ziyarat', enabled: true },
    { id: 'testimonials', enabled: true },
  ];

  const parsedConfig = useMemo(() => {
    try {
      let parsed = homePageConfig ? JSON.parse(homePageConfig) : [];
      if (parsed.length > 0) {
        DEFAULT_LAYOUT.forEach(def => {
          if (!parsed.find(p => p.id === def.id)) {
            parsed.push(def);
          }
        });
      }
      return parsed;
    } catch {
      return [];
    }
  }, [homePageConfig]);

  const getSectionStyle = (id: string, defaultOrder: number) => {
    if (!parsedConfig || parsedConfig.length === 0) return { order: defaultOrder };
    const section = parsedConfig.find((s: any) => s.id === id);
    if (!section) return { display: 'none' };
    if (!section.enabled) return { display: 'none' };
    const index = parsedConfig.findIndex((s: any) => s.id === id);
    return { order: index };
  };

  const getCustomBlocks = () => {
    if (!parsedConfig || parsedConfig.length === 0) return null;
    return parsedConfig.filter((s: any) => s.type === 'custom' && s.enabled).map((s: any, idx: number) => (
      <VisualSection id={`custom_${s.id}`} key={s.id} style={{ order: parsedConfig.findIndex((x: any) => x.id === s.id) }} className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col gap-8 ${s.image ? 'md:flex-row items-center' : ''}`}>
            {s.image && (
              <div className="w-full md:w-1/2">
                <ResponsiveImage width="800" height="600" src={s.image} alt={isAr ? s.titleAr : s.titleEn} className="w-full h-auto rounded-2xl shadow-lg" />
              </div>
            )}
            <div className={`w-full ${s.image ? 'md:w-1/2' : ''}`}>
               { (s.titleEn || s.titleAr) && <h2 className="text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-6">{isAr ? s.titleAr : s.titleEn}</h2> }
               { (s.contentEn || s.contentAr) && <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{isAr ? s.contentAr : s.contentEn}</div> }
            </div>
          </div>
        </div>
      </VisualSection>
    ));
  };

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(console.error);
  }, [vehicleVersion]);

  const snapshotVehicles = useVehiclesSnapshot();

  useEffect(() => {
    if (snapshotVehicles) {
      setVehicles(snapshotVehicles.filter((v: any) => v.status !== 'archived'));
    }
  }, [snapshotVehicles]);

  return (
    <div className="bg-white text-[var(--color-dark-charcoal)] flex flex-col">
      <PageCustomRenderer pageKey="home" position="top" />
      <Helmet>
        <title>{isAr ? `${companyName} | أفضل خدمة توصيل ونقل معتمرين VIP في السعودية` : `${companyName} | #1 VIP Umrah Transport & Private Taxi in Saudi Arabia`}</title>
        <meta name="description" content={isAr ? `خدمة نقل وتوصيل المعتمرين VIP على مدار 24 ساعة بين مطار جدة، فنادق مكة المكرمة والحرم، المدينة المنورة، ومزارات الطائف وبدر بأفضل الأسعار وأحدث السيارات.` : `Book 24/7 VIP private Umrah transportation across Saudi Arabia. Luxury transfers between Jeddah Airport (JED), Makkah Hotels & Haram, Madinah Al-Munawwarah, and historic Ziyarat sites with verified VIP chauffeurs.`} />
        <meta name="keywords" content="Umrah transport, VIP Umrah transport Saudi Arabia, Umrah taxi, Jeddah airport to Makkah taxi, Makkah to Madinah transport, Madinah to Makkah taxi fare, GMC Yukon Umrah VIP, Toyota HiAce Umrah, luxury Umrah transport, private chauffeur Makkah, Ziyarat Makkah Madinah Taif, Haramain train station transfer, 24/7 Umrah cab booking, نقل عمرة, تاكسي العمرة, مواصلات مكة والمدينة, توصيل من مطار جدة الى مكة, اسعار تاكسي مكة المدينة, سيارات VIP للعمرة, سائق خاص مكة, مزارات مكة والمدينة, افضل شركة نقل عمرة في السعودية" />
        <meta name="geo.region" content="SA-02" />
        <meta name="geo.placename" content="Makkah, Saudi Arabia" />
        <meta name="target_country" content="Saudi Arabia" />
        <link rel="canonical" href={`https://${websiteDomain}/`} />
      </Helmet>

      {/* 1. HERO SECTION WITH AUTO BACKGROUND CAROUSEL (MECCA, MADINAH & GHAR-E-SOOR) */}
      <VisualSection id="hero_section" style={getSectionStyle('hero', 1)} className="relative pt-4 pb-8 sm:pt-6 sm:pb-10 lg:pt-6 lg:pb-8 xl:pt-10 xl:pb-12 overflow-hidden flex items-center min-h-[480px] lg:min-h-[460px] xl:min-h-[520px] border-b border-gray-200/70">
        {/* Dynamic Background Image Carousel with Cross-Fade */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          {localizedSlides.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.name}
              
              loading={index === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            />
          ))}
        </div>
        
        {/* Soft luxury multi-gradient overlay so images are clearly visible while text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/90 via-[#111827]/60 to-[#111827]/80 lg:bg-gradient-to-r lg:from-[#111827]/95 lg:via-[#111827]/75 lg:to-[#111827]/20 z-1" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 xl:gap-8 items-center">
            
            {/* Left Side: Hero Copy with Mobile-Friendly Typography & Active Location Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-left rtl:text-right"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 sm:w-10 h-[1.5px] bg-[var(--color-luxury-gold)] shrink-0"></div>
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-luxury-gold)]">
                    {t('hero_excellence')}
                  </span>
                </div>

                {/* Subtle Active Carousel Tag on Mobile & Desktop */}
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-saudi-green)] animate-ping shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    📍 {localizedSlides[currentSlide].name}
                  </span>
                </div>
              </div>

              <VisualText as="h1" id="hero_title" className="text-xl sm:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black leading-tight sm:leading-[1.15] text-white mb-2 sm:mb-2.5 xl:mb-3 tracking-tight">{t('hero_title')}</VisualText>
              <p className="text-xs sm:text-sm lg:text-sm xl:text-base 2xl:text-lg text-gray-200 mb-2.5 sm:mb-4 xl:mb-5 max-w-xl xl:max-w-2xl leading-relaxed">
                {t('hero_subtitle')}
                <span className="hidden md:block mt-4 space-y-2 text-sm xl:text-base text-gray-300 font-medium leading-relaxed">
                  {i18n.language === 'ar' ? (
                    <>
                      <span className="block">سافر إلى مكة والمدينة براحة وخصوصية واطمئنان. مركبات فاخرة. سائقون محترفون. خدمة سلسة.</span>
                      <span className="block">من الوصول إلى المطار إلى تنقلات العمرة بين المدن، نحن نهتم بكل التفاصيل. استمتع برحلات خاصة مصممة لتناسب عائلتك وجدولك وراحتك.</span>
                      <span className="block">تتبع مباشر للرحلات وانتظار مجاني في المطار لضمان رحلة خالية من التوتر. استكشف كرم الضيافة السعودية مع خدمة موثوقة ودقيقة وسرية.</span>
                      <span className="block text-white font-bold mt-3 text-base xl:text-lg">اصِل براحة. سافر بثقة. أَدِّ عباداتك بطمأنينة.</span>
                    </>
                  ) : (
                    <>
                      <span className="block">Travel to Makkah & Madinah in comfort, privacy, and peace of mind. Premium vehicles. Professional chauffeurs. Seamless service.</span>
                      <span className="block">From airport arrivals to intercity Umrah transfers, we handle every detail. Enjoy private rides designed around your family, schedule, and comfort.</span>
                      <span className="block">Live flight tracking and complimentary airport waiting keep your journey stress-free. Experience Saudi hospitality with trusted, punctual, and discreet service.</span>
                      <span className="block text-white font-bold mt-3 text-base xl:text-lg">Arrive with comfort. Travel with confidence. Worship with peace of mind.</span>
                    </>
                  )}
                </span>
              </p>
              
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-3 xl:gap-5 max-w-md mb-2.5 sm:mb-4">
                <div className="bg-white/10 backdrop-blur-md p-1.5 sm:py-2 sm:px-3 rounded-xl border border-white/10 shadow-xs flex flex-col text-center">
                  <span className="text-sm sm:text-xl xl:text-2xl font-black text-white leading-none">24/7</span>
                  <span className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-300 font-bold mt-0.5">{t('support_24_7')}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-1.5 sm:py-2 sm:px-3 rounded-xl border border-white/10 shadow-xs flex flex-col text-center">
                  <span className="text-sm sm:text-xl xl:text-2xl font-black text-white leading-none">100%</span>
                  <span className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-300 font-bold mt-0.5">{t('private_rides')}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-1.5 sm:py-2 sm:px-3 rounded-xl border border-white/10 shadow-xs flex flex-col text-center">
                  <span className="text-sm sm:text-xl xl:text-2xl font-black text-white leading-none">2026</span>
                  <span className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-300 font-bold mt-0.5">{t('vip_fleet_badge')}</span>
                </div>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-300 font-semibold uppercase tracking-wider hidden sm:inline">
                  {t('featured_holy_sites')}
                </span>
                <div className="flex items-center gap-1.5">
                  {localizedSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'w-6 bg-[var(--color-saudi-green)]'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Switch to ${slide.name}`}
                      title={slide.name}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Side: Booking Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="lg:col-span-6 xl:col-span-5 flex justify-center w-full mt-3 sm:mt-4 lg:mt-0" 
              id="booking"
            >
              <div className="w-full max-w-lg lg:max-w-none xl:max-w-lg bg-white/98 backdrop-blur-md p-3.5 sm:p-5 md:p-6 border border-gray-200/90 shadow-2xl rounded-2xl sm:rounded-3xl relative">
                {/* Clean Integrated Header for Mobile and Desktop */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-saudi-green)] animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-[var(--color-dark-charcoal)] uppercase tracking-tight">
                      {t('instant_fare_booking')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                    {isAr ? 'حجز فوري ومباشر' : 'Instant Live Rates'}
                  </span>
                </div>
                <div>
                  <Suspense fallback={<div className="p-4 text-center text-xs text-gray-500 font-medium">Loading fare engine...</div>}><BookingWidget /></Suspense>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </VisualSection>

      <VisualSection id="quick_routes_section" style={getSectionStyle('quick_routes', 3)} className="booking-widget-wrapper">
        <QuickBookPills />
      </VisualSection>



      {/* 2. SPLIT SECTION 1: LEFT SIDE ISLAMIC/ROUTE PHOTO, RIGHT SIDE ROUTE DATA & TIMINGS */}
      <VisualSection id="fleet_specs_section" style={getSectionStyle('fleet_specs', 2)} className="py-6 sm:py-10 md:py-14 bg-[#F1F4F8] border-b border-slate-200/80">
        <div className="container mx-auto px-3.5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
            
            {/* Left Side: Rich Islamic & Chauffeur Transfer Imagery */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 group">
  <ResponsiveImage width="1000" height="800" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80" 
    alt="Jeddah Airport Transfers" 
    className="w-full h-56 sm:h-72 md:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-[var(--color-luxury-gold)] text-[var(--color-dark-charcoal)] w-fit mb-1.5 sm:mb-2 shadow-sm">
      <Sparkles size={11} /> {t('direct_haram_transfers')}
    </div>
    <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight">
      {isAr ? 'مطار جدة ➔ مكة المكرمة والمدينة المنورة' : 'Jeddah Airport ➔ Makkah & Madinah'}
    </h3>
    <p className="text-xs sm:text-sm text-emerald-100 opacity-90 mt-0.5 sm:mt-1">{t('door_to_door_desc')}</p>
  </div>
</div>

              {/* Floating Mini Car Badge */}
             
            </motion.div>

            {/* Right Side: Key Routes Data, Pricing & Specs */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-1">
                {t('intercity_transfers')}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-2 sm:mb-3 leading-tight">
                {t('transparent_rates_title')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-dark-charcoal)]/70 mb-3 sm:mb-4 leading-relaxed">
                {t('transparent_rates_desc')}
              </p>

              {/* Route Data Table / Cards */}
              <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5">
                <Link 
                  to="/booking?pickup=JED&destination=Makkah"
                  className="p-2.5 sm:p-3 bg-white hover:bg-emerald-50/70 transition-all rounded-xl border border-slate-200/90 hover:border-emerald-300 flex items-center justify-between group shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-saudi-green)] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] group-hover:text-[var(--color-saudi-green)] transition-colors leading-snug">
                        {isAr ? 'مطار جدة (JED) ➔ فنادق مكة المكرمة' : 'Jeddah Airport (JED) ➔ Makkah Hotel'}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        {isAr ? '٦٠-٧٥ دقيقة • استقبال من الصالة على مدار ٢٤/٧' : '~60-75 mins • 24/7 Airport Terminal Meet & Greet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pr-2">
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--color-saudi-green)] block whitespace-nowrap">200 – 300 {t('sar')}</span>
                    <span className="text-[9px] text-gray-500 font-medium">{isAr ? 'سيدان فاخر' : 'Standard Sedan'}</span>
                  </div>
                </Link>

                <Link 
                  to="/booking?pickup=Makkah&destination=Madinah"
                  className="p-2.5 sm:p-3 bg-white hover:bg-emerald-50/70 transition-all rounded-xl border border-slate-200/90 hover:border-emerald-300 flex items-center justify-between group shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-saudi-green)] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] group-hover:text-[var(--color-saudi-green)] transition-colors leading-snug">
                        {isAr ? 'مكة المكرمة ➔ المدينة المنورة' : 'Makkah Hotel ➔ Madinah Al-Munawwarah'}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        {isAr ? '٤٫٥ ساعات • استراحات وضيافة على الطريق السريع' : '~4.5 hrs • Highway Rest Stops & Refreshments'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pr-2">
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--color-saudi-green)] block whitespace-nowrap">450 – 600 {t('sar')}</span>
                    <span className="text-[9px] text-gray-500 font-medium">{isAr ? 'سيدان عائلية / SUV' : 'Family Sedan/SUV'}</span>
                  </div>
                </Link>

                <Link 
                  to="/booking?pickup=MED&destination=Madinah"
                  className="p-2.5 sm:p-3 bg-white hover:bg-emerald-50/70 transition-all rounded-xl border border-slate-200/90 hover:border-emerald-300 flex items-center justify-between group shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-saudi-green)] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] group-hover:text-[var(--color-saudi-green)] transition-colors leading-snug">
                        {isAr ? 'مطار المدينة (MED) ➔ فنادق المنطقة المركزية' : 'Madinah Airport (MED) ➔ Markazia Hotel'}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        {isAr ? '٢٥-٣٠ دقيقة • نقل مباشر للمنطقة المركزية' : '~25-30 mins • Direct Prophet\'s Mosque Area'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pr-2">
                    <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--color-saudi-green)] block whitespace-nowrap">150 – 200 {t('sar')}</span>
                    <span className="text-[9px] text-gray-500 font-medium">{isAr ? 'نقل خاص' : 'Private Transfer'}</span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link 
                  to="/booking"
                  className="bg-[var(--color-saudi-green)] hover:bg-emerald-800 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {t('book_instant_transfer')} <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
                <a 
                  href="https://wa.me/966576124752?text=Assalamu%20Alaikum!%20I%20would%20like%20to%20inquire%20about%20Umrah%20transfers."
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-[var(--color-saudi-green)] hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall size={14} /> {t('whatsapp_dispatch')}
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </VisualSection>

      {/* 3. SPLIT SECTION 2: LEFT SIDE LUXURY CAR PHOTO, RIGHT SIDE FLEET SPECS & AMENITIES */}
      <VisualSection id="routes_section" style={getSectionStyle('routes', 4)} className="py-6 sm:py-10 md:py-14 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-3.5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
            
            {/* Left Side: Luxury Vehicle Photograph & Spec Badges */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 order-2 lg:order-2 relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 bg-white p-1.5 sm:p-2">
                {(() => {
                  const cfgImg = parsedConfig && parsedConfig.find((s: any) => s.id === "fleet_specs")?.image;
                  const validGmcImg = (cfgImg && !cfgImg.includes('1618843479313') && !cfgImg.includes('photo-1533473359331')) ? cfgImg : '/images/fleet/gmc-xl.jpg';
                  return (
                    <ResponsiveImage width="1000" height="800" src={validGmcImg} 
                      alt="GMC Yukon XL 2025 VIP Luxury SUV" 
                      className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  );
                })()}
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
                {vehicles.length === 0 ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={`badge-skel-${idx}`} className="bg-[#F1F4F8] p-2 sm:p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs animate-pulse">
                      <div className="h-3 bg-slate-200 rounded w-16 mx-auto mb-1"></div>
                      <div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div>
                    </div>
                  ))
                ) : (
                  vehicles.slice(0, 3).map((veh: any, idx: number) => (
                    <div key={veh.id || idx} className="bg-[#F1F4F8] p-2 sm:p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                      <span className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase block truncate">{veh.name}</span>
                      <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--color-dark-charcoal)]">
                        {veh.passengerCapacity} {t('pass')} • {veh.luggageCapacity} {t('luggage_short')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Right Side: VIP Vehicle Features Data */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 order-1 lg:order-1 flex flex-col justify-center"
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-1">
                {t('executive_chauffeur_standards')}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-2 sm:mb-3 leading-tight">
                {t('fleet_specs_title')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-dark-charcoal)]/70 mb-3 sm:mb-4 leading-relaxed">
                {t('fleet_specs_desc')}
              </p>

              {/* Grid of Onboard Data & Amenities */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="p-2.5 sm:p-3.5 bg-[#F1F4F8] rounded-xl border border-slate-200/90 flex items-start gap-2 sm:gap-2.5 shadow-2xs hover:border-emerald-200 transition-colors">
                  <Wifi size={15} className="text-[var(--color-saudi-green)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] leading-snug">{t('high_speed_wifi')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('wifi_desc')}</p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-[#F1F4F8] rounded-xl border border-slate-200/90 flex items-start gap-2 sm:gap-2.5 shadow-2xs hover:border-emerald-200 transition-colors">
                  <Coffee size={15} className="text-[var(--color-luxury-gold)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] leading-snug">{t('zamzam_water')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('water_desc')}</p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-[#F1F4F8] rounded-xl border border-slate-200/90 flex items-start gap-2 sm:gap-2.5 shadow-2xs hover:border-emerald-200 transition-colors">
                  <ShieldCheck size={15} className="text-[var(--color-saudi-green)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] leading-snug">{t('licensed_drivers')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('licensed_drivers_desc')}</p>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 bg-[#F1F4F8] rounded-xl border border-slate-200/90 flex items-start gap-2 sm:gap-2.5 shadow-2xs hover:border-emerald-200 transition-colors">
                  <Clock size={15} className="text-[var(--color-saudi-green)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] leading-snug">{t('flight_tracking')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600">{t('flight_tracking_desc')}</p>
                  </div>
                </div>
              </div>

              <div>
                <Link 
                  to="/vehicles"
                  className="inline-flex items-center gap-1.5 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  {t('view_all_specs')} <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </VisualSection>

      {/* 4. SPLIT SECTION 3: LEFT SIDE MADINAH / ZIYARAT PHOTO, RIGHT SIDE SACRED TOURS DATA */}
      <VisualSection id="ziyarat_section" style={getSectionStyle('ziyarat', 5)} className="py-6 sm:py-10 md:py-14 bg-[#F1F4F8] border-b border-slate-200/80">
        <div className="container mx-auto px-3.5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
            
            {/* Left Side: Madinah Al-Nabawi & Holy Landmarks Imagery */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 group">
                <ResponsiveImage width="1000" height="800" src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=80" 
                  alt="Al-Masjid an-Nabawi Madinah and Ziyarat holy sites" 
                  className="w-full h-56 sm:h-72 md:h-96 object-cover group-hover:scale-102 transition-transform duration-500" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-5 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white text-[var(--color-dark-charcoal)] w-fit mb-1.5 sm:mb-2 shadow-sm">
                    <Compass size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'جولات المزارات الإسلامية' : 'Guided Sacred Tours'}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight">{t('historical_ziyarat_title')}</h3>
                  <p className="text-xs sm:text-sm text-emerald-100 opacity-90 mt-0.5 sm:mt-1">
                    {isAr ? 'زيارة المعالم الإسلامية والتاريخية في مكة والمدينة بجولات خاصة ومريحة ٣-٤ ساعات.' : 'Visit historical Islamic milestones with flexible 3–4 hour private chauffeur tours.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Ziyarat Landmarks Data & Itinerary */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
            >
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-1">
                {t('sacred_pilgrimage_milestones')}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--color-dark-charcoal)] mb-2 sm:mb-3 leading-tight">
                {t('historical_ziyarat_title')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-dark-charcoal)]/70 mb-3 sm:mb-4 leading-relaxed">
                {t('historical_ziyarat_desc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                {/* Makkah Ziyarat Card */}
                <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[var(--color-saudi-green)]" /> {t('makkah_ziyarat_title')}
                  </h4>
                  <ul className="text-[11px] sm:text-xs text-gray-700 space-y-1">
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'جبل النور (غار حراء)' : 'Jabal Al-Noor (Cave Hira)'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'جبل ثور' : 'Jabal Thawr'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'منى، عرفات، ومزدلفة' : 'Mina, Arafat & Muzdalifah'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'مقبرة المعلاة' : 'Jannat Al-Mu\'alla'}</li>
                  </ul>
                </div>

                {/* Madinah Ziyarat Card */}
                <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-dark-charcoal)] mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[var(--color-luxury-gold)]" /> {t('madinah_ziyarat_title')}
                  </h4>
                  <ul className="text-[11px] sm:text-xs text-gray-700 space-y-1">
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'مسجد قباء (أول مسجد بني في الإسلام)' : 'Masjid Quba (First Mosque)'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'جبل أحد ومقبرة الشهداء' : 'Mount Uhud & Martyrs Cemetery'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'مسجد القبلتين' : 'Masjid Al-Qiblatayn'}</li>
                    <li className="flex items-center gap-1.5"><Check size={11} className="text-[var(--color-saudi-green)]" /> {isAr ? 'المساجد السبعة (موقع غزوة الخندق)' : 'The Seven Mosques (Khandaq)'}</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link
                  to="/ziyarat"
                  className="bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  <Compass size={13} /> {t('interactive_route_map')} <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
                <a 
                  href="https://wa.me/966576124752?text=Assalamu%20Alaikum!%20I%20would%20like%20to%20book%20a%20private%20Ziyarat%20tour."
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[var(--color-saudi-green)] hover:bg-emerald-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
                >
                  {t('book_via_whatsapp')}
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </VisualSection>

      {/* 5. EXPLORE FLEET CARDS WITH PREMIUM TABLET & LAPTOP UI/UX */}
      <VisualSection id="vehicles_section" style={getSectionStyle('vehicles', 6)} className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] border-b border-slate-200/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full mb-3 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-saudi-green)] animate-pulse"></span>
              <VisualText as="span" id="fleet_tag" className="text-xs uppercase font-extrabold tracking-[0.2em] text-[var(--color-saudi-green)]">{t('premium_fleet')}</VisualText>
            </div>
            <VisualText as="h2" id="fleet_title" className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-dark-charcoal)] tracking-tight">{t('explore_fleet')}</VisualText>
            <VisualText as="p" id="fleet_subtitle" className="mt-3 text-base sm:text-lg text-[var(--color-dark-charcoal)]/70 font-medium max-w-2xl mx-auto leading-relaxed">{t('fleet_subtitle')}</VisualText>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {vehicles.length === 0 ? (
              // Skeleton Loading State
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 flex flex-col animate-pulse">
                  <div className="w-full aspect-[16/10] bg-slate-200"></div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3 mb-4 py-3.5 px-4 bg-slate-100 rounded-2xl border border-slate-100">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="h-2 bg-slate-200 rounded w-16 mb-2"></div>
                          <div className="h-6 bg-slate-200 rounded w-20"></div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="h-10 bg-slate-200 rounded-xl"></div>
                        <div className="h-10 bg-emerald-200/50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              vehicles.map((v) => (
                <VisualDiv id={`vehicle_card_${v.id}`} key={v.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 flex flex-col group transform hover:-translate-y-1.5">
                
                {/* Image Header with uniform aspect ratio & dark gradient overlay */}
                <Link to={`/routes-rates?vehicle=${v.id}`} className="block aspect-[16/10] relative overflow-hidden bg-slate-900 cursor-pointer">
                  <VisualImage width="600" height="375" id={`vehicle_img_${v.id}`} src={getVehicleImageByName(v.name, v.imageUrl)} alt={v.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  
                  {/* Model Tag */}
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-[var(--color-saudi-green)] text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
                    {v.year || '2025'} {t('model')}
                  </div>

                  {/* Vehicle Name floating badge over image bottom */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <VisualText as="h3" id={`vehicle_title_${v.id}`} className="text-lg sm:text-xl font-black tracking-wide drop-shadow-md text-white">{v.name}</VisualText>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  
                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 py-3.5 px-4 bg-slate-50/90 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2 text-[#0c2e22]"><Users size={16} className="text-[var(--color-luxury-gold)]" /> {v.passengerCapacity} {t('pass')}</span>
                    <span className="flex items-center gap-2 text-[#0c2e22]"><Briefcase size={16} className="text-[var(--color-luxury-gold)]" /> {v.luggageCapacity} {t('luggage_short')}</span>
                  </div>

                  {/* Vehicle Description / Features text from admin if present */}
                  {v.description && (
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  )}

                  {/* Price & Actions Footer */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[10px] sm:text-xs text-[var(--color-luxury-gold)] uppercase tracking-wider font-extrabold">{t('starting_from')}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-[var(--color-saudi-green)] leading-none">{v.startingPrice}</span>
                          <span className="text-xs font-bold text-slate-500">{t('sar')}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
                        ✨ VIP Chauffeur
                      </span>
                    </div>

                    {/* Button Group: View Rates & Book Now */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link 
                        to={`/routes-rates?vehicle=${v.id}`}
                        className="text-center text-xs sm:text-sm font-extrabold text-[var(--color-saudi-green)] bg-emerald-50/80 hover:bg-[var(--color-saudi-green)] hover:text-white border border-emerald-200 hover:border-transparent py-2.5 px-3 rounded-xl transition-all flex items-center justify-center whitespace-nowrap shadow-2xs"
                      >
                        {isAr ? 'عرض الأسعار' : 'View Rates'}
                      </Link>
                      <Link 
                        to={`/booking?vehicle=${v.id}`} 
                        className="text-center text-xs sm:text-sm font-extrabold text-white bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center whitespace-nowrap shadow-md hover:shadow-lg"
                      >
                        <span>{t('book_now')}</span>
                        <span className="rtl:rotate-180 inline-block ml-1">➔</span>
                      </Link>
                    </div>

                  </div>

                </div>
              </VisualDiv>
            )))}
          </div>
          
          <div className="text-center">
            <VisualButton as={Link} id="view_full_fleet_btn" to="/vehicles" className="inline-flex items-center gap-2.5 bg-[var(--color-saudi-green)] text-white px-9 py-4 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-[var(--color-saudi-emerald)] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5">
              <span>{t('view_full_fleet')}</span>
              <span className="rtl:rotate-180">➔</span>
            </VisualButton>
          </div>
        </div>
      </VisualSection>
      {/* 6. WHY CHOOSE US & GUEST REVIEWS */}
      <VisualSection id="testimonials_section" style={getSectionStyle('testimonials', 7)} className="py-8 sm:py-10 md:py-14 bg-[#F1F4F8] border-t border-slate-200/80">
        <div className="container mx-auto px-3.5 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[var(--color-saudi-green)] block mb-1">
              {t('why_choose_us')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-dark-charcoal)]">
              {t('premium_choice')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 mb-8 sm:mb-10">
            {[
              { title: t('feature1_title'), desc: t('feature1_desc') },
              { title: t('feature2_title'), desc: t('feature2_desc') },
              { title: t('feature3_title'), desc: t('feature3_desc') },
              { title: t('feature4_title'), desc: t('feature4_desc') },
              { title: t('feature5_title'), desc: t('feature5_desc') },
              { title: t('feature6_title'), desc: t('feature6_desc') },
            ].map((feature, i) => (
              <VisualDiv id={`feature_card_${i}`} key={i} className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/90 hover:shadow-md transition-shadow">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 text-[var(--color-saudi-green)]">
                  <CheckCircle2 size={16} />
                </div>
                <VisualText as="h3" id={`feature_title_${i}`} className="text-xs sm:text-sm font-bold mb-1 text-[var(--color-dark-charcoal)]">{feature.title}</VisualText>
                <VisualText as="p" id={`feature_desc_${i}`} className="text-[var(--color-dark-charcoal)]/75 leading-relaxed text-xs sm:text-sm font-normal">{feature.desc}</VisualText>
              </VisualDiv>
            ))}
          </div>

          {/* Responsive 5-Star Testimonials Slider */}
          <div className="pt-2">
            <TestimonialSlider />
          </div>
        </div>
      </VisualSection>
      {getCustomBlocks()}
      <PageCustomRenderer pageKey="home" position="bottom" />
    </div>
  );
}

