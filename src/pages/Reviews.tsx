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
  Lock,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'motion/react';
import { useReviewsSnapshot } from '../hooks/useReviewsSnapshot';

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

  const rawReviews = useReviewsSnapshot();
  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering & Sorting
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(9);
  
  // Helpful votes in-memory/localStorage tracking
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({});
  const [userVoted, setUserVoted] = useState<Record<number, boolean>>({});

  // Form State
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    location: '',
    rating: 5,
    text: ''
  });

  // Active Tab State (Write by default on Mobile, List by default on Desktop)
  const [activeTab, setActiveTab] = useState<'list' | 'write'>('write');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setActiveTab('list');
    }
  }, []);

  useEffect(() => {
    // Load stored helpful votes
    try {
      const storedVotes = localStorage.getItem('faris_reviews_helpful');
      if (storedVotes) setUserVoted(JSON.parse(storedVotes));
    } catch (e) {}
  }, []);

  // Autofill user name if logged in
  useEffect(() => {
    if (user?.name && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: user.name }));
    }
  }, [user]);

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
    if (!formData.customerName.trim() || !formData.text.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسمك ونص التقييم.' : 'Please enter your name and review text.');
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
          text: ''
        });
        // Force an immediate fetch to bypass polling delay
        fetch('/api/testimonials').then(r => r.json()).then(d => {
           if (typeof window !== 'undefined') {
              // This relies on the polling eventually catching up, but we could broadcast an event
              window.dispatchEvent(new Event('faris_reviews_updated'));
           }
        }).catch(e => {});

        // Switch to list tab after submit
        setTimeout(() => {
          setActiveTab('list');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
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

  const paginatedReviews = filteredReviews.slice(0, visibleCount);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, selectedRatingFilter, sortBy]);

  // Calculate Breakdown Percentages
  const totalReviewsCount = reviews.length || 1;
  const count5Star = reviews.filter(r => (r.rating || 5) === 5).length;
  const count4Star = reviews.filter(r => (r.rating || 5) === 4).length;
  const count3Star = reviews.filter(r => (r.rating || 5) === 3).length;
  const percent5 = Math.round((count5Star / totalReviewsCount) * 100) || 92;
  const percent4 = Math.round((count4Star / totalReviewsCount) * 100) || 8;
  const percent3 = Math.round((count3Star / totalReviewsCount) * 100) || 0;

  const scrollToReviewForm = () => {
    setActiveTab('write');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('review-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'Faris-VIP-Review-QR.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
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
      <div className="bg-gradient-to-br from-[#0c2e22] via-[#05513F] to-[#03291F] text-white relative overflow-hidden py-8 sm:py-12 lg:py-16 px-4 shadow-xl">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-saudi-green)] rounded-full blur-[120px] opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500 rounded-full blur-[100px] opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-black bg-white/10 text-emerald-50 border border-white/20 mb-3 sm:mb-4 backdrop-blur-md shadow-lg"
          >
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span className="tracking-wide uppercase">{isAr ? 'تقييمات معتمدة 100% برقم الحجز الرسمي' : '100% Verified Pilgrimage Experiences'}</span>
          </motion.div>

          {/* Desktop Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-white tracking-tight leading-[1.15]"
          >
            {isAr ? 'آراء وتجارب ضيوف الرحمن' : 'What Our Pilgrims Say'}
          </motion.h1>

          {/* Mobile Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="block md:hidden text-2xl font-black mb-0 text-white tracking-tight leading-[1.15]"
          >
            {isAr ? 'شاركنا تجربتك' : 'Share Your Experience'}
          </motion.h1>

          {/* Desktop Only Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block text-sm lg:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-medium mb-6"
          >
            {isAr 
              ? 'نعتز بخدمة ضيوف الرحمن سنوياً بسيارات VIP حديثة وسائقين محترفين. اطلع على تقييماتهم الموثقة أو شاركنا تجربتك الكريمة.' 
              : 'Honored to serve thousands of Umrah pilgrims with VIP GMC Yukon XL, Lexus, and luxury buses. Read verified feedback or rate your trip.'}
          </motion.p>

          {/* Desktop Only Rating Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-50 shadow-inner">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              <span className="text-white font-black text-lg">4.9 / 5.0</span>
              <span className="opacity-70 ml-1">({reviews.length}+ {isAr ? 'تقييم' : 'Reviews'})</span>
            </div>
          </motion.div>


        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8 max-w-7xl">
        


        {/* Unified Responsive View Toggle Switch */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex rounded-full bg-white p-1.5 border border-slate-200 shadow-sm w-full max-w-sm relative">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative z-10 ${
                activeTab === 'list' 
                  ? 'bg-[var(--color-saudi-green)] text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={16} className={activeTab === 'list' ? 'text-white' : 'text-gray-400'} />
              <span>{isAr ? 'تصفح التقييمات' : 'See Reviews'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === 'list' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {filteredReviews.length}
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer relative z-10 ${
                activeTab === 'write' 
                  ? 'bg-[var(--color-saudi-green)] text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star size={16} className={activeTab === 'write' ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
              <span>{isAr ? 'أضف تقييم' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          
          {/* 1) LIST TAB */}
          {activeTab === 'list' && (
            <div className="space-y-4 sm:space-y-6">
            
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            
            {visibleCount < filteredReviews.length && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 9)}
                  className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-gray-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ChevronDown size={16} />
                  <span>{isAr ? 'عرض المزيد' : 'Load More'}</span>
                </button>
              </div>
            )}
            
            </div>
          )}

          {/* 2) WRITE TAB */}
          {activeTab === 'write' && (
            <div id="write-review-card" className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 max-w-5xl mx-auto w-full min-w-0">
              
              <div className="md:col-span-7 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200/90 w-full min-w-0">
              
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
                      {isAr ? 'رأيك يهمنا ويساعدنا على التطور' : 'Your feedback helps us improve'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logged in User Banner (Optional) */}
              {user && (
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

              {/* QR Code Section for Desktop and Mobile Users (Right Col) */}
              <div className="md:col-span-5">
                <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col items-center justify-center text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] mb-4 border border-emerald-100">
                    <ExternalLink size={20} className="ml-1 rtl:mr-1 rtl:ml-0" />
                  </div>
                <h4 className="font-black text-gray-900 text-sm sm:text-base mb-1.5">
                  {isAr ? 'شارك صفحة التقييم' : 'Share Review Portal'}
                </h4>
                <p className="text-xs text-gray-500 mb-5 max-w-[260px] leading-relaxed">
                  {isAr 
                    ? 'امسح الرمز البريدي بكاميرا جوالك لمشاركة هذه الصفحة، أو قم بتحميله للوصول السريع لاحقاً' 
                    : 'Scan this QR code with your phone camera to open this page or download it for future access.'}
                </p>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
                  <div className="relative bg-white rounded-xl">
                    <QRCodeCanvas 
                      id="review-qr-code"
                      value="https://farisvipumrahtransport.com/reviews" 
                      size={160} 
                      level="H"
                      includeMargin={false}
                      fgColor="#0c2e22"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 border border-black/5 rounded-xl pointer-events-none"></div>
                  </div>
                </div>
                
                <button
                  onClick={handleDownloadQR}
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>{isAr ? 'تحميل رمز الاستجابة السريعة (QR)' : 'Download QR Code'}</span>
                </button>
                
                <span className="text-[10px] font-black text-slate-400 mt-4 tracking-[0.2em] uppercase">Faris VIP Transport</span>
                </div>
              </div>

            </div>
          )}

        {/* Rating Overview & Breakdown Card - Moved below the form as requested */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs border border-slate-200/90 mt-8 mb-6 sm:mb-8">
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

        </div>

      </div>

      {/* Mobile Sticky Floating Review Action Button */}
      {activeTab === 'list' && (
        <div className="md:hidden fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-40">
          <button
            type="button"
            onClick={scrollToReviewForm}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--color-saudi-green)] text-white font-black text-xs shadow-xl hover:bg-emerald-800 active:scale-95 transition-all border border-emerald-400/30 cursor-pointer"
          >
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <span>{isAr ? 'أضف تقييم' : 'Write Review'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
