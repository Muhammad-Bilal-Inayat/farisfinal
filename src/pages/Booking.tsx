import { useState, useEffect } from 'react';
import ResponsiveImage from '../components/ResponsiveImage';
import { useSearchParams } from 'react-router-dom';
import BookingWidget, { Vehicle } from '../components/BookingWidget';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ShieldCheck, Clock, Award, CheckCircle2, Sparkles, Users, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';
import { getVehicleImageByName } from '../utils/imageUtils';

export default function Booking() {
  const { companyName } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);
        const queryVehicle = searchParams.get('vehicle') || searchParams.get('car') || searchParams.get('model');
        if (queryVehicle) {
          const matched = data.find((v: any) => 
            String(v.id) === queryVehicle || 
            v.name.toLowerCase().includes(queryVehicle.toLowerCase())
          );
          if (matched) {
            setSelectedVehicleId(String(matched.id));
          }
        }
      })
      .catch(console.error);
  }, [searchParams]);

  const handleSelectCar = (id: string) => {
    setSelectedVehicleId(id);
    const bookingForm = document.getElementById('booking-form-container');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Car image helper
  const getCarImage = (name: string) => {
    return getVehicleImageByName(name);
  };

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-32 text-left rtl:text-right">
      <PageCustomRenderer pageKey="booking" position="top" />
      <Helmet>
        <title>{isAr ? `حجز مواصلات العمرة الفاخرة | ${companyName}` : `Instant VIP Umrah Transport Booking | ${companyName}`}</title>
        <meta name="description" content="Book VIP Umrah transfers between Jeddah Airport, Makkah, and Madinah. Real-time estimate ranges, chauffeur meet & greet, and instant WhatsApp booking confirmation." />
      </Helmet>
      <Breadcrumbs items={[{ label: t('booking_title') || 'Booking' }]} />
{/* Header Banner */}
      <div className="bg-[var(--color-saudi-green)] py-8 sm:py-12 md:py-16 text-center text-white relative overflow-hidden shadow-sm px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 text-emerald-100 border border-white/20 mb-3 shadow-2xs">
            <Sparkles size={14} className="text-[var(--color-luxury-gold)]" /> {isAr ? 'حجز مباشر وسريع مع خدمة السائق الخاص VIP' : 'Instant VIP Booking & Chauffeur Dispatch'}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 text-white tracking-tight">
            {isAr ? 'احجز رحلتك الفاخرة الآن' : 'Book Your VIP Umrah Ride'}
          </h1>
          <p className="text-xs sm:text-base opacity-95 max-w-xl mx-auto text-emerald-100 leading-relaxed">
            {isAr ? 'اختر السيارة المفضلة، وحدد الوجهة والتوقيت، وسيتولى فريقنا تنسيق السائق فوراً.' : 'Real-time route pricing, 2025/26 executive fleet, flight delay tracking, and instant WhatsApp confirmation.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3.5 sm:px-6 mt-6 sm:mt-8 max-w-5xl">
        
        {/* Clickable Vehicle Fleet Strip */}
        <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-xl font-black text-[#0c2e22]">
                {isAr ? 'الخطوة الأولى: اختر سيارتك المفضلة' : 'Step 1: Choose Your Fleet Vehicle'}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {isAr ? 'اضغط على أي سيارة ليتم اختيارها تلقائياً بالنموذج أدناه' : 'Click any car below to auto-select and lock it into the booking form'}
              </p>
            </div>
            {selectedVehicleId && (
              <button 
                onClick={() => setSelectedVehicleId('')}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 cursor-pointer transition-colors"
              >
                {isAr ? 'إلغاء التحديد' : 'Clear Selection'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            {vehicles.length > 0 ? vehicles.map(vehicle => {
              const isSelected = selectedVehicleId === String(vehicle.id);
              return (
                <div 
                  key={vehicle.id} 
                  id={`vehicle-card-${vehicle.id}`}
                  onClick={() => handleSelectCar(String(vehicle.id))}
                  className={`bg-white rounded-xl border p-2.5 sm:p-3.5 cursor-pointer transition-all duration-200 flex flex-col relative group shadow-2xs active:scale-95 ${
                    isSelected 
                      ? 'border-[var(--color-saudi-green)] ring-2 ring-[var(--color-saudi-green)] shadow-md bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-emerald-400 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-[var(--color-saudi-green)] text-white p-1 rounded-full shadow-md z-10">
                      <CheckCircle2 size={16} />
                    </div>
                  )}

                  <div className="aspect-[4/3] bg-slate-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center relative">
                    <ResponsiveImage src={getVehicleImageByName(vehicle.name, vehicle.imageUrl)} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                      {isAr ? `من ${vehicle.startingPrice} ر.س` : `From ${vehicle.startingPrice} SAR`}
                    </div>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-1.5 leading-snug line-clamp-1">
                    {vehicle.name}
                  </h3>

                  <div className="flex justify-between items-center mt-auto text-[10px] sm:text-xs text-emerald-950 font-bold bg-emerald-100/80 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1"><Users size={12} className="text-emerald-700" /> {vehicle.passengerCapacity} {t('pass')}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} className="text-emerald-700" /> {vehicle.luggageCapacity}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-8 text-center text-sm text-gray-500">
                {isAr ? 'جاري تحميل الأسطول...' : 'Loading VIP Fleet...'}
              </div>
            )}
          </div>
        </div>

        {/* Main Booking Form & Side Assurance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Booking Form */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-7 md:p-8 rounded-2xl shadow-sm border border-slate-200" id="booking-form-container">
            <BookingWidget 
              preselectedVehicleId={selectedVehicleId} 
              onVehicleChange={(id) => setSelectedVehicleId(id)}
            />
          </div>

          {/* Side VIP Assurances */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs sm:text-sm text-[#0c2e22] uppercase tracking-wider border-b border-slate-100 pb-2">
                {isAr ? `لماذا تختار ${companyName}؟` : `Why Book With ${companyName}?`}
              </h3>

              <div className="flex items-start gap-3 text-xs text-gray-700">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="font-bold block text-gray-900">{isAr ? 'أسعار ثابتة ومضمونة 100%' : 'Fixed Guaranteed Rates'}</span>
                  <span className="text-gray-600">{isAr ? 'بدون أي رسوم خفية أو زيادات. تشمل الضريبة والوقود ورسوم الطرق.' : 'No surge pricing or hidden toll charges. All taxes and airport parking included.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-700">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="font-bold block text-gray-900">{isAr ? 'انتظار مجاني 60 دقيقة في المطار' : '60-Min Airport Wait Time'}</span>
                  <span className="text-gray-600">{isAr ? 'تتبع مباشر لرحلات الطيران مع خدمة الاستقبال والترحيب بالصالة.' : 'Chauffeur monitors your flight live. Free waiting time upon landing.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-700">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <Award size={18} />
                </div>
                <div>
                  <span className="font-bold block text-gray-900">{isAr ? 'أسطول حديث 2025/2026' : 'VIP Executive Amenities'}</span>
                  <span className="text-gray-600">{isAr ? 'مياه مبردة، شواحن هواتف، وسائقون محترفون ذوو خبرة عالية بالطرق.' : 'Premium comfort, reliable service, modern amenities, and warm hospitality throughout your journey.'}</span>
                </div>
              </div>
            </div>

            {/* 24/7 Helpline Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-[var(--color-luxury-gold)] tracking-wider block mb-1">
                {isAr ? 'هل تحتاج مساراً خاصاً أو باصات جماعية؟' : 'Need Custom Route Or Group Bus?'}
              </span>
              <h4 className="font-bold text-sm mb-2 text-white">
                {isAr ? 'فريق المتابعة والترحيب على مدار الساعة' : '24/7 Chauffeur Dispatch Team'}
              </h4>
              <p className="text-xs text-emerald-100/90 mb-3 leading-relaxed">
                {isAr ? 'للمسارات الخاصة والرحلات المخصصة، تحدث مباشرة مع مشرفي التنسيق عبر الواتساب.' : 'For custom itineraries, Taif day trips, or fleet reservations for 20+ pilgrims, connect directly with our dispatch supervisors.'}
              </p>
              <a 
                href="https://wa.me/966576124752?text=Assalamu%20Alaikum!%20I%20need%20assistance%20with%20custom%20VIP%20Umrah%20transportation."
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                {isAr ? 'تحدث معنا عبر واتساب الآن' : 'Chat on WhatsApp Now'}
              </a>
            </div>
          </div>

        </div>
      </div>
      <PageCustomRenderer pageKey="booking" position="bottom" />
    </div>
  );
}
