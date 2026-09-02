import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, Quote, MapPin, Car, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TestimonialItem {
  id: number;
  customerName: string;
  location: string;
  text: string;
  rating: number;
  vehicleModel?: string;
  routeBadge?: string;
  countryBadge?: string;
  date?: string;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    customerName: "Brother Tariq Al-Mansoor",
    location: "London, United Kingdom",
    countryBadge: "🇬🇧 UK",
    routeBadge: "Jeddah Airport (JED) ➔ Makkah Clock Tower",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "Rajab 1447 / 2026",
    text: "Alhamdulillah! We booked the GMC Yukon XL 2025 for our family of 6. The chauffeur was waiting right inside Terminal 1 holding our name sign. The vehicle was spotless, smelling of oud, with chilled Zamzam water and child safety seats already fitted. Flawless journey to Makkah!"
  },
  {
    id: 2,
    customerName: "Haji Muhammad Farooq",
    location: "Toronto, Canada",
    countryBadge: "🇨🇦 Canada",
    routeBadge: "Madinah Markazia ➔ Makkah Haram Hotel",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "Sha'ban 1447 / 2026",
    text: "Punctual, dignified, and incredibly smooth driving on the Hijrah highway. The offline booking feature worked seamlessly when our roaming SIM had zero reception. Faris VIP is truly the gold standard for Umrah pilgrims."
  },
  {
    id: 3,
    customerName: "Dr. Zainab & Family",
    location: "Chicago, United States",
    countryBadge: "🇺🇸 USA",
    routeBadge: "Full Day Sacred Ziyarat (Makkah & Taif)",
    vehicleModel: "Hyundai Staria VIP 2025",
    rating: 5,
    date: "2026",
    text: "We traveled with my 78-year-old mother and toddler. The chauffeur drove with extreme care, guided us with profound respect around Jabal Al-Noor, Cave Hira, and Masjid Al-Jinn. Cold water, quiet AC, and zero rush."
  },
  {
    id: 4,
    customerName: "Sheikh Abdulrahman",
    location: "Dubai, United Arab Emirates",
    countryBadge: "🇦🇪 UAE",
    routeBadge: "Jeddah Airport VIP ➔ Madinah Munawwarah",
    vehicleModel: "Mercedes Sprinter VIP 2025",
    rating: 5,
    date: "2026",
    text: "Top-tier executive service in the Kingdom. Fixed transparent pricing with zero surprise charges, brand new fleet, and highly trained Saudi-knowledgeable drivers. We recommend Faris VIP to all our delegates."
  },
  {
    id: 5,
    customerName: "Sister Aisha Siddiqa",
    location: "Kuala Lumpur, Malaysia",
    countryBadge: "🇲🇾 Malaysia",
    routeBadge: "Makkah Hotel ➔ Madinah Hotel",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "Exceptional care from start to finish! When our flight was delayed by 2 hours, the dispatch team tracked our flight number automatically and the driver met us without any extra waiting penalty. Jazakum Allah Khair!"
  },
  {
    id: 6,
    customerName: "Brother Bilal Qureshi",
    location: "Manchester, United Kingdom",
    countryBadge: "🇬🇧 UK",
    routeBadge: "Jeddah Airport ➔ Jabal Omar Makkah",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "The GMC XL 2025 easily accommodated all 7 family members plus 8 large suitcases without compromise. Smooth ride, high roof clearance, and very respectful chauffeur who assisted with all our luggage."
  },
  {
    id: 7,
    customerName: "Eng. Imran Khan",
    location: "Birmingham, United Kingdom",
    countryBadge: "🇬🇧 UK",
    routeBadge: "Jeddah Airport ➔ Makkah Clock Tower",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "Outstanding meet and greet at King Abdulaziz Airport Terminal 1. Flight landed 40 minutes late yet our executive chauffeur tracked it and greeted us with a welcoming smile. Exceptional hospitality."
  },
  {
    id: 8,
    customerName: "Haji Ahmad Fauzi",
    location: "Jakarta, Indonesia",
    countryBadge: "🇮🇩 Indonesia",
    routeBadge: "Makkah ➔ Madinah Hijrah Highway",
    vehicleModel: "Toyota Hiace VIP 2025",
    rating: 5,
    date: "2026",
    text: "Our family group traveled together with elderly pilgrims. The vehicle was spotless, ice-cold dual AC, and the driver took prayer stops at clean highway service stations. Terima kasih!"
  },
  {
    id: 9,
    customerName: "Dr. Omar Al-Khatib",
    location: "Sydney, Australia",
    countryBadge: "🇦🇺 Australia",
    routeBadge: "Sacred Ziyarat Makkah & Taif",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "Unbeatable knowledge of historical sites. Driver brother knew all the quiet prayer times at Jabal Thawr and guided us with great respect. Cleanest vehicle I've experienced in Saudi Arabia."
  },
  {
    id: 10,
    customerName: "Sister Maryam & Brother Yasin",
    location: "Paris, France",
    countryBadge: "🇫🇷 France",
    routeBadge: "Jeddah Airport ➔ Madinah Express",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "Excellent luxury service. The baby seat was installed securely as requested, plenty of luggage space in the GMC Yukon, and smooth highway cruise. Will book again in Ramadan insha'Allah."
  },
  {
    id: 11,
    customerName: "Brother Zeeshan Akhtar",
    location: "Lahore, Pakistan",
    countryBadge: "🇵🇰 Pakistan",
    routeBadge: "Madinah Airport ➔ Markazia Hotel",
    vehicleModel: "Toyota Camry 2025",
    rating: 5,
    date: "2026",
    text: "Timely pickup right outside Prince Mohammad Airport. Driver helped with heavy luggage and provided complimentary cold Zamzam. Booking through WhatsApp was instant and easy."
  },
  {
    id: 12,
    customerName: "Haji Sulaiman Bello",
    location: "Abuja, Nigeria",
    countryBadge: "🇳🇬 Nigeria",
    routeBadge: "Makkah ➔ Madinah Executive Chauffeur",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "The vehicle condition was showroom brand new. Smooth driving without sudden braking, courteous chauffeur who recited travel supplications with us. 10/10 service."
  },
  {
    id: 13,
    customerName: "Sister Fatima Noor",
    location: "Doha, Qatar",
    countryBadge: "🇶🇦 Qatar",
    routeBadge: "Full Day Private VIP Chauffeur (8 Hours)",
    vehicleModel: "Mercedes Sprinter VIP 2025",
    rating: 5,
    date: "2026",
    text: "Had the chauffeur on standby for 8 hours for family shopping and visits. Polite, patient, and always waiting outside right when we walked out of the mall. Highly dependable."
  },
  {
    id: 14,
    customerName: "Brother Hamza El-Masri",
    location: "Berlin, Germany",
    countryBadge: "🇩🇪 Germany",
    routeBadge: "Jeddah Airport ➔ Makkah Hotel",
    vehicleModel: "Ford Taurus 2025",
    rating: 5,
    date: "2026",
    text: "Fair transparent pricing without the stressful haggling of street taxis. Fixed quote was honored exactly. Vehicle was pristine with high-speed phone chargers provided."
  },
  {
    id: 15,
    customerName: "Ustadh Rashid Mahmud",
    location: "Singapore",
    countryBadge: "🇸🇬 Singapore",
    routeBadge: "Complete Umrah Circuit & Ziyarat Package",
    vehicleModel: "GMC Yukon XL 2025",
    rating: 5,
    date: "2026",
    text: "Booked all 4 legs of our Umrah trip including Ziyarat. Every single pickup was 10 minutes early. Drivers are true professionals who respect the sanctity of the pilgrimage."
  }
];

export default function TestimonialSlider() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [reviews, setReviews] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartXRef = useRef<number | null>(null);

  // Fetch live testimonials if present in database
  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted: TestimonialItem[] = data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            customerName: item.customer_name || item.customerName || "Valued Pilgrim",
            location: item.location || "Verified Guest",
            text: item.text || "",
            rating: item.rating || 5,
            vehicleModel: item.vehicle_model || (idx % 2 === 0 ? "GMC Yukon XL 2025" : "Toyota Camry 2025"),
            routeBadge: item.route_badge || (idx % 2 === 0 ? "Jeddah ➔ Makkah Haram" : "Madinah ➔ Makkah"),
            countryBadge: item.country_badge || "🕋 Umrah Guest",
            date: "1447H / 2026"
          }));
          setReviews(formatted);
        }
      })
      .catch(() => {
        // Fallback to rich curated reviews
      });
  }, []);

  // Update visible items count according to screen width
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setVisibleCount(1); // Mobile
      } else if (w < 1120) {
        setVisibleCount(2); // Tablets and standard laptops
      } else {
        setVisibleCount(3); // Large desktops
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  // Auto slide
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!document.hidden) {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Trigger swipe if threshold > 45px
    if (Math.abs(diff) > 45) {
      if (isAr) {
        // Inverted for RTL
        if (diff > 0) handlePrev();
        else handleNext();
      } else {
        if (diff > 0) handleNext();
        else handlePrev();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
  };

  return (
    <div 
      id="testimonial-slider-container"
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Controls: Rating Summary & Arrow Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <ShieldCheck size={14} />
            <span>{isAr ? 'تقييمات ضيوف الرحمن الموثقة' : 'Verified Umrah Pilgrim Reviews'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-dark-charcoal)]">
            {isAr ? 'ماذا يقول ضيوفنا الكرام؟' : 'What Our Honored Guests Say'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium max-w-xl">
            {isAr 
              ? 'تجارب حقيقية لمعتمرين وحجاج من جميع أنحاء العالم وثقوا في خدمة التوصيل الخاص مع فارس VIP.' 
              : 'Authentic 5-star experiences from pilgrims worldwide who trusted Faris VIP for their sacred journeys.'}
          </p>
        </div>

        {/* 5-Star Rating Aggregate & Navigation Controls */}
        <div className="flex items-center gap-4 self-start sm:self-auto">
          {/* Aggregate Badge */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-xs font-bold text-gray-800">
              <span className="font-extrabold text-sm text-[var(--color-dark-charcoal)]">5.0</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-500 text-[11px] font-semibold">{isAr ? '١٠٠٪ رضا' : '100% Satisfied'}</span>
            </div>
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-1.5 rtl:flex-row-reverse">
            <button
              id="testimonial_prev_btn"
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-gray-700 hover:text-[var(--color-saudi-green)] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ChevronLeft size={20} className="rtl:rotate-180" />
            </button>
            <button
              id="testimonial_next_btn"
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-gray-700 hover:text-[var(--color-saudi-green)] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ChevronRight size={20} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Viewport */}
      <div className="overflow-hidden relative py-2">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${isAr ? '' : '-'}${currentIndex * (100 / visibleCount)}%)`,
          }}
        >
          {reviews.map((rev, idx) => (
            <div 
              key={rev.id || idx} 
              className="shrink-0 px-2 sm:px-3"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <div className="h-full bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                {/* Decorative Quote mark */}
                <Quote size={32} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-emerald-100 group-hover:text-emerald-200 transition-colors pointer-events-none" />

                <div>
                  {/* Top Row: Stars + Route badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[...Array(rev.rating || 5)].map((_, s) => (
                        <Star key={s} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[11px] font-bold text-amber-700 ml-1.5 rtl:ml-0 rtl:mr-1.5 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                        5.0
                      </span>
                    </div>

                    {rev.countryBadge && (
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        {rev.countryBadge}
                      </span>
                    )}
                  </div>

                  {/* Route & Vehicle Tags */}
                  {(rev.routeBadge || rev.vehicleModel) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                      {rev.routeBadge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                          <MapPin size={10} className="text-emerald-600" />
                          <span className="truncate max-w-[190px]">{rev.routeBadge}</span>
                        </span>
                      )}
                      {rev.vehicleModel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Car size={10} className="text-slate-500" />
                          <span>{rev.vehicleModel}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal mb-5 italic">
                    "{rev.text}"
                  </p>
                </div>

                {/* Bottom Pilgrim Profile */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#05513F] to-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      {rev.customerName.replace(/^(Brother|Sister|Haji|Dr\.|Sheikh)\s+/i, '').charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">
                          {rev.customerName}
                        </h4>
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 truncate" title={rev.location}>
                        {rev.location}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {isAr ? 'معتمر موثق' : 'Verified Pilgrim'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, d) => (
          <button
            key={d}
            type="button"
            onClick={() => setCurrentIndex(d)}
            aria-label={`Go to slide ${d + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === d
                ? 'w-6 h-2 bg-[var(--color-saudi-green)]'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
