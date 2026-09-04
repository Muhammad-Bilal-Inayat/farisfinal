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
  ShieldCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useBookingTracker } from '../context/BookingTrackerContext';
import { getVehicleImageByName } from '../utils/imageUtils';

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
  const { openTracker, vehicleVersion } = useBookingTracker();
  const [searchParams] = useSearchParams();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
  const [tripType, setTripType] = useState<'One Way' | 'Round Trip' | 'Full Day'>(() => {
    return (localStorage.getItem('faris_booking_tripType') as any) || 'One Way';
  });
  const [pickup, setPickup] = useState(() => localStorage.getItem('faris_booking_pickup') || '');
  const [destination, setDestination] = useState(() => localStorage.getItem('faris_booking_destination') || '');
  const [date, setDate] = useState(() => localStorage.getItem('faris_booking_date') || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => localStorage.getItem('faris_booking_time') || '');
  const [passengers, setPassengers] = useState<number | ''>(() => {
    const saved = localStorage.getItem('faris_booking_passengers');
    return saved !== null ? Number(saved) : 2;
  });
  const [luggage, setLuggage] = useState<number | ''>(() => {
    const saved = localStorage.getItem('faris_booking_luggage');
    return saved !== null ? Number(saved) : 2;
  });
  const [vehicleId, setVehicleId] = useState(() => localStorage.getItem('faris_booking_vehicleId') || '');
  
  // Step Management
  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem('faris_booking_step');
    return saved !== null ? Number(saved) : 1;
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Contact Details
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('faris_booking_name') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('faris_booking_phone') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('faris_booking_email') || '');
  const [specialRequest, setSpecialRequest] = useState(() => localStorage.getItem('faris_booking_special') || '');

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('faris_booking_tripType', tripType);
    localStorage.setItem('faris_booking_pickup', pickup);
    localStorage.setItem('faris_booking_destination', destination);
    localStorage.setItem('faris_booking_date', date);
    localStorage.setItem('faris_booking_time', time);
    localStorage.setItem('faris_booking_passengers', String(passengers));
    localStorage.setItem('faris_booking_luggage', String(luggage));
    localStorage.setItem('faris_booking_vehicleId', vehicleId);
    localStorage.setItem('faris_booking_step', String(step));
    localStorage.setItem('faris_booking_name', customerName);
    localStorage.setItem('faris_booking_phone', phone);
    localStorage.setItem('faris_booking_email', email);
    localStorage.setItem('faris_booking_special', specialRequest);
  }, [tripType, pickup, destination, date, time, passengers, luggage, vehicleId, step, customerName, phone, email, specialRequest]);

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
  }, [searchParams, vehicleVersion]);

  // Car image helper
  const getCarImage = (name: string) => {
    return getVehicleImageByName(name);
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
  const maxLuggage = selectedVehicleObj ? selectedVehicleObj.luggageCapacity : 50;
  const isLuggageOverCapacity = selectedVehicleObj ? Number(luggage) > selectedVehicleObj.luggageCapacity : false;

  const isStep1Valid = isPickupValid && isDestinationValid && isVehicleValid && isDateValid && isTimeValid && isPaxValid && !isOverCapacity && !isLuggageOverCapacity;

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

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Clear saved booking persistence upon successful submission
        [
          'faris_booking_tripType', 'faris_booking_pickup', 'faris_booking_destination',
          'faris_booking_date', 'faris_booking_time', 'faris_booking_passengers',
          'faris_booking_luggage', 'faris_booking_vehicleId', 'faris_booking_step',
          'faris_booking_name', 'faris_booking_phone', 'faris_booking_email', 'faris_booking_special'
        ].forEach(k => localStorage.removeItem(k));

        setSuccess({
          id: data.bookingId,
          price: priceCalculation.base,
          minPrice: priceCalculation.min,
          maxPrice: priceCalculation.max
        });
      } else {
        alert(data.error || (isAr ? 'فشل تسجيل الحجز' : 'Failed to save booking'));
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      alert(isAr ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Server connection error');
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-3">
          <button
            type="button"
            onClick={() => openTracker(success.id)}
            className="w-full bg-[#05513F] hover:bg-emerald-800 text-white py-3.5 px-5 rounded-xl font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Search size={17} className="text-amber-300" />
            <span>{isAr ? 'تتبع حالة هذا الحجز فوراً' : 'Track This Booking Status Now'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <a 
            href={`https://wa.me/${phoneNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Phone size={18} /> {isAr ? 'تأكيد الحجز عبر واتساب' : 'Confirm via WhatsApp'}
          </a>

          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setStep(1);
            }}
            className="w-full sm:w-auto px-4 py-3.5 bg-white hover:bg-gray-50 text-[var(--color-dark-charcoal)] border border-gray-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="mb-2.5 sm:mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
              step >= 1 ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > 1 ? <Check size={11} strokeWidth={3} /> : '1'}
            </div>
            <div>
              <span className={`text-[11px] sm:text-xs font-bold block leading-tight ${step === 1 ? 'text-[var(--color-dark-charcoal)]' : 'text-gray-500'}`}>
                {isAr ? '١. تفاصيل الرحلة' : '1. Route & Time'}
              </span>
            </div>
          </div>

          <div className="h-[2px] flex-1 mx-2 sm:mx-3 bg-slate-200 relative rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-saudi-green)] transition-all duration-300 rounded-full" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
              step >= 2 ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}>
              2
            </div>
            <div>
              <span className={`text-[11px] sm:text-xs font-bold block leading-tight ${step === 2 ? 'text-[var(--color-dark-charcoal)]' : 'text-gray-500'}`}>
                {isAr ? '٢. بيانات الضيف' : '2. Guest Info'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SELECTED CAR SHOWCASE BANNER (When a vehicle is already picked or preselected) */}
      {selectedVehicleObj && (
        <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-emerald-100/50 border border-emerald-300 rounded-xl p-2.5 sm:p-3 mb-2.5 sm:mb-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-12 sm:w-14 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                <ResponsiveImage src={getVehicleImageByName(selectedVehicleObj.name, selectedVehicleObj.imageUrl)} alt={selectedVehicleObj.name} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[var(--color-saudi-green)] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-sm flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 size={10} /> {isAr ? 'مختارة' : 'Selected'}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-[var(--color-dark-charcoal)] truncate">
                    {selectedVehicleObj.name}
                  </h3>
                </div>
                <p className="text-[10px] text-gray-600 font-semibold truncate mt-0.5">
                  {selectedVehicleObj.passengerCapacity} {t('pass')} • {selectedVehicleObj.luggageCapacity} {t('luggage_short')} • {isAr ? `تبدأ من ${selectedVehicleObj.startingPrice} ريال` : `From ${selectedVehicleObj.startingPrice} SAR`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setVehicleId('');
                if (onVehicleChange) onVehicleChange('');
              }}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold px-2 py-1 bg-white hover:bg-emerald-100/80 rounded-lg border border-emerald-300 transition-colors shrink-0 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              {isAr ? 'تغيير' : 'Change'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: JOURNEY & VEHICLE SELECTION */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-2.5 sm:space-y-3 animate-in fade-in duration-200">
          
          {/* Trip Type Selector */}
          <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl flex gap-1">
            {[
              { id: 'One Way', label: isAr ? 'اتجاه واحد' : 'One Way' },
              { id: 'Round Trip', label: isAr ? 'ذهاب وعودة' : 'Round Trip' },
              { id: 'Full Day', label: isAr ? 'يوم كامل' : 'Full Day' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setTripType(type.id as any)}
                className={`flex-1 text-xs sm:text-xs font-bold py-1.5 sm:py-2 rounded-lg transition-all ${
                  tripType === type.id 
                    ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Quick Popular Route Chips - Horizontal Scroll on Mobile */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                {isAr ? 'مسارات شائعة سريعة:' : 'Popular Routes:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5">
              {popularPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100/90 hover:bg-emerald-100/80 text-slate-800 hover:text-emerald-900 border border-slate-200/90 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup & Destination Inputs with Quick Swap */}
          <div className="relative bg-slate-50/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 relative">
              {/* Pickup */}
              <div className="flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] uppercase font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-saudi-green)] ring-2 ring-emerald-100 shrink-0" />
                    <span className="truncate">{t('pickup_location')} *</span>
                  </label>
                  {isPickupValid && touched.pickup && (
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> {isAr ? 'مكتمل' : 'Valid'}
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
                    placeholder={isAr ? 'مثال: مطار جدة (JED) أو فندقك' : 'e.g., Jeddah Airport (JED) or Hotel'}
                    aria-label={t('pickup_location')}
                    className={`w-full bg-white border px-3 py-2 sm:py-1.5 min-h-[38px] rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none transition-all ${
                      touched.pickup && !isPickupValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/20'
                        : isPickupValid && touched.pickup
                        ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'border-slate-200 focus:ring-1 focus:ring-[var(--color-saudi-green)] focus:border-[var(--color-saudi-green)]'
                    }`}
                  />
                  <datalist id="pickup-locations-list">
                    {locations.map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>
                {touched.pickup && !isPickupValid && (
                  <span className="text-[10px] text-red-600 font-medium mt-0.5">{isAr ? 'يرجى إدخال موقع الانطلاق' : 'Please enter pickup location'}</span>
                )}
              </div>

              {/* Destination */}
              <div className="flex flex-col min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] uppercase font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-luxury-gold)] ring-2 ring-amber-100 shrink-0" />
                    <span className="truncate">{t('dropoff_location')} *</span>
                  </label>
                  {isDestinationValid && touched.destination && (
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> {isAr ? 'مكتمل' : 'Valid'}
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
                    className={`w-full bg-white border px-3 py-2 sm:py-1.5 min-h-[38px] rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none transition-all ${
                      touched.destination && !isDestinationValid
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/20'
                        : isDestinationValid && touched.destination
                        ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'border-slate-200 focus:ring-1 focus:ring-[var(--color-saudi-green)] focus:border-[var(--color-saudi-green)]'
                    }`}
                    aria-label={t('dropoff_location')}
                  />
                  <datalist id="dropoff-locations-list">
                    {locations.map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>
                {touched.destination && !isDestinationValid && (
                  <span className="text-[10px] text-red-600 font-medium mt-0.5">{isAr ? 'يرجى إدخال موقع الوصول' : 'Please enter dropoff location'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Fleet Selector (Always Visible) */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[11px] uppercase font-bold text-gray-800 flex items-center gap-1">
                <Car size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                <span>{isAr ? 'اختر نوع وموديل السيارة *' : 'Select Vehicle Model *'}</span>
              </label>
              {isVehicleValid && (
                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle2 size={10} /> {isAr ? 'تم الاختيار' : 'Selected'}
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
              className={`w-full bg-slate-50/70 border px-3 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none transition-all cursor-pointer ${
                touched.vehicleId && !isVehicleValid
                  ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
                  : isVehicleValid
                  ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                  : 'border-slate-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)] focus:border-[var(--color-luxury-gold)]'
              }`}
              aria-label={isAr ? 'اختر نوع وموديل السيارة' : 'Select Vehicle Model'}
            >
              <option value="">{isAr ? '-- اختر موديل السيارة من الأسطول --' : '-- Choose Vehicle Model --'}</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.passengerCapacity} {t('pass')}, {v.luggageCapacity} {t('luggage_short')}) — {isAr ? `تبدأ من ${v.startingPrice} ريال` : `From ${v.startingPrice} SAR`}
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time, Passengers & Luggage Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {/* Travel Date */}
            <div className="flex flex-col min-w-0">
              <label className="text-[11px] uppercase font-bold text-gray-800 mb-1 flex items-center gap-1 truncate">
                <Calendar size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                <span>{t('travel_date')} *</span>
              </label>
              <input
                required
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onBlur={() => setTouched(prev => ({ ...prev, date: true }))}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full min-w-0 bg-slate-50/80 border px-2.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none ${
                  touched.date && !isDateValid ? 'border-rose-400' : 'border-slate-300 focus:ring-1 focus:ring-[var(--color-saudi-green)]'
                }`}
                aria-label={t('travel_date')}
              />
            </div>

            {/* Pickup Time */}
            <div className="flex flex-col min-w-0">
              <label className="text-[11px] uppercase font-bold text-gray-800 mb-1 flex items-center gap-1 truncate">
                <Clock size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                <span>{t('pickup_time')} *</span>
              </label>
              <input
                required
                type="time"
                value={time}
                onBlur={() => setTouched(prev => ({ ...prev, time: true }))}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full min-w-0 bg-slate-50/80 border px-2.5 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-dark-charcoal)] outline-none ${
                  touched.time && !isTimeValid ? 'border-rose-400' : 'border-slate-300 focus:ring-1 focus:ring-[var(--color-saudi-green)]'
                }`}
                aria-label={t('pickup_time')}
              />
            </div>

            {/* Passengers with Stepper */}
            <div className="flex flex-col min-w-0">
              <label className="text-[11px] uppercase font-bold text-gray-800 mb-1 flex items-center gap-1 truncate">
                <Users size={12} className="text-[var(--color-luxury-gold)] shrink-0" />
                <span>{t('passengers')} *</span>
              </label>
              <div className={`flex items-center border rounded-xl bg-slate-50/80 overflow-hidden min-h-[40px] ${
                (isOverCapacity || isZeroPax) ? 'border-rose-400' : 'border-slate-300 focus-within:border-[var(--color-saudi-green)]'
              }`}>
                <button
                  type="button"
                  onClick={() => setPassengers(prev => Math.max(1, (Number(prev) || 1) - 1))}
                  className="w-9 sm:w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-slate-200 active:bg-slate-300 font-black text-base select-none shrink-0 cursor-pointer"
                  aria-label="Decrease passengers"
                >
                  −
                </button>
                <input
                  required
                  type="number"
                  min="1"
                  max="50"
                  value={passengers}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassengers(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  className="w-full text-center bg-transparent py-1 text-xs sm:text-sm font-black text-[var(--color-dark-charcoal)] outline-none"
                  aria-label={t('passengers')}
                />
                <button
                  type="button"
                  onClick={() => setPassengers(prev => Math.min(50, (Number(prev) || 0) + 1))}
                  className="w-9 sm:w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-slate-200 active:bg-slate-300 font-black text-base select-none shrink-0 cursor-pointer"
                  aria-label="Increase passengers"
                >
                  +
                </button>
              </div>
            </div>

            {/* Luggage with Stepper */}
            <div className="flex flex-col min-w-0">
              <label className="text-[11px] uppercase font-bold text-gray-800 mb-1 flex items-center gap-1 truncate">
                <Briefcase size={12} className="text-[var(--color-luxury-gold)] shrink-0" />
                <span>{t('luggage')}</span>
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50/80 overflow-hidden min-h-[40px] focus-within:border-[var(--color-saudi-green)]">
                <button
                  type="button"
                  onClick={() => setLuggage(prev => Math.max(0, (Number(prev) || 0) - 1))}
                  className="w-9 sm:w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-slate-200 active:bg-slate-300 font-black text-base select-none shrink-0 cursor-pointer"
                  aria-label="Decrease luggage"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max={maxLuggage}
                  value={luggage}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setLuggage('');
                    else setLuggage(Math.min(maxLuggage, Math.max(0, parseInt(val, 10) || 0)));
                  }}
                  className="w-full text-center bg-transparent py-1 text-xs sm:text-sm font-black text-[var(--color-dark-charcoal)] outline-none"
                  aria-label={t('luggage')}
                />
                <button
                  type="button"
                  onClick={() => setLuggage(prev => Math.min(maxLuggage, (Number(prev) || 0) + 1))}
                  className="w-9 sm:w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-slate-200 active:bg-slate-300 font-black text-base select-none shrink-0 cursor-pointer"
                  aria-label="Increase luggage"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          {isOverCapacity && selectedVehicleObj && (
            <div className="text-[10px] font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5 leading-tight mb-2">
              <AlertCircle size={13} className="shrink-0" />
              <span>{isAr ? `الحد الأقصى ${selectedVehicleObj.passengerCapacity} ركاب لسيارة ${selectedVehicleObj.name}` : `Limit: ${selectedVehicleObj.passengerCapacity} pax for ${selectedVehicleObj.name}`}</span>
            </div>
          )}

          {isLuggageOverCapacity && selectedVehicleObj && (
            <div className="text-[10px] font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5 leading-tight">
              <AlertCircle size={13} className="shrink-0" />
              <span>{isAr ? `الحد الأقصى للأمتعة ${selectedVehicleObj.luggageCapacity} حقائب لسيارة ${selectedVehicleObj.name}` : `Max luggage limit: ${selectedVehicleObj.luggageCapacity} bags for ${selectedVehicleObj.name}`}</span>
            </div>
          )}

          {/* Live Estimated Price Bar in Step 1 */}
          {priceCalculation.isMatched && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/70 border border-emerald-200/90 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[var(--color-saudi-green)]" />
                <div>
                  <span className="text-[11px] font-bold text-emerald-950 block leading-tight">
                    {isAr ? 'السعر التقديري المباشر:' : 'Estimated Fare:'}
                  </span>
                  <span className="text-[9px] text-emerald-800/80 hidden sm:block">
                    {isAr ? 'شامل الوقود، رسوم الطرق والاستقبال' : 'Includes fuel, tolls & greeting'}
                  </span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-[var(--color-saudi-green)] whitespace-nowrap">
                {priceCalculation.rangeFormatted}
              </span>
            </div>
          )}

          {/* Submit Button to Step 2 */}
          <div className="flex">
            <button
              type="submit"
              className="w-full bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white min-h-[44px] sm:min-h-[48px] py-2.5 sm:py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{t('proceed_guest_details')}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: GUEST DETAILS & DISPATCH */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="space-y-2.5 sm:space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-2.5 sm:p-3">
            <div className="flex justify-between items-center border-b border-slate-200/90 pb-1.5 mb-1.5">
              <span className="text-[11px] font-bold text-[var(--color-dark-charcoal)] uppercase tracking-wider">{isAr ? 'ملخص مسار الرحلة' : 'Journey Overview'}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-[var(--color-saudi-green)] font-bold hover:underline cursor-pointer"
              >
                {t('back_to_journey')}
              </button>
            </div>
            <div className="text-xs text-[var(--color-dark-charcoal)]/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{isAr ? 'المسار:' : 'Route:'}</span>
                <span className="font-bold text-right rtl:text-left truncate max-w-[210px]">{pickup} ➔ {destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{isAr ? 'الموعد:' : 'When:'}</span>
                <span className="font-semibold">{date} {time ? `(${time})` : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{isAr ? 'السيارة:' : 'Vehicle:'}</span>
                <span className="font-semibold truncate max-w-[210px]">{selectedVehicleObj?.name || 'VIP Car'} • {passengers} {t('pass')}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/90">
                <span className="font-bold text-gray-800">{isAr ? 'السعر التقديري:' : 'Fare:'}</span>
                <span className="text-xs sm:text-sm font-black text-[var(--color-saudi-green)]">{priceCalculation.rangeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Guest Name */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-800 mb-0.5 flex items-center gap-1">
              <User size={11} className="text-[var(--color-saudi-green)]" />
              <span>{t('guest_name')} *</span>
            </label>
            <input
              required
              type="text"
              value={customerName}
              onBlur={() => setTouched(prev => ({ ...prev, customerName: true }))}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('guest_name_placeholder')}
              className={`w-full bg-slate-50/70 border px-3 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none ${
                touched.customerName && !isNameValid ? 'border-rose-400' : 'border-slate-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
              }`}
              aria-label={t('guest_name')}
            />
          </div>

          {/* WhatsApp / Phone */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-800 mb-0.5 flex items-center gap-1">
              <Phone size={11} className="text-[var(--color-saudi-green)]" />
              <span>{t('phone_whatsapp')} *</span>
            </label>
            <input
              required
              type="tel"
              value={phone}
              onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phone_placeholder')}
              className={`w-full bg-slate-50/70 border px-3 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none ${
                touched.phone && !isPhoneValid ? 'border-rose-400' : 'border-slate-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'
              }`}
              aria-label={t('phone_whatsapp')}
            />
            <span className="text-[9px] text-gray-600 mt-0.5">
              {isAr ? 'سيصلك تأكيد الحجز ورقم السائق عبر هذا الرقم على الواتساب' : 'Driver details will be dispatched to this WhatsApp number'}
            </span>
          </div>

          {/* Email (Optional) */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-800 mb-0.5 flex items-center gap-1">
              <Mail size={11} className="text-[var(--color-luxury-gold)]" />
              <span>{t('email_optional')}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email_placeholder')}
              className="w-full bg-slate-50/70 border border-slate-300 px-3 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none focus:ring-1 focus:ring-[var(--color-luxury-gold)]"
              aria-label={t('email_optional')}
            />
          </div>

          {/* Special Requests / Flight Number */}
          <div className="flex flex-col">
            <label className="text-[11px] uppercase font-bold text-gray-800 mb-0.5 flex items-center gap-1">
              <FileText size={11} className="text-[var(--color-luxury-gold)]" />
              <span>{t('special_request')}</span>
            </label>
            <textarea
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder={t('special_request_placeholder')}
              className="w-full bg-slate-50/70 border border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[var(--color-dark-charcoal)] outline-none focus:ring-1 focus:ring-[var(--color-luxury-gold)] resize-none"
              aria-label={t('special_request')}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3.5 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'رجوع' : 'Back'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white py-2.5 sm:py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>{isAr ? 'جاري التجهيز...' : 'Processing...'}</span>
              ) : (
                <>
                  <span>{t('confirm_booking')}</span>
                  <CheckCircle2 size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
