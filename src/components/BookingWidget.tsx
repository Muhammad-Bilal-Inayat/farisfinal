import React, { useState, useEffect, useMemo, useRef } from 'react';
import ResponsiveImage from './ResponsiveImage';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  User, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useWhatsApp } from '../hooks/useWhatsApp';

export interface Vehicle {
  id: number;
  name: string;
  year?: number;
  passengerCapacity: number;
  luggageCapacity: number;
  startingPrice: number;
  category?: string;
  imageUrl?: string;
  features?: string;
}

export interface Route {
  id: number;
  pickup: string;
  destination: string;
  rates?: { vehicleId: number; price: number; priceMax?: number }[];
  minPrice?: number;
  maxPrice?: number;
}

export interface BookingWidgetProps {
  preselectedVehicleId?: string;
  onVehicleChange?: (id: string) => void;
}

export default function BookingWidget({ preselectedVehicleId, onVehicleChange }: BookingWidgetProps) {
  const { companyName } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const { settings } = useWhatsApp();
  const [searchParams] = useSearchParams();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
  const [tripType, setTripType] = useState<'One Way' | 'Round Trip' | 'Full Day'>('One Way');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState<number | ''>(2);
  const [luggage, setLuggage] = useState<number | ''>(2);
  const [vehicleId, setVehicleId] = useState('');
  
  // Step Management
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Contact Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string; price: number; minPrice: number; maxPrice: number } | null>(null);

  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Sync preselected vehicle from parent or query param
  useEffect(() => {
    if (preselectedVehicleId !== undefined) {
      if (preselectedVehicleId !== vehicleId) {
        setVehicleId(preselectedVehicleId);
      }
    }
  }, [preselectedVehicleId]);

  // Sync auth user details if logged in
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Fetch vehicles and routes
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data);

        // Check if query params specify vehicle
        const queryVeh = searchParams.get('vehicle') || searchParams.get('car') || searchParams.get('model') || searchParams.get('vehicleId');
        if (queryVeh) {
          const matched = data.find((v: any) => 
            String(v.id) === queryVeh || 
            v.name.toLowerCase().includes(queryVeh.toLowerCase())
          );
          if (matched) {
            setVehicleId(String(matched.id));
            if (onVehicleChange) onVehicleChange(String(matched.id));
          }
        }
      })
      .catch(console.error);
      
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        const locSet = new Set<string>();
        data.forEach((r: Route) => {
          if (r.pickup && r.pickup !== 'Full Day' && r.pickup !== '8 Hours') locSet.add(r.pickup);
          if (r.destination && r.destination !== 'Full Day' && r.destination !== '8 Hours') locSet.add(r.destination);
        });
        
        // Add common Saudi Umrah checkpoints if not present
        const standardLocs = [
          'Jeddah Airport (JED)',
          'Makkah Hotel / Haram',
          'Madinah Hotel / Markazia',
          'Madinah Airport (MED)',
          'Makkah Train Station (HHR)',
          'Madinah Train Station (HHR)',
          'Jeddah Hotel / Corniche',
          'Taif Ziyarat Tour',
          'Makkah Ziyarat Tour',
          'Madinah Ziyarat Tour',
          'Badr Ziyarat'
        ];
        standardLocs.forEach(l => locSet.add(l));

        setLocations(Array.from(locSet).sort());

        // Parse service query params
        const qService = searchParams.get('service')?.toLowerCase();
        const qCity = searchParams.get('city')?.toLowerCase();
        const qType = searchParams.get('type') || searchParams.get('tripType');

        if (qType) {
          const tLower = qType.toLowerCase();
          if (tLower.includes('full') || tLower === 'full_day') {
            setTripType('Full Day');
          } else if (tLower.includes('round') || tLower === 'round_trip') {
            setTripType('Round Trip');
          } else if (tLower.includes('one') || tLower === 'one_way') {
            setTripType('One Way');
          }
        }

        if (qService === 'ziyarat') {
          if (qCity === 'madinah') {
            setPickup('Madinah Hotel / Markazia');
            setDestination('Madinah Ziyarat Tour');
          } else {
            setPickup('Makkah Hotel / Haram');
            setDestination('Makkah Ziyarat Tour');
          }
        } else if (qService === 'airport') {
          setPickup('Jeddah Airport (JED)');
          setDestination('Makkah Hotel / Haram');
        } else if (qService === 'intercity') {
          setPickup('Makkah Hotel / Haram');
          setDestination('Madinah Hotel / Markazia');
        } else if (qService === 'chauffeur') {
          setTripType('Full Day');
          setPickup('Full Day Chauffeur');
          setDestination('8 Hours City Charter');
        }

        // Parse query params for pickup and destination if explicitly provided
        const qPickup = searchParams.get('pickup') || searchParams.get('from');
        if (qPickup) setPickup(qPickup);

        const qDest = searchParams.get('destination') || searchParams.get('to') || searchParams.get('dropoff');
        if (qDest) setDestination(qDest);

        const qTime = searchParams.get('time');
        if (qTime) setTime(qTime);

        const qDate = searchParams.get('date');
        if (qDate) setDate(qDate);
      })
      .catch(console.error);
  }, [searchParams]);

  // Car image helper
  const getCarImage = (name: string) => {
    const i = name.toLowerCase();
    if (i.includes('camry') || i.includes('sedan') || i.includes('taurus') || i.includes('lexus') || i.includes('mercedes')) {
      return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80";
    }
    if (i.includes('gmc') || i.includes('suv') || i.includes('yukon')) {
      return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
    }
    if (i.includes('staria') || i.includes('van') || i.includes('hiace') || i.includes('h1')) {
      return "https://images.unsplash.com/photo-1621007947382-bb3c399b52c5?auto=format&fit=crop&w=800&q=80";
    }
    if (i.includes('bus') || i.includes('coaster') || i.includes('coster')) {
      return "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80";
  };

  // Quick preset routes
  const popularPresets = [
    { label: 'Jeddah ➔ Makkah', p: 'Jeddah Airport (JED)', d: 'Makkah Hotel / Haram', type: 'One Way' as const },
    { label: 'Makkah ➔ Madinah', p: 'Makkah Hotel / Haram', d: 'Madinah Hotel / Markazia', type: 'One Way' as const },
    { label: 'Madinah Airport ➔ Hotel', p: 'Madinah Airport (MED)', d: 'Madinah Hotel / Markazia', type: 'One Way' as const },
    { label: 'Makkah Ziyarat Tour', p: 'Makkah Hotel / Haram', d: 'Makkah Ziyarat Tour', type: 'One Way' as const },
    { label: 'Full Day Chauffeur (8h)', p: 'Full Day Chauffeur', d: '8 Hours City Charter', type: 'Full Day' as const }
  ];

  const handleApplyPreset = (preset: typeof popularPresets[0]) => {
    setTripType(preset.type);
    setPickup(preset.p);
    setDestination(preset.d);
    setTouched(prev => ({ ...prev, pickup: true, destination: true }));
  };

  // Quick Destination presets
  const popularDestinations = [
    { name: isAr ? 'فندق مكة / الحرم' : 'Makkah Hotel / Haram', val: 'Makkah Hotel / Haram' },
    { name: isAr ? 'فندق المدينة / المركزية' : 'Madinah Hotel / Markazia', val: 'Madinah Hotel / Markazia' },
    { name: isAr ? 'مطار جدة (JED)' : 'Jeddah Airport (JED)', val: 'Jeddah Airport (JED)' },
    { name: isAr ? 'برج الساعة مكة' : 'Makkah Clock Tower', val: 'Makkah Clock Tower' },
    { name: isAr ? 'جولة الطائف' : 'Taif Ziyarat Tour', val: 'Taif Ziyarat Tour' }
  ];

  // Quick Time presets
  const quickTimePresets = [
    {
      label: isAr ? '⚡ بأقرب وقت' : '⚡ ASAP',
      getTime: () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 30);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
      }
    },
    { label: isAr ? '🌅 09:00 ص' : '🌅 09:00 AM', val: '09:00' },
    { label: isAr ? '☀️ 02:00 م' : '☀️ 02:00 PM', val: '14:00' },
    { label: isAr ? '🌇 06:00 م' : '🌇 06:00 PM', val: '18:00' },
    { label: isAr ? '🌙 10:00 م' : '🌙 10:00 PM', val: '22:00' }
  ];

  // Dynamic Fare Calculation Engine
  const priceCalculation = useMemo(() => {
    let p = pickup.toLowerCase().trim();
    let d = destination.toLowerCase().trim();

    if (tripType === 'Full Day') {
      p = 'full day';
      d = '8 hours';
    }

    if (!p && !d && tripType !== 'Full Day') {
      return { isMatched: false, base: 0, min: 0, max: 0, rangeFormatted: 'Select locations' };
    }

    const selectedVeh = vehicles.find(v => v.id === Number(vehicleId));
    const vBase = selectedVeh?.startingPrice || 300;

    // If Full Day Tour, calculate standard charter
    if (tripType === 'Full Day') {
      const basePrice = Math.round(vBase * 2.0);
      const minRange = Math.max(100, Math.floor((basePrice * 0.9) / 10) * 10);
      const maxRange = Math.max(minRange + 40, Math.ceil((basePrice * 1.15) / 10) * 10);
      return {
        isMatched: true,
        base: basePrice,
        min: minRange,
        max: maxRange,
        rangeFormatted: `${minRange} – ${maxRange} SAR`
      };
    }

    // Try to find matched route in backend database routes/rates
    const pNorm = p.replace(/[^a-z0-9]/g, '');
    const dNorm = d.replace(/[^a-z0-9]/g, '');

    const matchedRoute = routes.find(r => {
      const rP = r.pickup.toLowerCase().replace(/[^a-z0-9]/g, '');
      const rD = r.destination.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (rP === pNorm || (rP.length >= 3 && pNorm.includes(rP)) || (pNorm.length >= 3 && rP.includes(pNorm))) &&
             (rD === dNorm || (rD.length >= 3 && dNorm.includes(rD)) || (dNorm.length >= 3 && rD.includes(dNorm)));
    });

    // If route is found in backend database
    if (matchedRoute) {
      let basePrice = 0;
      let explicitMaxPrice = 0;

      if (matchedRoute.rates && vehicleId) {
        const rateObj = matchedRoute.rates.find(rate => rate.vehicleId === Number(vehicleId));
        if (rateObj && rateObj.price > 0) {
          basePrice = rateObj.price;
          if (rateObj.priceMax && rateObj.priceMax > basePrice) {
            explicitMaxPrice = rateObj.priceMax;
          }
        }
      }

      if (!basePrice && matchedRoute.minPrice && matchedRoute.minPrice > 0) {
        basePrice = matchedRoute.minPrice;
      }

      if (basePrice > 0) {
        if (tripType === 'Round Trip') {
          basePrice *= 2;
          if (explicitMaxPrice > 0) explicitMaxPrice *= 2;
        }

        let minRange = basePrice;
        let maxRange = explicitMaxPrice > 0 ? explicitMaxPrice : basePrice;

        return {
          isMatched: true,
          base: basePrice,
          min: minRange,
          max: maxRange,
          rangeFormatted: minRange === maxRange ? `${minRange} SAR` : `${minRange} – ${maxRange} SAR`
        };
      }

      // Route exists in backend, but no vehicle selected yet
      if (!vehicleId) {
        const minFleet = matchedRoute.minPrice || 200;
        const maxFleet = matchedRoute.maxPrice || 700;
        return {
          isMatched: true,
          base: minFleet,
          min: minFleet,
          max: maxFleet,
          rangeFormatted: `${minFleet} – ${maxFleet} SAR`
        };
      }
    }

    // IF NOT in backend database: Provide estimate based on vehicle starting price or WhatsApp contact
    if (selectedVeh && p && d) {
      let estBase = selectedVeh.startingPrice || 300;
      if (tripType === 'Round Trip') estBase *= 2;
      const minRange = Math.max(150, Math.floor((estBase * 0.9) / 10) * 10);
      const maxRange = Math.max(minRange + 50, Math.ceil((estBase * 1.2) / 10) * 10);
      return {
        isMatched: true,
        base: estBase,
        min: minRange,
        max: maxRange,
        rangeFormatted: `${minRange} – ${maxRange} SAR`
      };
    }

    return {
      isMatched: false,
      base: 0,
      min: 0,
      max: 0,
      rangeFormatted: 'Contact on WhatsApp'
    };
  }, [pickup, destination, tripType, vehicleId, routes, vehicles]);

  // Form Validation States
  const isPickupValid = pickup.trim().length >= 2 || tripType === 'Full Day';
  const isDestinationValid = destination.trim().length >= 2 || tripType === 'Full Day';
  const isVehicleValid = vehicleId !== '';
  const isDateValid = date !== '' && date >= new Date().toISOString().split('T')[0];
  const isTimeValid = time !== '';
  const isPaxValid = passengers !== '' && Number(passengers) >= 1 && Number(passengers) <= 50;
  const isZeroPax = passengers !== '' && Number(passengers) === 0;

  // Selected vehicle capacity check
  const selectedVehicleObj = vehicles.find(v => v.id === Number(vehicleId));
  const isOverCapacity = selectedVehicleObj ? Number(passengers) > selectedVehicleObj.passengerCapacity : false;

  const isStep1Valid = isPickupValid && isDestinationValid && isVehicleValid && isDateValid && isTimeValid && isPaxValid && !isOverCapacity;

  const isNameValid = customerName.trim().length >= 2;
  const isPhoneValid = phone.replace(/[^0-9]/g, '').length >= 7;
  const isEmailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStep2Valid = isNameValid && isPhoneValid && isEmailValid;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setTouched({
        pickup: true,
        destination: true,
        vehicleId: true,
        date: true,
        time: true,
        passengers: true
      });
      if (isStep1Valid) {
        setStep(2);
      }
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ customerName: true, phone: true, email: true });
    if (!isStep2Valid) return;

    setLoading(true);
    try {
      const payload: any = {
        tripType,
        pickup: pickup,
        destination: destination,
        date,
        time,
        passengers,
        luggage,
        vehicleId: Number(vehicleId),
        customerName,
        phone,
        email,
        specialRequest,
        price: priceCalculation.base || priceCalculation.min
      };

      if (user) {
        payload.userId = user.id;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess({
          id: data.bookingId,
          price: priceCalculation.base,
          minPrice: priceCalculation.min,
          maxPrice: priceCalculation.max
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    const phoneNumber = settings?.phoneNumber?.replace(/[^0-9]/g, '') || '966576124752';
    const vehicleName = selectedVehicleObj?.name || 'VIP Executive Chauffeur';
    const baseMsg = settings?.newBookingMessage || `Assalamu Alaikum! I would like to confirm my VIP Umrah transport booking with ${companyName}.`;
    
    const fareDisplay = success.minPrice > 0 
      ? (success.minPrice === success.maxPrice ? `${success.minPrice} SAR` : `${success.minPrice} – ${success.maxPrice} SAR`)
      : 'Contact on WhatsApp (Custom Route)';

    const rawMessage = `${baseMsg}\n\n` +
      `*Booking ID:* ${success.id}\n` +
      `*Service:* ${tripType}\n` +
      `*Pickup:* ${pickup}\n` +
      `*Destination:* ${destination}\n` +
      `*Vehicle:* ${vehicleName}\n` +
      `*Date & Time:* ${date} at ${time}\n` +
      `*Passengers:* ${passengers} Pax (${luggage} Luggage)\n` +
      `*Estimated Fare:* ${fareDisplay}\n` +
      `*Lead Guest:* ${customerName} (${phone})\n\n` +
      `Please confirm driver dispatch and flight tracking. JazakAllah Khair!`;
      
    const whatsappMsg = encodeURIComponent(rawMessage);

    return (
      <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-400">
        <div className="w-16 h-16 bg-emerald-100 text-[var(--color-saudi-green)] rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 size={36} className="text-[var(--color-saudi-green)]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-[var(--color-saudi-green)] border border-gray-300 mb-2">
          <Sparkles size={13} /> {isAr ? 'تم استلام طلب الحجز بنجاح' : 'Booking Request Successfully Created'}
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-dark-charcoal)] mb-1">
          {isAr ? 'رقم الحجز:' : 'Your Booking ID:'} <span className="text-[var(--color-saudi-green)] font-mono">{success.id}</span>
        </h3>
        <p className="text-xs md:text-sm text-[var(--color-dark-charcoal)]/70 mb-6 max-w-md mx-auto">
          {isAr ? 'تم إنشاء حجزك المبدئي بنجاح. يرجى التواصل مع فريق التنسيق والمتابعة على الواتساب لتأكيد السائق واستلام رابط التتبع المباشر.' : 'We have generated your provisional booking reservation. Contact our 24/7 Dispatch Team on WhatsApp to finalize your driver allocation and receive your live tracking link.'}
        </p>

        {/* Voucher Receipt Card */}
        <div className="bg-gray-50/50 border border-gray-300 rounded-2xl p-5 text-left rtl:text-right max-w-md mx-auto mb-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-3">
            <span className="text-xs uppercase font-bold text-gray-700">{isAr ? 'تفاصيل الرحلة' : 'Trip Breakdown'}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              {isAr ? 'بانتظار تأكيد الواتساب' : 'Pending WhatsApp Confirmation'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[var(--color-dark-charcoal)] font-medium">
            <div className="flex justify-between">
              <span className="text-gray-900/70">{isAr ? 'المسار:' : 'Route:'}</span>
              <span className="font-bold text-right rtl:text-left truncate max-w-[220px]">{pickup} ➔ {destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900/70">{isAr ? 'المركبة:' : 'Vehicle:'}</span>
              <span className="font-bold">{vehicleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900/70">{isAr ? 'الموعد:' : 'Schedule:'}</span>
              <span>{date} at {time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900/70">{isAr ? 'الركاب / الحقائب:' : 'Pax / Luggage:'}</span>
              <span>{passengers} {t('pass')}, {luggage} {t('luggage_short')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-xs font-bold text-gray-900">{isAr ? 'السعر التقديري:' : 'Estimated Fare:'}</span>
              <span className="text-base font-extrabold text-[var(--color-saudi-green)]">
                {fareDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a 
            href={`https://wa.me/${phoneNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Phone size={18} /> {isAr ? 'تأكيد الحجز عبر واتساب الآن' : 'Confirm via WhatsApp Now'}
          </a>

          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setStep(1);
            }}
            className="w-full sm:w-auto px-4 py-3.5 bg-white hover:bg-gray-50 text-[var(--color-dark-charcoal)] border border-gray-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} /> {isAr ? 'حجز جديد' : 'New Booking'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left rtl:text-right" id="booking-form-container">
      {/* Visual Stepper & Progress Indicator */}
      <div className="mb-3 sm:mb-4 lg:mb-3 xl:mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all ${
              step >= 1 ? 'bg-[var(--color-saudi-green)] text-white shadow-sm' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > 1 ? <Check size={13} strokeWidth={3} /> : '1'}
            </div>
            <div>
              <span className={`text-[11px] sm:text-xs font-bold block ${step === 1 ? 'text-[var(--color-dark-charcoal)]' : 'text-gray-900/70'}`}>
                {isAr ? '١. الرحلة والوجهة والتوقيت' : '1. Route, Time & Vehicle'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-700 hidden sm:block">
                {isAr ? 'حدد الوجهة والوقت والسيارة' : 'Destination, Time & Car'}
              </span>
            </div>
          </div>

          <div className="h-[2px] flex-1 mx-2.5 sm:mx-4 bg-emerald-100 relative rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-saudi-green)] transition-all duration-500 rounded-full" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all ${
              step >= 2 ? 'bg-[var(--color-saudi-green)] text-white shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}>
              2
            </div>
            <div>
              <span className={`text-[11px] sm:text-xs font-bold block ${step === 2 ? 'text-[var(--color-dark-charcoal)]' : 'text-gray-900/70'}`}>
                {isAr ? '٢. بيانات الضيف' : '2. Guest Details'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-700 hidden sm:block">{isAr ? 'التواصل والتنسيق' : 'Contact & Dispatch'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTED CAR SHOWCASE BANNER (When a vehicle is already picked or preselected) */}
      {selectedVehicleObj && (
        <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-emerald-100/60 border-2 border-[var(--color-saudi-green)] rounded-2xl p-3 sm:p-4 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 sm:w-16 h-12 rounded-xl overflow-hidden bg-white border border-gray-300 shrink-0 shadow-xs">
                <ResponsiveImage src={selectedVehicleObj.imageUrl || getCarImage(selectedVehicleObj.name)} alt={selectedVehicleObj.name} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="bg-[var(--color-saudi-green)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 size={11} /> {isAr ? 'تم اختيار السيارة بنجاح' : 'Car Auto-Selected'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-900">
                    {selectedVehicleObj.year || '2025/2026'}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-[var(--color-dark-charcoal)]">
                  {selectedVehicleObj.name}
                </h3>
                <p className="text-[11px] text-gray-900 font-semibold">
                  {selectedVehicleObj.passengerCapacity} {isAr ? 'ركاب' : 'Pax'} • {selectedVehicleObj.luggageCapacity} {isAr ? 'حقائب' : 'Bags'} • {isAr ? 'تبدأ من' : 'From'} {selectedVehicleObj.startingPrice} {isAr ? 'ريال' : 'SAR'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setVehicleId('');
                if (onVehicleChange) onVehicleChange('');
              }}
              className="text-xs text-gray-900 hover:text-[var(--color-dark-charcoal)] font-bold px-2.5 sm:px-3 py-1.5 bg-white hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {isAr ? 'تغيير السيارة' : 'Change Car'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: JOURNEY & VEHICLE SELECTION */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-3 sm:space-y-4 lg:space-y-3 xl:space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
          
          {/* Trip Type Selector */}
          <div className="bg-gray-50 border border-gray-200 p-1.5 rounded-xl flex gap-1 mb-1">
            {[
              { id: 'One Way', label: isAr ? 'اتجاه واحد' : 'One Way' },
              { id: 'Round Trip', label: isAr ? 'ذهاب وعودة' : 'Round Trip' },
              { id: 'Full Day', label: isAr ? 'يوم كامل' : 'Full Day' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTripType(type.id as any)}
                className={`flex-1 text-[11px] sm:text-xs md:text-sm font-bold py-2 md:py-2.5 rounded-lg transition-all ${
                  tripType === type.id 
                    ? 'bg-[var(--color-saudi-green)] text-white shadow-md' 
                    : 'text-[var(--color-dark-charcoal)] hover:bg-emerald-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Quick Popular Route Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                {isAr ? 'مسارات سريعة جاهزة:' : 'Quick Route Presets:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-gray-50 hover:bg-emerald-100 text-[var(--color-dark-charcoal)] border border-gray-300/70 transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup & Destination Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                    <MapPin size={13} className="text-[var(--color-saudi-green)]" />
                    {t('pickup_location')} *
                  </label>
                  {isPickupValid && touched.pickup && (
                    <span className="text-[10px] font-bold text-gray-600 flex items-center gap-0.5">
                      <CheckCircle2 size={12} /> {isAr ? 'مكتمل' : 'Valid'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    list="pickup-locations-list"
                    type="text"
                    required
                    value={pickup}
                    onBlur={() => setTouched(prev => ({ ...prev, pickup: true }))}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder={isAr ? 'مثال: مطار جدة (JED) أو فندقك' : 'e.g., Jeddah Airport (JED) or Hotel'} aria-label={t('pickup_location')}
                    className={`w-full bg-gray-50/40 border p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none transition-all ${
                      touched.pickup && !isPickupValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/20'
                        : isPickupValid && touched.pickup
                        ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                    }`}
                  />
                  <datalist id="pickup-locations-list">
                    {locations.map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>
                {touched.pickup && !isPickupValid && (
                  <span className="text-[10px] text-red-700 font-medium mt-1">{isAr ? 'يرجى إدخال موقع الانطلاق' : 'Please enter a pickup location'}</span>
                )}
              </div>

              {/* Destination */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                    <MapPin size={13} className="text-[var(--color-luxury-gold)]" />
                    {t('dropoff_location')} *
                  </label>
                  {isDestinationValid && touched.destination && (
                    <span className="text-[10px] font-bold text-gray-600 flex items-center gap-0.5">
                      <CheckCircle2 size={12} /> {isAr ? 'مكتمل' : 'Valid'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    ref={destinationInputRef}
                    id="booking-destination-input"
                    list="dropoff-locations-list"
                    type="text"
                    required
                    value={destination}
                    onBlur={() => setTouched(prev => ({ ...prev, destination: true }))}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={isAr ? 'مثال: فندق مكة / الحرم، أبراج الساعة' : 'e.g., Makkah Hotel / Haram, Clock Tower'}
                    className={`w-full bg-gray-50/40 border p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none transition-all ${
                      touched.destination && !isDestinationValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/20'
                        : isDestinationValid && touched.destination
                        ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                    }`}
                    aria-label={t('dropoff_location')}
                    aria-invalid={touched.destination && !isDestinationValid ? "true" : "false"}
                  />
                  <datalist id="dropoff-locations-list">
                    {locations.map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>
                {touched.destination && !isDestinationValid && (
                  <span className="text-[10px] text-red-700 font-medium mt-1">{isAr ? 'يرجى إدخال موقع الوصول' : 'Please enter a dropoff location'}</span>
                )}
              </div>
            </div>

          {/* Vehicle Fleet Selector (Shown if no vehicle is pre-selected, or can be changed) */}
          {!selectedVehicleObj && (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                  <Car size={13} className="text-[var(--color-saudi-green)]" />
                  {isAr ? 'اختر نوع وموديل السيارة *' : 'Select Vehicle Model *'}
                </label>
                {isVehicleValid && (
                  <span className="text-[10px] font-bold text-gray-600 flex items-center gap-0.5">
                    <CheckCircle2 size={12} /> {isAr ? 'تم الاختيار' : 'Selected'}
                  </span>
                )}
              </div>
              
              <select
                required
                value={vehicleId}
                onBlur={() => setTouched(prev => ({ ...prev, vehicleId: true }))}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  if (onVehicleChange) onVehicleChange(e.target.value);
                }}
                className={`w-full bg-gray-50/40 border p-2.5 rounded-xl text-xs md:text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none transition-all cursor-pointer ${
                  touched.vehicleId && !isVehicleValid
                    ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                    : isVehicleValid
                    ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                    : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                }`}
                aria-label={isAr ? 'اختر نوع وموديل السيارة' : 'Select Vehicle Model'}
                aria-invalid={touched.vehicleId && !isVehicleValid ? "true" : "false"}
              >
                <option value="">{isAr ? '-- اختر موديل السيارة من الأسطول --' : '-- Choose Vehicle Model --'}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({isAr ? `حد أقصى ${v.passengerCapacity} ركاب، ${v.luggageCapacity} حقائب` : `Max ${v.passengerCapacity} Pax, ${v.luggageCapacity} Bags`}) — {isAr ? `تبدأ من ${v.startingPrice} ريال` : `From ${v.startingPrice} SAR`}
                  </option>
                ))}
              </select>

              
            </div>
          )}

          {/* Date, Time, Passengers & Luggage Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Travel Date */}
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                  <Calendar size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                  <span>{t('travel_date')} *</span>
                </label>
                {isDateValid && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded shrink-0">
                    ✓
                  </span>
                )}
              </div>
              <input
                required
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onBlur={() => setTouched(prev => ({ ...prev, date: true }))}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full min-w-0 bg-gray-50/40 border p-2.5 rounded-xl text-sm font-medium text-[var(--color-dark-charcoal)] outline-none appearance-none ${
                  touched.date && !isDateValid ? 'border-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                }`}
                aria-label={t('travel_date')}
                aria-invalid={touched.date && !isDateValid ? "true" : "false"}
              />
            </div>

            {/* Pickup Time */}
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                  <Clock size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                  <span>{t('pickup_time')} *</span>
                </label>
                {isTimeValid && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded shrink-0 whitespace-nowrap">
                    ✓ {time}
                  </span>
                )}
              </div>
              <input
                required
                type="time"
                value={time}
                onBlur={() => setTouched(prev => ({ ...prev, time: true }))}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full min-w-0 bg-gray-50/40 border p-2.5 rounded-xl text-sm font-medium text-[var(--color-dark-charcoal)] outline-none appearance-none ${
                  touched.time && !isTimeValid ? 'border-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                }`}
                aria-label={t('pickup_time')}
                aria-invalid={touched.time && !isTimeValid ? "true" : "false"}
              />
            </div>

            {/* Passengers */}
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                  <Users size={12} className="text-[var(--color-luxury-gold)] shrink-0" />
                  <span>{t('passengers')} *</span>
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <input
                  required
                  type="number"
                  min="0"
                  max="50"
                  value={passengers}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassengers(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full min-w-0 bg-gray-50/40 border p-2.5 rounded-xl text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none appearance-none transition-all ${
                    (isOverCapacity || isZeroPax) ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
                  }`}
                  aria-label={t('passengers')}
                />
                {isZeroPax && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-100 flex items-start gap-1 leading-tight mt-1">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {isAr ? 'مطلوب راكب واحد على الأقل' : 'At least 1 passenger is required'}
                  </span>
                )}
                {isOverCapacity && selectedVehicleObj && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-100 flex items-start gap-1 leading-tight mt-1">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {isAr ? `الحد الأقصى ${selectedVehicleObj.passengerCapacity} ركاب لسيارة ${selectedVehicleObj.name}` : `Limit: ${selectedVehicleObj.passengerCapacity} pax for ${selectedVehicleObj.name}`}
                  </span>
                )}
              </div>
            </div>

            {/* Luggage */}
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] uppercase font-bold text-gray-900 flex items-center gap-1">
                  <Briefcase size={12} className="text-[var(--color-luxury-gold)] shrink-0" />
                  <span>{t('luggage')}</span>
                </label>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={luggage}
                onChange={(e) => {
                  const val = e.target.value;
                  setLuggage(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="w-full min-w-0 bg-gray-50/40 border border-gray-300 p-2.5 rounded-xl text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none appearance-none focus:ring-1 focus:ring-[var(--color-luxury-gold)]"
                aria-label={t('luggage')}
              />
            </div>
          </div>

          {/* Submit Button to Step 2 */}
          <button
            type="submit"
            className="w-full bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>{t('proceed_guest_details')}</span>
            <ArrowRight size={16} className="rtl:rotate-180" />
          </button>
        </form>
      )}

      {/* STEP 2: GUEST DETAILS & DISPATCH */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-300">
          <div className="bg-gray-50/50 border border-gray-300 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
              <span className="text-sm font-bold text-[var(--color-dark-charcoal)] uppercase">{isAr ? 'ملخص مسار الرحلة' : 'Journey Overview'}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[var(--color-saudi-green)] font-bold hover:underline cursor-pointer"
              >
                {t('back_to_journey')}
              </button>
            </div>
            <div className="text-xs text-[var(--color-dark-charcoal)]/80 space-y-1">
              <p><strong>{isAr ? 'المسار:' : 'Route:'}</strong> {pickup} ➔ {destination}</p>
              <p><strong>{isAr ? 'الموعد:' : 'When:'}</strong> {date} {isAr ? 'في تمام' : 'at'} {time}</p>
              <p><strong>{isAr ? 'السيارة:' : 'Vehicle:'}</strong> {selectedVehicleObj?.name || 'VIP Vehicle'} ({passengers} {t('pass')}, {luggage} {t('luggage_short')})</p>
              <p className="text-[var(--color-saudi-green)] font-extrabold text-sm pt-1">
                <strong>{isAr ? 'السعر التقديري:' : 'Fare:'}</strong> {priceCalculation.rangeFormatted}
              </p>
            </div>
          </div>

          {/* Guest Name */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-900 mb-1 flex items-center gap-1">
              <User size={12} className="text-[var(--color-saudi-green)]" />
              {t('guest_name')} *
            </label>
            <input
              required
              type="text"
              value={customerName}
              onBlur={() => setTouched(prev => ({ ...prev, customerName: true }))}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('guest_name_placeholder')}
              className={`w-full bg-gray-50/40 border p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none ${
                touched.customerName && !isNameValid ? 'border-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
              }`}
              aria-label={t('guest_name')}
              aria-invalid={touched.customerName && !isNameValid ? "true" : "false"}
            />
          </div>

          {/* WhatsApp / Phone */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-900 mb-1 flex items-center gap-1">
              <Phone size={12} className="text-[var(--color-saudi-green)]" />
              {t('phone_whatsapp')} *
            </label>
            <input
              required
              type="tel"
              value={phone}
              onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phone_placeholder')}
              className={`w-full bg-gray-50/40 border p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none ${
                touched.phone && !isPhoneValid ? 'border-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
              }`}
              aria-label={t('phone_whatsapp')}
              aria-invalid={touched.phone && !isPhoneValid ? "true" : "false"}
            />
            <span className="text-[10px] text-gray-700 mt-1">
              {isAr ? 'سيصلك تأكيد الحجز ورقم السائق عبر هذا الرقم على الواتساب' : 'Driver details and live tracking link will be sent to this WhatsApp number'}
            </span>
          </div>

          {/* Email (Optional) */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-900 mb-1 flex items-center gap-1">
              <Mail size={12} className="text-[var(--color-luxury-gold)]" />
              {t('email_optional')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full bg-gray-50/40 border border-gray-300 p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none focus:ring-1 focus:ring-[var(--color-luxury-gold)]"
              aria-label={t('email_optional')}
            />
          </div>

          {/* Special Requests / Flight Number */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-900 mb-1 flex items-center gap-1">
              <FileText size={12} className="text-[var(--color-luxury-gold)]" />
              {t('special_request')}
            </label>
            <textarea
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder={t('special_request_placeholder')}
              className="w-full bg-gray-50/40 border border-gray-300 p-2.5 rounded-xl text-xs md:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none focus:ring-1 focus:ring-[var(--color-luxury-gold)] resize-none"
              aria-label={t('special_request')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'رجوع' : 'Back'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>{isAr ? 'جاري تجهيز الحجز...' : 'Processing Dispatch...'}</span>
              ) : (
                <>
                  <span>{t('confirm_booking')}</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
