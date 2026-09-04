import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User, 
  MapPin, 
  Sparkles, 
  Filter, 
  Car, 
  Quote, 
  Search, 
  ThumbsUp, 
  AlertCircle, 
  Check, 
  Clock, 
  Calendar,
  ChevronDown,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';

interface ReviewItem {
  id: number;
  customerName: string;
  location?: string;
  text: string;
  rating: number;
  date?: string;
  vehicleModel?: string;
  routeBadge?: string;
  countryBadge?: string;
  bookingId?: string;
}

interface BookingVerification {
  valid: boolean;
  bookingId?: string;
  customerName?: string;
  pickup?: string;
  destination?: string;
  routeText?: string;
  vehicleName?: string;
  date?: string;
  alreadyReviewed?: boolean;
  message?: string;
}

export default function Reviews() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { companyName } = useSiteSettings();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering & Sorting
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  
  // Helpful votes in-memory/localStorage tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({});
  const [userVoted, setUserVoted] = useState<Record<number, boolean>>({});

  // Form State
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    location: '',
    rating: 5,
    text: '',
    bookingId: ''
  });

  // Verification state
  const [verifyingBooking, setVerifyingBooking] = useState(false);
  const [verificationResult, setVerificationResult] = useState<BookingVerification | null>(null);

  // Active Mobile Tab: 'list' or 'write'
  const [mobileTab, setMobileTab] = useState<'list' | 'write'>('list');

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/testimonials', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    // Load stored helpful votes
    try {
      const storedVotes = localStorage.getItem('faris_reviews_helpful');
      if (storedVotes) setUserVoted(JSON.parse(storedVotes));
    } catch (e) {}

    const handleSync = () => fetchReviews();
    window.addEventListener('faris_reviews_updated', handleSync);
    return () => {
      window.removeEventListener('faris_reviews_updated', handleSync);
    };
  }, []);

  // Autofill user name if logged in
  useEffect(() => {
    if (user?.name && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: user.name }));
    }
  }, [user]);

  // Real-time booking verification with debounce
  useEffect(() => {
    const rawId = formData.bookingId.trim();
    if (!rawId || rawId.length < 4) {
      setVerificationResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setVerifyingBooking(true);
      try {
        const res = await fetch(`/api/testimonials/verify-booking/${encodeURIComponent(rawId)}`);
        const data: BookingVerification = await res.json();
        setVerificationResult(data);

        // Autofill verified details if available
        if (data.valid) {
          setFormData(prev => ({
            ...prev,
            customerName: prev.customerName || data.customerName || '',
            location: prev.location || data.routeText || ''
          }));
        }
      } catch (e) {
        console.warn('Booking verify error:', e);
      } finally {
        setVerifyingBooking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.bookingId]);

  const handleHelpfulClick = (reviewId: number) => {
    if (userVoted[reviewId]) return;
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
    const updated = { ...userVoted, [reviewId]: true };
    setUserVoted(updated);
    try {
      localStorage.setItem('faris_reviews_helpful', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.text.trim() || !formData.bookingId.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسمك، نص التقييم، ورقم الحجز المعتمد.' : 'Please enter your name, review text, and confirmed Booking ID.');
      return;
    }

    if (verificationResult && verificationResult.alreadyReviewed) {
      setErrorMsg(isAr ? 'تم إرسال تقييم مسبقاً لرقم الحجز هذا (تقييم واحد لكل رحلة).' : 'A review has already been submitted for this booking order (1 review per completed ride).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(isAr 
          ? 'جزاك الله خيراً! تم استلام تقييمك الموثق بنجاح وسيتم نشره على الموقع فور مراجعته.' 
          : 'Jazakum Allah Khair! Your verified review has been submitted successfully and will be published shortly after review.');
        
        setFormData({ 
          customerName: user?.name || '', 
          location: '', 
          rating: 5, 
          text: '', 
          bookingId: '' 
        });
        setVerificationResult(null);
        fetchReviews();

        // Switch to list tab on mobile after submit
        if (window.innerWidth < 1024) {
          setTimeout(() => setMobileTab('list'), 1500);
        }
      } else {
        setErrorMsg(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setErrorMsg(isAr ? 'حدث خطأ في الاتصال. يرجى المحاولة ثانية.' : 'Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search Logic
  const filteredReviews = reviews
    .filter(rev => {
      // Rating filter
      if (selectedRatingFilter !== 'all' && (rev.rating || 5) !== selectedRatingFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rev.customerName?.toLowerCase().includes(q);
        const matchesText = rev.text?.toLowerCase().includes(q);
        const matchesLocation = rev.location?.toLowerCase().includes(q);
        const matchesVehicle = rev.vehicleModel?.toLowerCase().includes(q);
        const matchesRoute = rev.routeBadge?.toLowerCase().includes(q);
        return matchesName || matchesText || matchesLocation || matchesVehicle || matchesRoute;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'lowest') return (a.rating || 5) - (b.rating || 5);
      return b.id - a.id; // Newest
    });

  // Calculate Breakdown Percentages
  const totalReviewsCount = reviews.length || 1;
  const count5Star = reviews.filter(r => (r.rating || 5) === 5).length;
  const count4Star = reviews.filter(r => (r.rating || 5) === 4).length;
  const count3Star = reviews.filter(r => (r.rating || 5) === 3).length;
  const percent5 = Math.round((count5Star / totalReviewsCount) * 100) || 92;
  const percent4 = Math.round((count4Star / totalReviewsCount) * 100) || 8;
  const percent3 = Math.round((count3Star / totalReviewsCount) * 100) || 0;

  const scrollToReviewForm = () => {
    setMobileTab('write');
    setTimeout(() => {
      const el = document.getElementById('write-review-card');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  return (
    <div className="bg-[#F4F6F9] min-h-screen pb-28 text-left rtl:text-right font-sans">
      <Helmet>
        <title>{isAr ? `آراء المعتمرين والتقييمات الموثقة | ${companyName}` : `Verified Pilgrim Reviews & Testimonials | ${companyName}`}</title>
        <meta 
          name="description" 
          content={isAr 
            ? 'اقرأ تجارب ضيوف الرحمن مع خدمات النقل الفاخر بين مطار جدة، مكة المكرمة والمدينة المنورة. شارك تقييمك الموثق.' 
            : 'Explore verified pilgrim reviews for VIP Umrah transport between Jeddah Airport, Makkah & Madinah. Submit your authenticated feedback.'} 
        />
      </Helmet>
      
      <Breadcrumbs items={[{ label: isAr ? 'تقييمات ضيوف الرحمن' : 'Client Reviews' }]} />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-b from-[#05513F] via-[#076650] to-[#044234] text-white relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/15 text-emerald-100 border border-white/20 mb-4 backdrop-blur-xs shadow-xs">
            <Sparkles size={14} className="text-amber-300 shrink-0" />
            <span>{isAr ? 'تقييمات معتمدة 100% برقم الحجز الرسمي' : '100% Verified Pilgrimage Experiences'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 text-white tracking-tight leading-tight">
            {isAr ? 'آراء وتجارب ضيوف الرحمن' : 'What Our Pilgrims Say'}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-medium mb-6">
            {isAr 
              ? 'نعتز بخدمة ضيوف الرحمن سنوياً بسيارات VIP حديثة وسائقين محترفين. اطلع على تقييماتهم الموثقة أو شاركنا تجربتك الكريمة.' 
              : 'Honored to serve thousands of Umrah pilgrims with VIP GMC Yukon XL, Lexus, and luxury buses. Read verified feedback or rate your trip.'}
          </p>

          {/* Quick Metrics & Write Review Action */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-xs border border-white/15 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-emerald-100">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="text-white font-black text-sm">4.9 / 5.0</span>
              <span className="opacity-80">({reviews.length}+ {isAr ? 'تقييم' : 'Reviews'})</span>
            </div>

            <button
              type="button"
              onClick={scrollToReviewForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-[#0c2e22] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Send size={15} className="shrink-0" />
              <span>{isAr ? 'أضف تقييمك الآن' : 'Write a Review'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8 max-w-7xl">
        
        {/* Rating Overview & Breakdown Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs border border-slate-200/90 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Big Score Badge */}
            <div className="md:col-span-4 text-center md:text-left rtl:md:text-right border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-slate-200 pb-5 md:pb-0 md:pr-6 rtl:md:pr-0 rtl:md:pl-6">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[var(--color-saudi-green)] px-3 py-1 rounded-full text-xs font-bold mb-2">
                <ShieldCheck size={14} /> 
                <span>{isAr ? 'تقييمات معتمدة رسمياً' : 'Official Verified Rating'}</span>
              </div>
              <div className="flex items-baseline justify-center md:justify-start rtl:md:justify-start gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-black text-[#0c2e22] tracking-tight">4.9</span>
                <span className="text-base text-gray-400 font-bold">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start rtl:md:justify-start gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isAr ? `استناداً إلى ${reviews.length} تجربة معتمرين موثقة` : `Based on ${reviews.length} authenticated pilgrim reviews`}
              </p>
            </div>

            {/* Middle: Star Rating Distribution Progress Bars */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-gray-700">
                <span className="w-12 text-right rtl:text-left shrink-0">5 {isAr ? 'نجوم' : 'Stars'}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent5}%` }}></div>
                </div>
                <span className="w-10 text-left rtl:text-right text-gray-500 text-[11px] sm:text-xs shrink-0">{percent5}%</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-gray-700">
                <span className="w-12 text-right rtl:text-left shrink-0">4 {isAr ? 'نجوم' : 'Stars'}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent4}%` }}></div>
                </div>
                <span className="w-10 text-left rtl:text-right text-gray-500 text-[11px] sm:text-xs shrink-0">{percent4}%</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-gray-700">
                <span className="w-12 text-right rtl:text-left shrink-0">3 {isAr ? 'نجوم' : 'Stars'}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent3}%` }}></div>
                </div>
                <span className="w-10 text-left rtl:text-right text-gray-500 text-[11px] sm:text-xs shrink-0">{percent3}%</span>
              </div>
            </div>

            {/* Right: Star Filter Buttons */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider mb-0.5">
                {isAr ? 'تصفية حسب النجوم:' : 'Filter by Stars:'}
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRatingFilter === 'all' 
                      ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' 
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'} ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter(5)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedRatingFilter === 5 
                      ? 'bg-amber-400 text-[#0c2e22] shadow-xs' 
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  <span>5</span> <Star size={12} className="fill-amber-500 text-amber-500" /> ({count5Star})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter(4)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedRatingFilter === 4 
                      ? 'bg-amber-400 text-[#0c2e22] shadow-xs' 
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  <span>4</span> <Star size={12} className="fill-amber-500 text-amber-500" /> ({count4Star})
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile View Toggle Switch (List vs Write Review) */}
        <div className="lg:hidden flex rounded-2xl bg-white p-1.5 border border-slate-200 shadow-2xs mb-6">
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'list' 
                ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={16} />
            <span>{isAr ? 'تصفح التقييمات' : 'Browse Reviews'}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-black">
              {filteredReviews.length}
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setMobileTab('write')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'write' 
                ? 'bg-[var(--color-saudi-green)] text-white shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span>{isAr ? 'أضف تقييم' : 'Write Review'}</span>
          </button>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Reviews List & Search Column (Left: 7 cols) */}
          <div className={`lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-5 min-w-0 ${
            mobileTab === 'write' ? 'hidden lg:block' : 'block'
          }`}>
            
            {/* Search & Sort Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-gray-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث عن مسار، مدينة، سيارة، أو سائق...' : 'Search by route, vehicle model, or keyword...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap hidden sm:inline">
                  {isAr ? 'الترتيب:' : 'Sort:'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] cursor-pointer"
                >
                  <option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest'}</option>
                  <option value="highest">{isAr ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                  <option value="lowest">{isAr ? 'الأقل تقييماً' : 'Lowest Rated'}</option>
                </select>
              </div>
            </div>

            {/* Status Heading */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-black text-[#0c2e22] flex items-center gap-2">
                <MessageSquare size={18} className="text-[var(--color-saudi-green)]" />
                <span>{isAr ? 'تقييمات وتجارب ضيوف الرحمن' : 'Verified Reviews'}</span>
                <span className="text-xs font-black px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                  {filteredReviews.length}
                </span>
              </h2>
            </div>

            {/* Reviews Cards */}
            {loading ? (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-xs border border-slate-200">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-[var(--color-saudi-green)] animate-spin mx-auto mb-3"></div>
                <p className="text-xs sm:text-sm font-bold text-gray-600">{isAr ? 'جاري تحميل التقييمات الموثقة...' : 'Loading verified reviews...'}</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-xs border border-slate-200 px-4">
                <MessageSquare size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700 mb-1">{isAr ? 'لا توجد تقييمات مطابقة' : 'No reviews match your filters'}</p>
                <p className="text-xs text-gray-500 mb-4">{isAr ? 'جرّب تعديل البحث أو اختيار "الكل" لعرض جميع التقييمات.' : 'Try changing your search terms or selecting "All" to view all reviews.'}</p>
                <button
                  type="button"
                  onClick={() => { setSelectedRatingFilter('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-[var(--color-saudi-green)] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
                {filteredReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md hover:border-emerald-300 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
                  >
                    {/* Background Decorative Quote */}
                    <Quote size={24} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-emerald-50 group-hover:text-emerald-100 transition-colors pointer-events-none sm:w-7 sm:h-7" />

                    <div>
                      {/* Top Bar: Stars + Date Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 sm:px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-2xs">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                          ))}
                          <span className="text-xs font-black text-amber-800 ml-1">{(rev.rating || 5).toFixed(1)}</span>
                        </div>

                        {rev.date && (
                          <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={11} className="text-gray-400" />
                            <span>{rev.date}</span>
                          </span>
                        )}
                      </div>

                      {/* Route & Vehicle Tags */}
                      {(rev.routeBadge || rev.vehicleModel || rev.location) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {rev.routeBadge ? (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <MapPin size={11} className="text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[220px] sm:max-w-none">{rev.routeBadge}</span>
                            </span>
                          ) : rev.location && (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <MapPin size={11} className="text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[220px] sm:max-w-none">{rev.location}</span>
                            </span>
                          )}

                          {rev.vehicleModel && (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              <Car size={11} className="text-slate-500 shrink-0" />
                              <span className="truncate max-w-[160px] sm:max-w-none">{rev.vehicleModel}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Review Text */}
                      <p className="text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed font-normal mb-4 sm:mb-5 italic break-words">
                        "{rev.text}"
                      </p>
                    </div>

                    {/* Customer Info & Helpful Vote */}
                    <div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                      
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#05513F] to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-2xs shrink-0">
                          {rev.customerName.replace(/^(Brother|Sister|Haji|Dr\.|Sheikh)\s+/i, '').charAt(0) || 'P'}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="font-black text-xs sm:text-sm text-[#0c2e22] truncate">{rev.customerName}</h3>
                            <CheckCircle2 size={14} className="text-[var(--color-saudi-green)] shrink-0" />
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={12} className="text-[var(--color-saudi-green)] shrink-0" />
                            <span>{isAr ? 'معتمر موثق برقم الحجز' : 'Verified Umrah Pilgrim'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Helpful Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleHelpfulClick(rev.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            userVoted[rev.id] 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-slate-50 hover:bg-slate-100 text-gray-600 border border-slate-200'
                          }`}
                        >
                          <ThumbsUp size={12} className={userVoted[rev.id] ? 'fill-emerald-700 text-emerald-700' : 'text-gray-400'} />
                          <span>{isAr ? 'مفيد' : 'Helpful'}</span>
                          {(helpfulVotes[rev.id] || 0) > 0 && (
                            <span className="font-black text-emerald-700 ml-0.5">({helpfulVotes[rev.id]})</span>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Write a Review Card Column (Right: 5 cols) */}
          <div 
            id="write-review-card"
            className={`lg:col-span-5 xl:col-span-5 w-full min-w-0 ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-white p-4 sm:p-6 lg:p-6 xl:p-8 rounded-2xl shadow-sm border border-slate-200/90 w-full min-w-0 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto">
              
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[var(--color-saudi-green)] flex items-center justify-center shrink-0">
                    <Star size={20} className="fill-[var(--color-saudi-green)]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-base sm:text-lg text-[#0c2e22] truncate">
                      {isAr ? 'أضف تقييمك وتجربتك' : 'Share Your Experience'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
                      {isAr ? 'تقييم رسمي موثق برقم الحجز' : 'Verified review linked to your booking'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                  {isAr ? 'موثق' : 'Verified'}
                </span>
              </div>

              {/* Logged in User Banner (Optional) */}
              {user ? (
                <div className="mb-4 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-emerald-700 shrink-0" />
                    <span className="font-bold text-emerald-950 truncate">
                      {isAr ? `مسجل كـ: ${user.name}` : `Signed in as ${user.name}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 shrink-0 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {isAr ? 'حساب معتمد' : 'Account'}
                  </span>
                </div>
              ) : (
                <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-600 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium leading-tight">
                    {isAr ? 'أدخل رقم الحجز الخاص برحلتك لتوثيق التقييم' : 'Enter your booking ID to verify your ride'}
                  </span>
                  <Link to="/login" className="text-[11px] text-[var(--color-saudi-green)] font-bold hover:underline shrink-0 whitespace-nowrap">
                    {isAr ? 'تسجيل دخول' : 'Sign in'}
                  </Link>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                
                {/* Success Alert */}
                {successMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-start gap-2 animate-fadeIn">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{successMsg}</span>
                  </div>
                )}

                {/* Error Alert */}
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-start gap-2 animate-fadeIn">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Booking ID Input + Real-time verification badge */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      {isAr ? 'رقم الحجز (Booking ID) *' : 'Booking ID / Order ID *'}
                    </label>
                    {verifyingBooking && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                        {isAr ? 'جاري التحقق...' : 'Verifying...'}
                      </span>
                    )}
                  </div>

                  <input 
                    type="text" 
                    value={formData.bookingId} 
                    onChange={e => setFormData({ ...formData, bookingId: e.target.value.toUpperCase() })}
                    placeholder="e.g., FUV-2026-86451"
                    required
                    className={`w-full min-w-0 border p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold tracking-wider outline-none transition-all box-border ${
                      verificationResult?.valid 
                        ? 'border-emerald-400 bg-emerald-50/40 text-emerald-950 focus:ring-2 focus:ring-emerald-500' 
                        : verificationResult && !verificationResult.valid
                          ? 'border-amber-300 bg-amber-50/40 text-amber-900 focus:ring-2 focus:ring-amber-400'
                          : 'border-slate-200 bg-slate-50 text-gray-800 focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:bg-white'
                    }`}
                  />

                  {/* Verification Status Card */}
                  {verificationResult && verificationResult.valid && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-black mb-1">
                        <CheckCircle2 size={14} className="text-[var(--color-saudi-green)] shrink-0" />
                        <span>{isAr ? 'تم التحقق من الحجز بنجاح' : 'Booking Verified Successfully'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                        {verificationResult.customerName} • {verificationResult.routeText} • {verificationResult.vehicleName}
                      </p>
                      {verificationResult.alreadyReviewed && (
                        <p className="text-[10px] text-amber-700 font-bold mt-1 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
                          {isAr ? 'ملاحظة: تم إرسال تقييم مسبقاً لهذا الحجز' : 'Note: A review has already been submitted for this booking.'}
                        </p>
                      )}
                    </div>
                  )}

                  {verificationResult && !verificationResult.valid && formData.bookingId.length >= 6 && (
                    <p className="text-[10px] text-amber-700 mt-1 font-medium leading-normal flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      <span>{isAr ? 'لم نتمكن من مطابقة رقم الحجز تلقائياً. تأكد من إدخال الرمز من رسالة الواتساب أو الإيميل.' : 'Could not find booking with this ID. Please verify your receipt ticket.'}</span>
                    </p>
                  )}

                  <p className="text-[10px] text-gray-500 mt-1">
                    {isAr ? 'رقم الحجز المستلم عبر الواتساب أو البريد (تقييم واحد لكل طلب).' : 'Found in your WhatsApp booking confirmation or email ticket.'}
                  </p>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'اسمك الكريم *' : 'Your Name *'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.customerName} 
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder={isAr ? 'مثال: محمد بلال' : 'e.g., Muhammad Bilal'}
                    required
                    className="w-full min-w-0 border border-slate-200 p-2.5 sm:p-3 rounded-xl bg-slate-50 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:bg-white transition-all box-border"
                  />
                </div>

                {/* Location / Route Details */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'المدينة / الدولة أو المسار' : 'Country / City or Pilgrimage Route'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder={isAr ? 'مثال: مكة المكرمة ➔ المدينة المنورة' : 'e.g., London, UK / Makkah to Madinah'}
                    className="w-full min-w-0 border border-slate-200 p-2.5 sm:p-3 rounded-xl bg-slate-50 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:bg-white transition-all box-border"
                  />
                </div>

                {/* Interactive Star Rating Selector (44px min touch size) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {isAr ? 'التقييم العام بالنجوم' : 'Your Star Rating'}
                    </label>
                    <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">
                      {formData.rating} / 5
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFormData({ ...formData, rating: num })}
                        className={`flex-1 h-11 sm:h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          formData.rating >= num 
                            ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-amber-50/50'
                        }`}
                        aria-label={`${num} star rating`}
                      >
                        <Star 
                          size={20} 
                          className={`transition-transform ${formData.rating >= num ? 'fill-amber-500 text-amber-500 scale-110' : 'text-slate-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text Area */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {isAr ? 'نص التجربة والتقييم *' : 'Your Review Text *'}
                  </label>
                  <textarea 
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    placeholder={isAr 
                      ? 'شاركنا تجربتك في النقل: نظافة السيارة، التزام السائق بالمواعيد، راحة الطريق...' 
                      : 'Describe your journey: chauffeur courtesy, vehicle cleanliness, punctuality, and overall comfort...'}
                    rows={4}
                    required
                    className="w-full min-w-0 border border-slate-200 p-2.5 sm:p-3 rounded-xl bg-slate-50 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:bg-white transition-all resize-none box-border"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-w-0 bg-[var(--color-saudi-green)] hover:bg-emerald-800 active:scale-[0.99] text-white font-black py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} className="shrink-0" />
                  <span>
                    {submitting 
                      ? (isAr ? 'جاري توثيق ونشر التقييم...' : 'Submitting Verified Review...') 
                      : (isAr ? 'إرسال التقييم الموثق' : 'Submit Verified Review')}
                  </span>
                </button>

                {/* Trust Footer Note */}
                <div className="pt-2 text-center">
                  <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                    <Lock size={10} />
                    <span>{isAr ? 'تقييمات موثقة ومحمية بموجب معايير خدمة النقل المعتمدة' : 'Verified pilgrim feedback protected by service standards'}</span>
                  </p>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Floating Review Action Button */}
      <div className="lg:hidden fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-40">
        <button
          type="button"
          onClick={scrollToReviewForm}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--color-saudi-green)] text-white font-black text-xs shadow-xl hover:bg-emerald-800 active:scale-95 transition-all border border-emerald-400/30 cursor-pointer"
        >
          <Star size={16} className="fill-amber-400 text-amber-400" />
          <span>{isAr ? 'أضف تقييم' : 'Write Review'}</span>
        </button>
      </div>

    </div>
  );
}
