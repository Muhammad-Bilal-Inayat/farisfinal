import React from 'react';
import ResponsiveImage from '../components/ResponsiveImage';
import { Plane, Map, ShieldCheck, Clock, MapPin, Sparkles, CheckCircle2, ArrowRight, MessageSquare, Car, PhoneCall, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useWhatsApp } from '../hooks/useWhatsApp';
import AdBanner from '../components/AdBanner';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Services() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { openWhatsApp } = useWhatsApp();

  const destinationHubs = [
    {
      id: 'makkah',
      nameEn: 'Makkah Al-Mukarramah',
      nameAr: 'مكة المكرمة',
      taglineEn: 'Holy Haram & Hotel Transfers',
      taglineAr: 'خدمات الحرم المكي وفنادق العاصمة المقدسة',
      descEn: 'Seamless 24/7 private transfers directly to your hotel doorstep around the Grand Mosque (Masjid Al-Haram), Abraj Al-Bait, Jabal Omar, and Aziziyah.',
      descAr: 'خدمة نقل خاصة ومباشرة على مدار الساعة إلى أبواب فنادق الحرم المكي الشريف، أبراج البيت، جبل عمر، والعزيزية بأحدث أسطول فاخر.',
      image: 'https://images.unsplash.com/photo-1627728734379-a5f8c099763e?auto=format&fit=crop&w=1200&q=80',
      routes: isAr ? ['مطار جدة ⇄ فنادق مكة', 'مكة المكرمة ⇄ المدينة المنورة', 'مزارات مكة المكرمة'] : ['Jeddah Airport ⇄ Makkah Hotel', 'Makkah ⇄ Madinah', 'Makkah Ziyarat Tour'],
      link: '/booking?destination=Makkah Hotel / Haram'
    },
    {
      id: 'madinah',
      nameEn: 'Al-Madinah Al-Munawwarah',
      nameAr: 'المدينة المنورة',
      taglineEn: "Prophet's Mosque & Markazia",
      taglineAr: 'المسجد النبوي الشريف والمنطقة المركزية',
      descEn: 'Relaxing highway transfers and local transport to the Prophet’s Mosque (Al-Masjid An-Nabawi), Markazia hotels, Quba Mosque, and Mount Uhud.',
      descAr: 'رحلات مريحة وآمنة عبر طريق الهجرة السريع إلى فنادق المنطقة المركزية حول المسجد النبوي الشريف، مسجد قباء، وجبل أحد.',
      image: 'https://images.unsplash.com/photo-1713239060784-e6ed820a0715?auto=format&fit=crop&w=1200&q=80',
      routes: isAr ? ['مطار المدينة ⇄ فنادق المركزية', 'المدينة المنورة ⇄ مكة المكرمة', 'مزارات المدينة المنورة'] : ['Madinah Airport ⇄ Hotel', 'Madinah ⇄ Makkah', 'Madinah Ziyarat Tour'],
      link: '/booking?destination=Madinah Hotel / Markazia'
    },
    {
      id: 'jeddah-airport',
      nameEn: 'Jeddah International Airport (JED)',
      nameAr: 'مطار جدة الدولي (الملك عبدالعزيز)',
      taglineEn: 'Terminal 1 & VIP Airport Pickups',
      taglineAr: 'استقبال صالة ١ والصالة الشمالية VIP',
      descEn: 'Personalized meet & greet at King Abdulaziz Airport (JED) Terminal 1 and North Terminal with flight tracking, luggage assistance, and zero waiting time.',
      descAr: 'استقبال خاص في صالات مطار الملك عبدالعزيز بجدة (صالة ١ والصالة الشمالية) مع تتبع مواعيد الرحلات والمساعدة الكاملة في الحقائب.',
      image: 'https://images.unsplash.com/photo-1720549973451-018d3623b55a?auto=format&fit=crop&w=1200&q=80',
      routes: isAr ? ['مطار جدة ⇄ فنادق مكة', 'مطار جدة ⇄ فنادق المدينة', 'مطار جدة ⇄ فنادق كورنيش جدة'] : ['Jeddah Airport ⇄ Makkah Hotel', 'Jeddah Airport ⇄ Madinah', 'Jeddah Airport ⇄ Jeddah City'],
      link: '/booking?pickup=Jeddah Airport (JED)'
    }
  ];

  const services = [
    { 
      id: 'airport',
      icon: Plane, 
      title: isAr ? 'استقبال وتوصيل المطارات' : 'Airport Meet & Greet Transfers',
      subtitle: isAr ? 'مطار جدة ومطار المدينة المنورة' : 'Jeddah (JED) & Madinah (MED) Airports',
      desc: isAr 
        ? 'خدمة استقبال حصرية في صالات الوصول بمطار الملك عبدالعزيز بجدة ومطار الأمير محمد بن عبدالعزيز بالمدينة، مع متابعة حية لموعد هبوط طائرتك ومساعدة كاملة في الأمتعة.'
        : 'VIP personalized reception at Jeddah (JED) and Madinah (MED) airport arrival terminals with live flight tracking, baggage handling, and direct chauffeur pickup.',
      image: 'https://images.unsplash.com/photo-1720549973451-018d3623b55a?auto=format&fit=crop&w=800&q=80',
      tag: isAr ? 'مطار جدة ومطار المدينة' : 'JED & MED Airport VIP',
      link: '/booking?service=airport'
    },
    { 
      id: 'intercity',
      icon: Map, 
      title: isAr ? 'التنقل بين المدن المقدسة' : 'Intercity Umrah Transfers',
      subtitle: isAr ? 'مكة المكرمة ⇄ المدينة المنورة ⇄ جدة' : 'Mecca ⇄ Madinah ⇄ Jeddah Highway',
      desc: isAr 
        ? 'رحلات مباشرة وفاخرة بين مكة المكرمة والمدينة المنورة وجدة عبر أحدث الطرق السريعة مع وقفات مريحة عند الميقات ومحطات الاستراحة المجهزة.'
        : 'Direct, comfortable long-distance journeys between Makkah, Madinah, and Jeddah with certified highway chauffeurs, AC climate control, and Miqat stops.',
      image: 'https://images.unsplash.com/photo-1627728734379-a5f8c099763e?auto=format&fit=crop&w=800&q=80',
      tag: isAr ? 'طريق الهجرة والحرمين' : 'Makkah - Madinah Route',
      link: '/booking?service=intercity'
    },
    { 
      id: 'ziyarat',
      icon: Compass, 
      title: isAr ? 'جولات المزارات الإسلامية والتاريخية' : 'Sacred Ziyarat Sightseeing Tours',
      subtitle: isAr ? 'معالم مكة والمدينة التاريخية' : 'Makkah & Madinah Holy Landmarks',
      desc: isAr 
        ? 'استكشف المعالم النبوية والتاريخية العظيمة (غار حراء، غار ثور، عرفات، منى، مسجد قباء، جبل أحد، ومسجد القبلتين) مع سائقين ذوي خبرة ومعرفة بالمعالم.'
        : 'Visit historic holy sites including Cave of Hira, Thawr, Mount Arafat, Mina in Mecca, plus Masjid Quba, Mount Uhud, and Qiblatayn in Madinah.',
      image: 'https://images.unsplash.com/photo-1713239060784-e6ed820a0715?auto=format&fit=crop&w=800&q=80',
      tag: isAr ? 'مزارات مكة والمدينة' : 'Mecca & Madinah Ziyarat',
      link: '/ziyarat'
    },
    { 
      id: 'chauffeur',
      icon: Clock, 
      title: isAr ? 'خدمة السائق الخاص وتأجير اليوم الكامل' : 'Private Chauffeur & Daily Charter',
      subtitle: isAr ? 'تحت تصرفك بالساعة أو اليوم الكامل' : 'Full Day (8 Hours) Dedicated Driver',
      desc: isAr 
        ? 'سائق خاص محترف مع أحدث سيارات الأسطول (جمس يوكون، كامري، تورس، باص) تحت تصرفك وعائلتك للتنقل الحر بين الفنادق والأسواق والمزارات.'
        : 'Dedicated executive chauffeur with your vehicle of choice (GMC Yukon XL, Camry, Taurus, Hiace, Staria) on standby for 8 hours or multi-day itinerary.',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      tag: isAr ? 'سائق خاص 8 ساعات' : '8-Hour VIP Chauffeur',
      link: '/booking?service=chauffeur'
    }
  ];

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-24 text-[var(--color-dark-charcoal)]">
      <PageCustomRenderer pageKey="services" position="top" />
      <Helmet>
        <title>{isAr ? 'خدمات النقل للعمرة | مكة، المدينة، ومطار جدة' : 'Umrah Transport Services | Mecca, Madinah & Jeddah Airport'}</title>
        <meta 
          name="description" 
          content={isAr 
            ? 'خدمات النقل الفاخر للعمرة بين مكة المكرمة، المدينة المنورة، ومطار جدة الدولي مع أحدث سيارات 2025/2026 وسائقين محترفين.' 
            : 'Premium Umrah transportation services between Mecca, Madinah, and Jeddah International Airport (JED) with modern 2025/2026 fleet.'} 
        />
        <meta name="keywords" content="Makkah airport transfer, Madinah airport transfer, Jeddah airport taxi, Makkah Madinah transport, Mecca Ziyarat, Madinah Ziyarat, GMC Umrah transfer, مواصلات مكة, مطار جدة" />
      </Helmet>
      <Breadcrumbs items={[{ label: t('services') || 'Services' }]} />
{/* TOP HEADER */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center shadow-2xs">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200/70 mb-4">
            <Sparkles size={14} className="text-[var(--color-luxury-gold)]" />
            <span>{isAr ? 'خدمات VIP متكاملة لضيوف الرحمن' : 'VIP Transport Solutions For Pilgrims'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0c2e22] tracking-tight mb-3">
            {isAr ? 'خدمات النقل بين مكة والمدينة ومطار جدة' : 'Mecca, Madinah & Jeddah Airport Services'}
          </h1>
          
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'نقدم أرقى خدمات النقل والتوصيل لضيوف بيت الله الحرام وزوار المسجد النبوي الشريف بأحدث أسطول لعام 2025/2026 مع ضمان الدقة والراحة والأسعار الثابتة.'
              : 'Providing world-class private transfers and guided Ziyarat tours across Makkah Al-Mukarramah, Al-Madinah Al-Munawwarah, and Jeddah International Airport with certified executive drivers.'}
          </p>
        </div>
      </section>

      {/* SECTION 1: 3 MAIN DESTINATION HUBS WITH HIGH-RES PHOTOS (Makkah, Madinah, Jeddah Airport) */}
      <section className="py-12 bg-[#F1F4F8] border-b border-slate-200/80">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-saudi-green)] block mb-1">
              {isAr ? 'وجهاتنا ومحطات النقل الرئيسية' : 'Key Destinations & Transfer Hubs'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isAr ? 'تغطية شاملة لأهم المدن والمطارات المقدسة' : 'Comprehensive Coverage of Sacred Cities & Airports'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {destinationHubs.map((dest) => (
              <div 
                key={dest.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* PHOTO CONTAINER */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <ResponsiveImage src={dest.image} alt={isAr ? dest.nameAr : dest.nameEn} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs font-bold text-[var(--color-luxury-gold)] uppercase tracking-wider block mb-0.5">
                      {isAr ? dest.taglineAr : dest.taglineEn}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {isAr ? dest.nameAr : dest.nameEn}
                    </h3>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                      {isAr ? dest.descAr : dest.descEn}
                    </p>

                    {/* Quick popular routes */}
                    <div className="space-y-1.5 mb-6">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                        {isAr ? 'أبرز المسارات المتاحة:' : 'Popular Routes:'}
                      </span>
                      {dest.routes.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          <CheckCircle2 size={13} className="text-[var(--color-saudi-green)] shrink-0" />
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={dest.link}
                      className="flex-1 bg-[var(--color-saudi-green)] hover:bg-[#005237] text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{isAr ? 'حجز مسار الوجهة' : 'Book Destination'}</span>
                      <ArrowRight size={13} className="rtl:rotate-180 text-[var(--color-luxury-gold)]" />
                    </Link>

                    <button
                      onClick={() => openWhatsApp('general', `Assalamu Alaikum, I would like to book a transfer in ${dest.nameEn}.`)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-[var(--color-saudi-green)] border border-emerald-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title={isAr ? 'استفسار عبر واتساب' : 'WhatsApp Inquiry'}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 DETAILED SERVICES CARDS WITH DEDICATED VISUALS */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-saudi-green)] block mb-1">
              {isAr ? 'باقات وخدمات النقل الفاخر' : 'Executive Service Packages'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isAr ? 'خدمات مخصصة لراحة وأمان المعتمرين والزوار' : 'Tailored Transportation For Umrah Pilgrims & Families'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div 
                  key={service.id} 
                  className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* CARD IMAGE BANNER */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                      <ResponsiveImage src={service.image} alt={service.title} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/20">
                        <Icon size={13} className="text-[var(--color-luxury-gold)]" />
                        <span>{service.tag}</span>
                      </div>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white text-[var(--color-saudi-green)] flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs">
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                            {service.title}
                          </h3>
                          <span className="text-xs font-semibold text-[var(--color-saudi-green)] block mt-0.5">
                            {service.subtitle}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-slate-200/80 mt-2">
                    <Link
                      to={service.link}
                      className="flex-1 bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{isAr ? 'احجز الخدمة الآن' : 'Book Service Now'}</span>
                      <ArrowRight size={14} className="rtl:rotate-180" />
                    </Link>

                    <Link
                      to="/routes-rates"
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200/90 text-gray-800 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      {isAr ? 'جدول الأسعار' : 'View Rates'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ad Banner */}
          <div className="mt-12">
            <AdBanner dataAdSlot="services-page-bottom" />
          </div>

          {/* FAST DISPATCH BANNER */}
          <div className="mt-12 bg-gradient-to-r from-[#0c2e22] via-[#006644] to-[#0c2e22] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left rtl:md:text-right">
              <span className="text-xs font-bold text-[var(--color-luxury-gold)] uppercase tracking-wider block mb-1">
                {isAr ? 'جاهزون لخدمتك على مدار الساعة' : '24/7 Guaranteed Availability'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">
                {isAr ? 'هل تحتاج إلى سيارة خاصة فوراً؟' : 'Need Immediate Private Transportation?'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {isAr 
                  ? 'فريقنا متواجد في صالات مطار جدة والمدينة المنورة وأمام فنادق الحرم لتلبية طلبك في أسرع وقت وبأفضل سعر ثابت.'
                  : 'Our fleet is stationed at Jeddah & Madinah airport terminals and Makkah Haram hotels for immediate VIP dispatch.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                to="/booking"
                className="w-full sm:w-auto bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-gray-900 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm text-center shadow-lg transition-all"
              >
                {isAr ? 'احجز رحلتك أونلاين' : 'Book Online Now'}
              </Link>
              <button
                onClick={() => openWhatsApp('general', isAr ? 'السلام عليكم، أرغب في حجز سيارة الآن.' : 'Assalamu Alaikum, I need to book a transfer now.')}
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare size={15} />
                <span>{isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US ROW */}
      <section className="py-10 bg-[#E9EEF4] border-t border-slate-200/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] mx-auto flex items-center justify-center font-bold mb-2">
                <Plane size={20} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{isAr ? 'استقبال بالمطار' : 'Airport Meet & Greet'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">{isAr ? 'انتظار بصالة الوصول' : 'Inside terminal pickup'}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] mx-auto flex items-center justify-center font-bold mb-2">
                <Clock size={20} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{isAr ? 'دقة بالمواعيد' : 'Punctual Timing'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">{isAr ? 'تتبع الرحلات الجوية' : 'Live flight tracking'}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] mx-auto flex items-center justify-center font-bold mb-2">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{isAr ? 'أسعار رسمية ثابتة' : 'Fixed Transparent Fares'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">{isAr ? 'شاملة الوقود والرسوم' : 'All tolls & taxes included'}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] mx-auto flex items-center justify-center font-bold mb-2">
                <Car size={20} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">{isAr ? 'أسطول 2025/2026' : 'Modern Fleet'}</h4>
              <p className="text-[11px] text-gray-500 mt-1">{isAr ? 'سيارات حديثة ونظيفة' : 'Sanitized luxury vehicles'}</p>
            </div>
          </div>
        </div>
      </section>
      <PageCustomRenderer pageKey="services" position="bottom" />
    </div>
  );
}
