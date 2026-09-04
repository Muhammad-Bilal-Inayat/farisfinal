import { useState, useMemo, useEffect, useRef } from 'react';
import ResponsiveImage from '../components/ResponsiveImage';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/Breadcrumbs';
import { Users, Briefcase, Sparkles, Check, ArrowRight, MessageSquare, Search, Filter, Phone, ChevronLeft, ChevronRight, Eye, LayoutGrid } from 'lucide-react';
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
import { getVehicleImageByName } from '../utils/imageUtils';

import { useVehiclesSnapshot } from '../hooks/useVehiclesSnapshot';

export default function RoutesRates() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openWhatsApp } = useWhatsApp();
  const [selectedPillId, setSelectedPillId] = useState<string | null>(() => {
    return searchParams.get('pill') || searchParams.get('route') || null;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'all'>('card');
  const [activeMobileVehicleId, setActiveMobileVehicleId] = useState<string>('gmc-xl');
  const [selectedRouteByVehicle, setSelectedRouteByVehicle] = useState<Record<string, any>>({});
  const mobileTabsRef = useRef<HTMLDivElement>(null);

  const [dynamicVehicles, setDynamicVehicles] = useState<VehicleFleet[]>([]);

  useEffect(() => {
    const pillFromUrl = searchParams.get('pill') || searchParams.get('route');
    const vehicleFromUrl = searchParams.get('vehicle');
    if (pillFromUrl) {
      setSelectedPillId(pillFromUrl);
    }
    if (vehicleFromUrl) {
      setActiveMobileVehicleId(vehicleFromUrl);
    }
  }, [searchParams]);

  const snapshotVehicles = useVehiclesSnapshot();

  const loadPublicRoutesAndVehicles = () => {
    if (!snapshotVehicles || snapshotVehicles.length === 0) return;
    
    Promise.all([
      Promise.resolve(snapshotVehicles),
      fetch('/api/routes', { cache: 'no-store' }).then(r => r.json())
    ]).then(([vehicles, routes]) => {
      if (Array.isArray(vehicles) && Array.isArray(routes)) {
        // Sort vehicles ensuring GMC XL 2025 is first
        const sortedVehicles = [...vehicles].sort((a: any, b: any) => {
          if (a.name?.toLowerCase().includes('gmc')) return -1;
          if (b.name?.toLowerCase().includes('gmc')) return 1;
          return (a.displayOrder ?? a.display_order ?? 0) - (b.displayOrder ?? b.display_order ?? 0);
        });

        const enriched = sortedVehicles.map((v: any) => {
          const vRoutes: any[] = [];
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

          // Format passenger and luggage specs cleanly using DB values directly
          const pVal = v.passengerCapacity?.toString() || '4';
          const lVal = v.luggageCapacity?.toString() || '4';

          return {
            id: v.id.toString(),
            name: v.name,
            nameAr: v.nameAr || v.name,
            category: (v.category || 'Luxury') as any,
            passengers: `${pVal} Passengers`,
            passengersAr: `${pVal} ركاب`,
            luggage: `${lVal} Big Size`,
            luggageAr: `${lVal} حقائب كبيرة`,
            image: getVehicleImageByName(v.name, v.imageUrl),
            routes: vRoutes
          };
        });

        if (enriched.length > 0) {
          setDynamicVehicles(enriched);
          if (!searchParams.get('vehicle')) {
            setActiveMobileVehicleId(enriched[0].id);
          }
        }
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadPublicRoutesAndVehicles();

    const handleSync = () => loadPublicRoutesAndVehicles();
    window.addEventListener('faris_routes_updated', handleSync);
    window.addEventListener('faris_vehicles_updated', handleSync);

    return () => {
      window.removeEventListener('faris_routes_updated', handleSync);
      window.removeEventListener('faris_vehicles_updated', handleSync);
    };
  }, [snapshotVehicles]);

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
  }, [dynamicVehicles, selectedCategory, searchQuery]);

  // Current vehicle for single card mobile view
  const currentMobileIndex = useMemo(() => {
    const idx = filteredVehicles.findIndex(v => v.id === activeMobileVehicleId);
    return idx >= 0 ? idx : 0;
  }, [filteredVehicles, activeMobileVehicleId]);

  const currentMobileVehicle = filteredVehicles[currentMobileIndex] || filteredVehicles[0];

  const handleSelectMobileVehicle = (vId: string) => {
    setActiveMobileVehicleId(vId);
    // Auto scroll the tab into view
    const tabEl = document.getElementById(`tab-btn-${vId}`);
    if (tabEl && mobileTabsRef.current) {
      tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handlePrevMobileVehicle = () => {
    if (filteredVehicles.length <= 1) return;
    const newIdx = (currentMobileIndex - 1 + filteredVehicles.length) % filteredVehicles.length;
    handleSelectMobileVehicle(filteredVehicles[newIdx].id);
  };

  const handleNextMobileVehicle = () => {
    if (filteredVehicles.length <= 1) return;
    const newIdx = (currentMobileIndex + 1) % filteredVehicles.length;
    handleSelectMobileVehicle(filteredVehicles[newIdx].id);
  };

  const handleBookVehicle = (vehicle: VehicleFleet, routeItem?: any) => {
    const selectedR = routeItem || selectedRouteByVehicle[vehicle.id] || vehicle.routes[0];
    const pickup = selectedR?.pickup || 'Jeddah Airport (JED)';
    const destination = selectedR?.destination || 'Makkah Hotel / Haram';
    const params = new URLSearchParams({
      vehicle: vehicle.name,
      pickup: pickup,
      destination: destination,
    });
    if (selectedR?.price) {
      params.append('price', String(selectedR.price));
    }
    navigate(`/booking?${params.toString()}`);
  };

  const handleWhatsAppBooking = (vehicle: VehicleFleet, routeItem?: any) => {
    const selectedR = routeItem || selectedRouteByVehicle[vehicle.id] || vehicle.routes[0];
    const rName = selectedR ? (isAr ? selectedR.routeNameAr : selectedR.routeNameEn) : (isAr ? 'رحلة عمرة عامة' : 'General Umrah Transfer');
    const priceText = selectedR ? `${selectedR.price} SAR` : '';
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

  // Exact card renderer matching the uploaded reference image
  const renderVehicleCard = (vehicle: VehicleFleet, isMobileFocused = false) => {
    const activeRouteItem = vehicle.routes.find(r => r.routeId === activeRouteId);
    const selectedRouteForCar = selectedRouteByVehicle[vehicle.id] || activeRouteItem;

    return (
      <div 
        id={'vehicle-card-' + vehicle.id}
        key={vehicle.id}
        className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-gray-200/90 overflow-hidden flex flex-col transition-all duration-200"
      >
        {/* Top Header: Centered Vehicle Name */}
        <div className="pt-4 sm:pt-5 pb-1 sm:pb-2 px-3.5 sm:px-5 text-center">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {vehicle.name}
          </h3>
        </div>

        {/* Capacity Badges: (7 Passengers) (8 Big Size) */}
        <div className="px-3.5 sm:px-5 pb-3 flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#1b314b] text-white flex items-center justify-center shrink-0">
              <Users size={11} />
            </div>
            <span>({isAr ? vehicle.passengersAr : vehicle.passengers})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-gray-500" />
            <span>({isAr ? vehicle.luggageAr : vehicle.luggage})</span>
          </div>
        </div>

        {/* Thin Divider Line */}
        <hr className="border-gray-200 mx-4" />

        {/* Centered Vehicle Photo */}
        <div className="px-4 py-2.5 sm:py-3.5 flex items-center justify-center bg-white min-h-[140px] sm:min-h-[170px]">
          <ResponsiveImage 
            src={vehicle.image} 
            alt={vehicle.name}
            loading="lazy"
            className="max-h-32 sm:max-h-38 w-auto object-contain drop-shadow-2xs transition-transform duration-300 hover:scale-105"
            onError={(e: any) => {
              e.target.setAttribute('src', getVehicleImageByName(vehicle.name));
            }}
          />
        </div>

        {/* Active Filter Notice if selected via pill */}
        {activeRouteItem && (
          <div className="mx-3.5 sm:mx-4 mb-2 p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl flex items-center justify-between text-xs shadow-2xs">
            <div>
              <span className="font-bold text-amber-900 block text-xs">
                {isAr ? activeRouteItem.routeNameAr : activeRouteItem.routeNameEn}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">
                {isAr ? 'المسار المحدد عبر الفلتر' : 'Filter Selected Route'}
              </span>
            </div>
            <span className="font-black text-amber-950 text-sm sm:text-base">
              {activeRouteItem.price} SR
            </span>
          </div>
        )}

        {/* Bulleted Routes & Rates List (Matching reference image) */}
        <div className="px-3 sm:px-4.5 py-2 flex-1 bg-white">
          <ul className="space-y-1 text-xs sm:text-sm leading-snug">
            {vehicle.routes.map(r => {
              const isThisActive = (activeRouteItem && activeRouteItem.routeId === r.routeId) || 
                                   (selectedRouteForCar && selectedRouteForCar.routeId === r.routeId);
              return (
                <li 
                  key={r.routeId}
                  onClick={() => {
                    setSelectedRouteByVehicle(prev => ({ ...prev, [vehicle.id]: r }));
                  }}
                  className={`flex items-baseline justify-between gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors border-b border-gray-100/70 last:border-0 hover:bg-gray-50 ${
                    isThisActive 
                      ? 'bg-amber-50/90 text-amber-950 font-bold' 
                      : 'text-gray-800'
                  }`}
                  title={isAr ? "انقر لاختيار هذا المسار" : "Click to select this route"}
                >
                  <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                    <span className={`text-sm leading-none select-none font-bold ${isThisActive ? 'text-amber-600' : 'text-gray-400'}`}>•</span>
                    <span className="font-medium text-gray-800 tracking-tight text-xs sm:text-sm">
                      {isAr ? r.routeNameAr : r.routeNameEn}
                    </span>
                    {isThisActive && (
                      <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded ml-1 shrink-0">
                        {isAr ? 'محدد' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <span className={`shrink-0 font-bold whitespace-nowrap text-xs sm:text-sm ${isThisActive ? 'text-amber-950 font-black' : 'text-gray-900'}`}>
                    {r.price} <span className="text-[10px] sm:text-xs font-semibold text-gray-500">SR</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Actions: Solid Black Book Now Button + WhatsApp Button */}
        <div className="p-3.5 sm:p-4 pt-2.5 bg-white border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => handleBookVehicle(vehicle, selectedRouteForCar)}
            className="w-full bg-[#111111] hover:bg-black active:scale-[0.99] text-white py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm min-h-[42px] sm:min-h-[46px] tracking-wide transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isAr ? 'احجز الآن!' : 'Book Now!'}</span>
            <ArrowRight size={15} className="rtl:rotate-180 text-[var(--color-luxury-gold)]" />
          </button>
          <button
            onClick={() => handleWhatsAppBooking(vehicle, selectedRouteForCar)}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[var(--color-saudi-green)] border border-emerald-200 py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm min-h-[38px] sm:min-h-[42px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={14} />
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
    <div className="min-h-screen bg-[#F5F7FA] text-gray-800">
      <Helmet>
        <title>{isAr ? 'أسعار ومسارات التوصيل | تاكسي مكة والمدينة وجدة' : 'Routes & Fixed Fares | Makkah & Madinah Luxury Fleet'}</title>
        <meta 
          name="description" 
          content={isAr 
            ? 'اطلع على قائمة الأسعار الشاملة والمسارات المعتمدة لتنقلات العمرة والمطارات مع جمس 2025 وسياراتنا الفاخرة.'
            : 'Explore full fleet fixed rates & routes for Umrah VIP transfers including GMC XL 2025, Toyota Camry, Staria and private buses.'
          } 
        />
      </Helmet>

      {/* Hero Header */}
      <section className="bg-radial from-[var(--color-saudi-green)] to-[#003824] text-white pt-8 pb-7 sm:pb-9 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <Breadcrumbs 
            items={[
              { label: isAr ? 'الرئيسية' : 'Home', path: '/' },
              { label: isAr ? 'الأسعار والمسارات' : 'Routes & Rates' }
            ]} 
          />
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-center tracking-tight mt-2 text-white">
            {isAr ? 'قائمة الأسعار والمسارات المعتمدة' : 'Fleet Routes & Fixed Fares'}
          </h1>
          <p className="text-xs sm:text-base text-emerald-100 text-center max-w-2xl mx-auto mt-2 font-normal leading-relaxed">
            {isAr 
              ? 'أسعار شفافة وثابتة بالريال السعودي تشمل الوقود والضريبة وخدمة الاستقبال والتوصيل من الباب إلى الباب.'
              : 'Transparent, all-inclusive pricing in SAR covering fuel, airport pickup, and dedicated chauffeur service.'
            }
          </p>
        </div>
      </section>



      {/* MOBILE VEHICLE TABS & CONTROLS (Active only on mobile screens) */}
      <section className="sm:hidden pt-3 pb-2 bg-white border-b border-gray-200/90 sticky top-0 z-20 shadow-2xs">
        <div className="container mx-auto px-3 max-w-xl">
          {/* Header with Car counter & View Mode toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase">
                {isAr ? 'السيارة:' : 'Vehicle:'}
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {currentMobileIndex + 1} / {filteredVehicles.length}
              </span>
            </div>

            {/* View Mode Toggle: Single Card vs All Cards */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setMobileViewMode('card')}
                className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer text-[11px] ${
                  mobileViewMode === 'card' 
                    ? 'bg-white text-gray-900 shadow-2xs font-extrabold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Eye size={12} />
                <span>{isAr ? 'بطاقة مفردة' : 'Card View'}</span>
              </button>
              <button
                onClick={() => setMobileViewMode('all')}
                className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer text-[11px] ${
                  mobileViewMode === 'all' 
                    ? 'bg-white text-gray-900 shadow-2xs font-extrabold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={12} />
                <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Vehicle Selection Bar */}
          <div 
            ref={mobileTabsRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none"
          >
            {filteredVehicles.map(v => {
              const isSelected = v.id === activeMobileVehicleId;
              return (
                <button
                  key={v.id}
                  id={`tab-btn-${v.id}`}
                  onClick={() => handleSelectMobileVehicle(v.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-[#111111] text-white shadow-xs ring-2 ring-emerald-500/30 font-black' 
                      : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                  }`}
                >
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next Navigation Arrows for Fast Car Flipping */}
          {mobileViewMode === 'card' && filteredVehicles.length > 1 && (
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200 gap-2">
              <button
                onClick={handlePrevMobileVehicle}
                className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 py-3 px-4 bg-[#05513F] hover:bg-emerald-800 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <ChevronLeft size={18} className="rtl:rotate-180 text-amber-300 shrink-0" />
                <span>{isAr ? 'السيارة السابقة' : 'Prev Car'}</span>
              </button>

              <span className="text-xs sm:text-sm font-black text-emerald-950 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300 truncate max-w-[150px] text-center shadow-2xs">
                {currentMobileVehicle?.name}
              </span>

              <button
                onClick={handleNextMobileVehicle}
                className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 py-3 px-4 bg-[#05513F] hover:bg-emerald-800 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <span>{isAr ? 'السيارة التالية' : 'Next Car'}</span>
                <ChevronRight size={18} className="rtl:rotate-180 text-amber-300 shrink-0" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* DESKTOP & TABLET SEARCH & CATEGORY FILTER BAR */}
      <section className="hidden sm:block py-4 md:py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Categories */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: isAr ? 'جميع السيارات (9)' : 'All Fleet (9)' },
                { id: 'suv', label: isAr ? 'جمس و SUV فاخر' : 'Luxury SUV (GMC)' },
                { id: 'sedan', label: isAr ? 'سيدان فاخر' : 'Executive Sedan' },
                { id: 'van', label: isAr ? 'فانات عائلية' : 'Family Vans' },
                { id: 'bus', label: isAr ? 'حافلات المجموعات' : 'Coasters & Buses' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[var(--color-saudi-green)] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 lg:w-72 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث عن سيارة أو مسار..." : "Search car or route..."}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium outline-none focus:border-[var(--color-saudi-green)] focus:ring-1 focus:ring-[var(--color-saudi-green)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FLEET DISPLAY SECTION */}
      <section className="pt-3 sm:pt-4 pb-14">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          
          {/* MOBILE VIEW RENDERING */}
          <div className="sm:hidden max-w-sm mx-auto">
            {mobileViewMode === 'card' ? (
              // Focused Single Card View (Matching uploaded reference image)
              currentMobileVehicle ? (
                <div className="transition-all duration-300">
                  {renderVehicleCard(currentMobileVehicle, true)}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl text-center text-gray-500 font-bold">
                  {isAr ? 'لا توجد سيارات مطابقة' : 'No vehicles found'}
                </div>
              )
            ) : (
              // All Cards Stacked View on Mobile
              <div className="space-y-4 sm:space-y-6">
                {filteredVehicles.map(vehicle => renderVehicleCard(vehicle, false))}
              </div>
            )}
          </div>

          {/* DESKTOP & TABLET VIEW RENDERING (Clean Grid Layout) */}
          <div className="hidden sm:block">
            {mainVehicle && (
              <div className="mb-8 md:mb-12">
                <div className="flex items-center gap-2 mb-4 sm:mb-6 justify-center">
                  <Sparkles className="text-[var(--color-saudi-green)]" size={22} />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 text-center tracking-tight">
                    {isAr ? 'السيارة المختارة' : 'Selected Vehicle'}
                  </h2>
                  <Sparkles className="text-[var(--color-saudi-green)]" size={22} />
                </div>
                <div className="max-w-xl mx-auto ring-4 ring-emerald-500/20 rounded-2xl shadow-xl">
                  {renderVehicleCard(mainVehicle)}
                </div>
              </div>
            )}

            {otherVehicles.length > 0 ? (
              <div>
                {mainVehicle && (
                  <div className="mb-6 md:mb-8 text-center border-t border-gray-200 pt-6 md:pt-10">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                      {isAr ? 'باقي سيارات الأسطول' : 'Other Fleet Vehicles'}
                    </h2>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                  {otherVehicles.map(vehicle => renderVehicleCard(vehicle))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 sm:p-12 rounded-2xl text-center text-gray-500 font-bold border border-gray-200">
                {isAr ? 'لا توجد سيارات مطابقة للبحث' : 'No vehicles found matching your criteria'}
              </div>
            )}
          </div>

          {/* Ad Banner */}
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
