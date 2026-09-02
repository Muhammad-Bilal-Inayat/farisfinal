import { useState, useMemo, useEffect } from 'react';
import ResponsiveImage from '../components/ResponsiveImage';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/Breadcrumbs';
import { Users, Briefcase, Sparkles, Check, ArrowRight, MessageSquare, Search, Filter, Phone } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { Helmet } from 'react-helmet-async';
import AdBanner from '../components/AdBanner';
import PageCustomRenderer from '../components/PageCustomRenderer';
import { 
  FLEET_VEHICLES_DATA, 
  QUICK_ROUTE_PILLS, 
  VehicleFleet, 
  QuickRoutePill 
} from '../data/fleetRoutesData';

export default function RoutesRates() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openWhatsApp } = useWhatsApp();
  const [selectedPillId, setSelectedPillId] = useState<string | null>(() => {
    return searchParams.get('pill') || searchParams.get('route') || null;
  });

  useEffect(() => {
    const pillFromUrl = searchParams.get('pill') || searchParams.get('route');
    const vehicleFromUrl = searchParams.get('vehicle');
    if (pillFromUrl) {
      setSelectedPillId(pillFromUrl);
    }
    // Scroll removed because selected vehicle is shown at top
  }, [searchParams]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [dynamicVehicles, setDynamicVehicles] = useState<VehicleFleet[]>(FLEET_VEHICLES_DATA);

  useEffect(() => {
    Promise.all([
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/routes').then(r => r.json())
    ]).then(([vehicles, routes]) => {
      if (Array.isArray(vehicles) && Array.isArray(routes)) {
        const enriched = vehicles.map((v: any) => {
          const vRoutes = [];
          routes.forEach((route: any) => {
            const rate = route.rates?.find((r: any) => r.vehicleId === v.id);
            if (rate) {
              const priceText = rate.priceMax && rate.priceMax > rate.price 
                ? `${rate.price} - ${rate.priceMax}` 
                : `${rate.price}`;
              vRoutes.push({
                routeId: route.id.toString(),
                routeNameEn: route.nameEn,
                routeNameAr: route.nameAr,
                price: priceText,
                pickup: route.pickup,
                destination: route.destination
              });
            }
          });
          return {
            id: v.id.toString(),
            name: v.name,
            nameAr: v.name,
            category: (v.category || 'Sedan') as any,
            passengers: v.passengerCapacity?.toString() || '4',
            passengersAr: v.passengerCapacity?.toString() || '4',
            luggage: v.luggageCapacity?.toString() || '3',
            luggageAr: v.luggageCapacity?.toString() || '3',
            image: v.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
            routes: vRoutes
          };
        });
        if (enriched.length > 0) {
          setDynamicVehicles(enriched);
        }
      }
    }).catch(console.error);
  }, []);


  const handlePillClick = (pill: QuickRoutePill) => {
    if (selectedPillId === pill.id) {
      setSelectedPillId(null);
    } else {
      setSelectedPillId(pill.id);
    }
  };

  // Filter vehicles based on category or search
  const filteredVehicles = useMemo(() => {
    let list = dynamicVehicles;

    if (selectedCategory !== 'all') {
      list = list.filter(v => v.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.nameAr.includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.routes.some(r => r.routeNameEn.toLowerCase().includes(q) || r.routeNameAr.includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const handleBookVehicle = (vehicle: VehicleFleet, routeItem?: any) => {
    const pickup = routeItem?.pickup || 'Jeddah Airport (JED)';
    const destination = routeItem?.destination || 'Makkah Hotel / Haram';
    const params = new URLSearchParams({
      vehicle: vehicle.name,
      pickup: pickup,
      destination: destination,
    });
    if (routeItem?.price) {
      params.append('price', String(routeItem.price));
    }
    navigate(`/booking?${params.toString()}`);
  };

  const handleWhatsAppBooking = (vehicle: VehicleFleet, routeItem?: any) => {
    const rName = routeItem ? (isAr ? routeItem.routeNameAr : routeItem.routeNameEn) : (isAr ? 'رحلة عمرة عامة' : 'General Umrah Transfer');
    const priceText = routeItem ? `${routeItem.price} SAR` : '';
    const msg = isAr 
      ? `السلام عليكم، أرغب في حجز سيارة ${vehicle.nameAr} (${vehicle.name}) لرحلة: ${rName}${priceText ? ` بسعر ${priceText}` : ''}. يرجى تأكيد التوفر.`
      : `Assalamu Alaikum, I would like to book ${vehicle.name} for route: ${rName}${priceText ? ` at ${priceText}` : ''}. Please confirm availability.`;
    
    openWhatsApp('general', msg);
  };

  // Helper to map selected pill to routeId
  const getPillMatchingRouteId = (pillId: string | null): string | null => {
    if (!pillId) return null;
    switch (pillId) {
      case 'makkah-madinah': return 'mak_med';
      case 'madinah-makkah': return 'med_mak';
      case 'jeddah-makkah': return 'jed_mak';
      case 'makkah-jeddah': return 'mak_jed';
      case 'madinah-air-hotel': return 'med_air_med';
      case 'madinah-hotel-air': return 'med_med_air';
      case 'hotel-train': return 'hotel_train';
      case 'train-hotel': return 'train_hotel';
      case 'mecca-ziyarat': return 'mak_ziyarat';
      case 'madinah-ziyarat': return 'med_ziyarat';
      case 'taif-ziyarat': return 'mak_taif';
      case 'full-day': return 'full_day_8h';
      default: return null;
    }
  };

  const activeRouteId = getPillMatchingRouteId(selectedPillId);


  const renderVehicleCard = (vehicle: VehicleFleet) => {
    const activeRouteItem = vehicle.routes.find(r => r.routeId === activeRouteId);
    return (
      <div 
        id={'vehicle-card-' + vehicle.id}
        key={vehicle.id}
        className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-emerald-300 group"
      >
        <div className="pt-6 pb-3 px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-dark-charcoal)] tracking-tight">
            {vehicle.name}
          </h3>
        </div>
        <div className="px-6 pb-4 flex items-center justify-center gap-6 text-sm sm:text-base font-bold text-gray-800">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#1b314b] text-white flex items-center justify-center shrink-0">
              <Users size={12} />
            </div>
            <span>({isAr ? vehicle.passengersAr : vehicle.passengers})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={15} className="text-gray-600" />
            <span>({isAr ? vehicle.luggageAr : vehicle.luggage})</span>
          </div>
        </div>
        <hr className="border-gray-200 mx-4" />
        <div className="px-6 py-4 flex items-center justify-center bg-radial from-gray-50 to-white min-h-[190px]">
          <ResponsiveImage 
            src={vehicle.image} 
            alt={vehicle.name}
            loading="lazy"
            className="max-h-40 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
            onError={(e: any) => {
              e.target.setAttribute('src', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80');
            }}
          />
        </div>
        {activeRouteItem && (
          <div className="mx-4 mb-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase block">
                {isAr ? 'سعر المسار المحدد' : 'Selected Route Price'}
              </span>
              <span className="font-extrabold text-[var(--color-saudi-green)] text-xl">
                {activeRouteItem.price} SR
              </span>
            </div>
            <button
              onClick={() => handleBookVehicle(vehicle, activeRouteItem)}
              className="px-4 py-2.5 bg-[var(--color-saudi-green)] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-sm min-h-[44px]"
            >
              {isAr ? 'حجز هذا المسار' : 'Book Route'}
            </button>
          </div>
        )}
        <div className="px-5 py-4 flex-1 bg-white">
          <ul className="space-y-4 sm:space-y-2 text-base sm:text-sm text-gray-700 leading-tight">
            {vehicle.routes.map(r => {
              const isThisActive = activeRouteId === r.routeId;
              return (
                <li 
                  key={r.routeId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-2 p-5 sm:p-2 rounded-2xl sm:rounded-xl border-2 sm:border-0 shadow-sm sm:shadow-none transition-colors ${
                    isThisActive 
                      ? 'bg-amber-50/90 border-amber-300 ring-0' 
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-2 flex-1 min-w-0">
                    <div className="mt-1.5 sm:mt-0 w-2.5 h-2.5 sm:w-1.5 sm:h-1.5 rounded-full bg-[var(--color-saudi-green)] shrink-0 shadow-sm"></div>
                    <span className="break-words font-black text-[19px] sm:text-sm text-gray-900 leading-snug sm:leading-normal" title={isAr ? r.routeNameAr : r.routeNameEn}>
                      {isAr ? r.routeNameAr : r.routeNameEn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t-2 border-dashed sm:border-solid sm:border-t-0 border-gray-200/80 sm:border-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
                      <span className="text-[11px] text-gray-400 font-extrabold uppercase tracking-widest sm:hidden mb-0.5">
                        {isAr ? 'السعر' : 'Fare'}
                      </span>
                      <span className={`shrink-0 font-black text-[28px] sm:text-base leading-none ${isThisActive ? 'text-amber-950' : 'text-[var(--color-saudi-green)]'}`}>
                        {r.price} <span className="text-sm sm:text-xs font-bold text-gray-500">SR</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookVehicle(vehicle, r)}
                      className="px-8 sm:px-4 py-3.5 sm:py-1.5 bg-[var(--color-saudi-green)] text-white text-lg sm:text-sm font-black rounded-xl hover:bg-[var(--color-saudi-emerald)] transition-colors cursor-pointer shadow-lg sm:shadow-md"
                    >
                      {isAr ? 'احجز' : 'Book'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-5 pt-3 bg-gray-50/60 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => handleBookVehicle(vehicle, activeRouteItem)}
            className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-base min-h-[48px] tracking-wide transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'احجز الآن!' : 'Book Now!'}</span>
            <ArrowRight size={15} className="rtl:rotate-180 text-[var(--color-luxury-gold)]" />
          </button>
          <button
            onClick={() => handleWhatsAppBooking(vehicle, activeRouteItem)}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[var(--color-saudi-green)] border border-emerald-200 py-3 px-4 rounded-xl font-bold text-sm min-h-[44px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={13} />
            <span>{isAr ? 'استفسار عبر واتساب' : 'Inquire on WhatsApp'}</span>
          </button>
        </div>
      </div>
    );
  };


  const mainVehicleId = searchParams.get('vehicle');
  const mainVehicle = mainVehicleId ? filteredVehicles.find(v => v.id === mainVehicleId) : null;
  const otherVehicles = mainVehicleId ? filteredVehicles.filter(v => v.id !== mainVehicleId) : filteredVehicles;

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-24 text-[var(--color-dark-charcoal)]">
      <PageCustomRenderer pageKey="routes_rates" position="top" />
      <Helmet>
        <title>{isAr ? 'احجز أسطولك | أسعار ومسارات رحلات العمرة VIP' : 'Book Your Fleet | Umrah Transfer Routes & Rates'}</title>
        <meta 
          name="description" 
          content="Explore all Umrah transport vehicle rates: Toyota Camry, GMC XL 2025, Hyundai Staria, Ford Taurus, Toyota Hiace, Lexus ES300h, Toyota Coaster, and Luxury Bus. 17 fixed transparent routes." 
        />
        <meta name="keywords" content="Book your fleet, Umrah routes and rates, Makkah to Madinah taxi, Jeddah airport transfer, GMC XL Umrah, Toyota Camry Makkah, Hiace VIP, Faris transport rates" />
      </Helmet>
      <Breadcrumbs items={[{ label: t('routes_rates') || 'Routes & Rates' }]} />
{/* TOP HERO & HEADER */}
      <section className="bg-white border-b border-slate-200/80 pt-10 pb-8 sm:pt-14 sm:pb-10 shadow-2xs">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200/60 mb-4 shadow-2xs">
            <Sparkles size={13} className="text-[var(--color-luxury-gold)]" />
            <span>{isAr ? 'أسعار رسمية ثابتة ومضمونة 100%' : 'Official Guaranteed Fixed Rates & VIP Service'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0c2e22] tracking-tight mb-3">
            {isAr ? 'احجز أسطولك المفضل' : 'Book Your Fleet'}
          </h1>
          
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'اختر وسيلة النقل المناسبة لرحلتك من أسطولنا المتكامل لعام 2025/2026 مع جدول الأسعار الشفاف لكافة مسارات العمرة والمطارات والمزارات.'
              : 'Select your preferred vehicle from our executive 2025/2026 fleet. Complete transparent pricing for all airport transfers, intercity routes, and sacred Ziyarat tours.'}
          </p>
        </div>
      </section>

      {/* QUICK ROUTE PILLS SECTION (Matches Reference Image 1) */}
      <section className="py-8 bg-[#E9EEF4] border-b border-slate-200/80 shadow-inner">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                {isAr ? 'تصفية سريعة حسب المسار:' : 'Quick Route Filter:'}
              </span>
              {selectedPillId && (
                <button
                  onClick={() => setSelectedPillId(null)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                >
                  {isAr ? 'إلغاء التحديد (عرض الكل)' : 'Clear Filter (Show All)'}
                </button>
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium hidden sm:inline">
              {isAr ? 'انقر على أي مسار لتظليله في بطاقات السيارات بالأسفل' : 'Click any route to highlight prices across all fleet cards below'}
            </span>
          </div>

          {/* 12 Green Rounded Pill Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {QUICK_ROUTE_PILLS.map(pill => {
              const isActive = selectedPillId === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handlePillClick(pill)}
                  className={`group relative overflow-hidden rounded-full py-4 px-5 sm:px-6 text-sm sm:text-base font-bold text-center transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center text-balance ${
                    isActive
                      ? 'bg-[var(--color-luxury-gold)] text-[var(--color-dark-charcoal)] ring-4 ring-emerald-600/30 scale-[1.02] shadow-lg font-extrabold'
                      : 'bg-[#006644] hover:bg-[#005237] active:scale-[0.98] text-white hover:shadow-lg'
                  }`}
                >
                  <span className="relative z-10 leading-tight">
                    {isAr ? pill.nameAr : pill.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEARCH & CATEGORY FILTER BAR */}
      <section className="py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: isAr ? 'جميع السيارات (9)' : 'All Fleet (9)' },
                { id: 'sedan', label: isAr ? 'سيدان فاخر' : 'Sedan' },
                { id: 'suv', label: isAr ? 'سيارات عائلية (SUV)' : 'Luxury SUV' },
                { id: 'van', label: isAr ? 'فانات واسعة' : 'Vans' },
                { id: 'bus', label: isAr ? 'حافلات المجموعات' : 'Coasters & Buses' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[var(--color-saudi-green)] text-white shadow-sm'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن سيارة أو مسار..." : "Search car or route..."}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium outline-none focus:border-[var(--color-saudi-green)] focus:ring-1 focus:ring-[var(--color-saudi-green)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FLEET CARDS GRID (Matches Reference Image 2) */}
      <section className="pt-2 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Active filter highlight notice */}
          {selectedPillId && (
            <div className="bg-emerald-900 text-white rounded-2xl p-4 mb-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-luxury-gold)] text-gray-900 font-black flex items-center justify-center text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {isAr ? 'المسار المحدد حالياً:' : 'Active Route Selected:'}{' '}
                    <span className="text-[var(--color-luxury-gold)]">
                      {QUICK_ROUTE_PILLS.find(p => p.id === selectedPillId)?.nameEn}
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-200">
                    {isAr ? 'الأسعار الخاصة بهذا المسار موضحة ومميزة في كل بطاقة أدناه.' : 'Specific prices for this trip are highlighted in gold across all vehicles.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPillId(null)}
                className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء التصفية' : 'Clear Route Selection'}
              </button>
            </div>
          )}

          
          {mainVehicle && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <Sparkles className="text-[var(--color-saudi-green)]" size={24} />
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-dark-charcoal)] text-center tracking-tight">
                  {isAr ? 'السيارة المختارة' : 'Selected Vehicle'}
                </h2>
                <Sparkles className="text-[var(--color-saudi-green)]" size={24} />
              </div>
              <div className="max-w-2xl mx-auto ring-4 ring-[var(--color-saudi-green)]/20 rounded-2xl shadow-2xl scale-[1.02] transform transition-all">
                {renderVehicleCard(mainVehicle)}
              </div>
            </div>
          )}

          {otherVehicles.length > 0 && (
            <div>
              {mainVehicle && (
                <div className="mb-8 text-center border-t border-gray-200 pt-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {isAr ? 'سيارات أخرى في أسطولنا' : 'Other Vehicles in our Fleet'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2">{isAr ? 'تصفح خيارات إضافية تناسب احتياجاتك' : 'Browse more options for your journey'}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {otherVehicles.map(vehicle => renderVehicleCard(vehicle))}
              </div>
            </div>
          )}
{/* Ad Banner for monetization */}
          <div className="mt-12">
            <AdBanner dataAdSlot="routes-rates-bottom" />
          </div>

        </div>
      </section>

      {/* BOTTOM ASSURANCE & FAQ HIGHLIGHT */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-[var(--color-saudi-green)] text-white mx-auto flex items-center justify-center font-bold mb-3 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'أسعار ثابتة بدون مفاجآت' : '100% Fixed Rates'}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isAr ? 'الأسعار تشمل الوقود ورسوم الطرق والضرائب، ولا توجد أي رسوم خفية إضافية.' : 'All tolls, fuel, and taxes included with no hidden surcharges.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-[var(--color-saudi-green)] text-white mx-auto flex items-center justify-center font-bold mb-3 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'سائقون محترفون ومرخصون' : 'Licensed VIP Chauffeurs'}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isAr ? 'استقبال مهني في صالات المطار ومساعدة كاملة في تحميل الأمتعة طوال الرحلة.' : 'Airport terminal meet & greet with complimentary luggage assistance.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-[var(--color-saudi-green)] text-white mx-auto flex items-center justify-center font-bold mb-3 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'دعم وحجز فوري 24/7' : '24/7 Live Support'}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isAr ? 'فريق خدمة العملاء جاهز عبر الواتساب والمكالمات لتأكيد حجزك على مدار الساعة.' : 'Instant dispatch and confirmation via WhatsApp and phone round-the-clock.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      <PageCustomRenderer pageKey="routes_rates" position="bottom" />
    </div>
  );
}
