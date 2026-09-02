import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Search, CheckCircle2, Clock, Car, Check, 
  MapPin, Calendar, User, Phone, ShieldCheck, 
  AlertCircle, ArrowRight, MessageSquare, Copy, Sparkles, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBookingTracker } from '../context/BookingTrackerContext';
import { useWhatsApp } from '../hooks/useWhatsApp';

interface TrackedBooking {
  id: number;
  bookingId: string;
  customerName: string;
  maskedPhone: string;
  pickup: string;
  destination: string;
  vehicleName: string;
  tripType: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  price: number;
  priceMax?: number;
  currency: string;
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  driverPlate?: string | null;
  createdAt: string;
  specialRequest?: string;
}

export default function BookingStatusModal() {
  const { isTrackerOpen, activeBookingId, closeTracker } = useBookingTracker();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openWhatsApp } = useWhatsApp();

  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial booking ID when opened with a parameter
  useEffect(() => {
    if (activeBookingId) {
      setSearchId(activeBookingId);
      performLookup(activeBookingId);
    }
  }, [activeBookingId, isTrackerOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isTrackerOpen) {
      setError(null);
    }
  }, [isTrackerOpen]);

  const performLookup = async (idToSearch: string) => {
    const trimmed = idToSearch.trim();
    if (!trimmed) {
      setError(isAr ? 'يرجى إدخال رقم الحجز المرجعي' : 'Please enter your booking reference ID');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/track/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (res.ok && data.found && data.booking) {
        setBooking(data.booking);
      } else {
        setError(data.error || (isAr ? 'لم يتم العثور على حجز بهذا الرقم المرجعي. يرجى التحقق وإعادة المحاولة.' : 'No booking found with this reference ID. Please double-check or contact WhatsApp support.'));
      }
    } catch (err) {
      console.error(err);
      setError(isAr ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.' : 'Unable to connect to service. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isTrackerOpen) return null;

  // Determine stage for progress stepper:
  // 1: Received / Pending
  // 2: Confirmed
  // 3: Chauffeur Assigned / En Route
  // 4: Completed
  const getStepIndex = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('complete') || s.includes('finished')) return 4;
    if (s.includes('assign') || s.includes('route') || s.includes('active') || s.includes('dispatch')) return 3;
    if (s.includes('confirm') || s.includes('paid')) return 2;
    if (s.includes('cancel')) return 0;
    return 1; // Default to pending / received
  };

  const currentStep = booking ? getStepIndex(booking.status) : 1;
  const isCancelled = booking ? booking.status.toLowerCase().includes('cancel') : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTracker}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tracker-title"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#05513F] to-emerald-900 text-white p-4 sm:p-5 relative">
            <button 
              type="button"
              onClick={closeTracker}
              className="absolute top-3.5 right-3.5 rtl:right-auto rtl:left-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={15} />
              <span>{isAr ? 'الاستعلام الفوري عن الحجز' : 'Instant Booking Tracker'}</span>
            </div>
            <h2 id="tracker-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isAr ? 'متابعة حالة رحلتك وحجزك' : 'Track Your Umrah Transfer Status'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md">
              {isAr ? 'أدخل رقم الحجز المرجعي لمعرفة حالة السائق وموعد الاستقبال وتفاصيل المركبة.' : 'Enter your booking reference to check live confirmation, assigned chauffeur, and trip itinerary.'}
            </p>
          </div>

          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
            {/* Search Input Box */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    placeholder={isAr ? 'مثال: FUV-2026-88901' : 'e.g. FUV-2026-88901'}
                    className="w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 font-mono font-bold text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#05513F] focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
                    autoFocus
                  />
                  {searchId && (
                    <button 
                      type="button"
                      onClick={() => { setSearchId(''); setBooking(null); setError(null); }}
                      className="absolute inset-y-0 right-3 rtl:right-auto rtl:left-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading || !searchId.trim()}
                  className="bg-[#05513F] hover:bg-emerald-800 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-3 rounded-2xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{isAr ? 'جاري البحث...' : 'Checking...'}</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>{isAr ? 'تحقق' : 'Check'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample demo ID hint */}
              {!booking && (
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-1">
                  <span>{isAr ? 'تريد تجربة الاستعلام؟' : 'Need a sample booking ID?'}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchId('FUV-2026-88901');
                      performLookup('FUV-2026-88901');
                    }}
                    className="text-[#05513F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{isAr ? 'استخدم تجريبي: FUV-2026-88901' : 'Try Demo: FUV-2026-88901'}</span>
                  </button>
                </div>
              )}
            </form>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold">{error}</p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openWhatsApp('general', `Assalamu Alaikum! I need help tracking my booking ID: ${searchId}`)}
                      className="text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>{isAr ? 'استفسر عبر واتساب الدعم' : 'Inquire on WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details Card */}
            {booking && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Status Hero Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/80">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isAr ? 'رقم الحجز:' : 'Ref ID:'}</span>
                      <span className="font-mono font-black text-sm sm:text-base text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                        {booking.bookingId}
                      </span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(booking.bookingId)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-white transition-colors"
                        title={isAr ? 'نسخ رقم الحجز' : 'Copy Reference'}
                      >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    {/* Status Pill Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs ${
                      isCancelled 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : currentStep >= 3 
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : currentStep === 2
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isCancelled ? 'bg-rose-500' : currentStep >= 3 ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'
                      }`} />
                      <span>{booking.status}</span>
                    </div>
                  </div>

                  {/* Visual Journey Stepper */}
                  {!isCancelled && (
                    <div className="pt-2 pb-1">
                      <div className="grid grid-cols-4 gap-1 relative">
                        {/* Connecting track lines */}
                        <div className="absolute top-3.5 left-6 right-6 h-1 bg-gray-200 -z-0" />
                        <div 
                          className="absolute top-3.5 left-6 h-1 bg-[#05513F] transition-all duration-500 -z-0"
                          style={{
                            width: currentStep === 1 ? '15%' : currentStep === 2 ? '45%' : currentStep === 3 ? '75%' : '90%'
                          }}
                        />

                        {/* Step 1: Received */}
                        <div className="flex flex-col items-center text-center relative z-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            currentStep >= 1 ? 'bg-[#05513F] text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <Check size={14} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 mt-1 leading-tight">
                            {isAr ? 'تم الاستلام' : 'Received'}
                          </span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center text-center relative z-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            currentStep >= 2 ? 'bg-[#05513F] text-white ring-2 ring-emerald-200' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {currentStep >= 2 ? <Check size={14} /> : '2'}
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 mt-1 leading-tight">
                            {isAr ? 'مؤكد' : 'Confirmed'}
                          </span>
                        </div>

                        {/* Step 3: Assigned */}
                        <div className="flex flex-col items-center text-center relative z-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            currentStep >= 3 ? 'bg-blue-600 text-white ring-2 ring-blue-200' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {currentStep >= 3 ? <Car size={13} /> : '3'}
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 mt-1 leading-tight">
                            {isAr ? 'تخصيص السائق' : 'Chauffeur'}
                          </span>
                        </div>

                        {/* Step 4: Completed */}
                        <div className="flex flex-col items-center text-center relative z-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {currentStep >= 4 ? <CheckCircle2 size={14} /> : '4'}
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 mt-1 leading-tight">
                            {isAr ? 'اكتملت' : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Itinerary Details Table */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 divide-y divide-gray-100 text-xs sm:text-sm">
                  {/* Route */}
                  <div className="py-2.5 first:pt-0">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {isAr ? 'المسار والاتجاه' : 'Transfer Route'}
                    </span>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <MapPin size={15} className="text-[#05513F] shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">{booking.pickup}</span>
                      </div>
                      <ArrowRight size={14} className="text-gray-400 shrink-0 rtl:rotate-180" />
                      <div className="flex items-center gap-1.5 text-amber-900">
                        <MapPin size={15} className="text-amber-600 shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">{booking.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-700" />
                      <span>{isAr ? 'تاريخ وموعد الرحلة:' : 'Date & Schedule:'}</span>
                    </span>
                    <span className="font-bold text-gray-900 font-mono">
                      {booking.date} {booking.time ? `• ${booking.time}` : ''}
                    </span>
                  </div>

                  {/* Vehicle */}
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Car size={14} className="text-emerald-700" />
                      <span>{isAr ? 'المركبة المحجوزة:' : 'Allocated Vehicle:'}</span>
                    </span>
                    <span className="font-bold text-[#05513F]">
                      {booking.vehicleName}
                    </span>
                  </div>

                  {/* Pax & Luggage */}
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <User size={14} className="text-emerald-700" />
                      <span>{isAr ? 'الركاب والحقائب:' : 'Passengers / Luggage:'}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {booking.passengers} {t('pass')} • {booking.luggage} {t('luggage_short')}
                    </span>
                  </div>

                  {/* Lead Guest */}
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-600">{isAr ? 'الضيف الأساسي:' : 'Lead Guest:'}</span>
                    <span className="font-semibold text-gray-900">
                      {booking.customerName} {booking.maskedPhone ? `(${booking.maskedPhone})` : ''}
                    </span>
                  </div>

                  {/* Fare */}
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-600 font-bold">{isAr ? 'السعر التقديري:' : 'Estimated Fare:'}</span>
                    <span className="text-base font-black text-[#05513F]">
                      {booking.priceMax && booking.priceMax > booking.price 
                        ? `${booking.price} - ${booking.priceMax} ${booking.currency}`
                        : `${booking.price} ${booking.currency}`}
                    </span>
                  </div>

                  {/* Allocated Chauffeur / Driver Card */}
                  <div className="py-3 px-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 my-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <Car size={14} className="text-emerald-700" />
                        <span>{isAr ? 'السائق المعين للرحلة:' : 'Assigned Chauffeur:'}</span>
                      </span>
                      {booking.driverName ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                          {isAr ? 'تم التعيين' : 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {isAr ? 'قيد التنسيق' : 'Assigning Soon'}
                        </span>
                      )}
                    </div>
                    {booking.driverName ? (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <div className="font-extrabold text-gray-900 text-sm">{booking.driverName}</div>
                          {booking.driverPhone && <div className="text-gray-600 font-mono text-[11px] mt-0.5">📱 {booking.driverPhone}</div>}
                          {booking.driverPlate && <div className="text-emerald-800 font-bold text-[11px] mt-0.5">🚗 {booking.driverPlate}</div>}
                        </div>
                        <a
                          href={`https://wa.me/${booking.driverPhone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(isAr ? `السلام عليكم كابتن ${booking.driverName}، بخصوص حجز رحلتي رقم #${booking.bookingId}` : `Salam Captain ${booking.driverName}, regarding my booking #${booking.bookingId}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <MessageSquare size={13} />
                          <span>{isAr ? 'واتساب السائق' : 'WhatsApp Driver'}</span>
                        </a>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 italic py-1">
                        {isAr ? 'سيتم تعيين السائق وتحديث رقم هاتفه ومواصفات السيارة قريباً.' : 'Chauffeur name, mobile & vehicle details will appear here shortly once dispatched.'}
                      </div>
                    )}
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequest && (
                    <div className="py-2.5 text-xs text-gray-600">
                      <span className="font-bold text-gray-800 block mb-0.5">{isAr ? 'ملاحظات إضافية:' : 'Special Notes:'}</span>
                      <p className="bg-gray-50 p-2 rounded-lg border border-gray-100">{booking.specialRequest}</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp Dispatch Callout */}
                <div className="p-3.5 rounded-2xl bg-[#E8F8EE] border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-emerald-950 text-center sm:text-left rtl:sm:text-right">
                    <div className="font-black flex items-center justify-center sm:justify-start gap-1">
                      <ShieldCheck size={14} className="text-emerald-700" />
                      <span>{isAr ? 'تأكيد السائق والموقع المباشر' : '24/7 Live Chauffeur Coordination'}</span>
                    </div>
                    <p className="text-emerald-800 mt-0.5">
                      {isAr ? 'تواصل فوراً مع منسق الرحلات للحصول على رقم السائق وموقعه في المطار.' : 'Contact dispatch on WhatsApp for real-time airport gate meeting details.'}
                    </p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      const msg = `Assalamu Alaikum! I am checking the status of my booking #${booking.bookingId} (${booking.pickup} to ${booking.destination}). Please share chauffeur contact and flight tracking.`;
                      openWhatsApp('booking', msg);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer transition-all active:scale-98"
                  >
                    <MessageSquare size={16} />
                    <span>{isAr ? 'مراسلة التنسيق' : 'WhatsApp Dispatch'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-emerald-700" />
              <span>{isAr ? 'تحديث لحظي ومباشر' : 'Live Real-Time Status'}</span>
            </span>

            <button 
              type="button"
              onClick={closeTracker}
              className="text-gray-700 hover:text-gray-900 font-bold px-3 py-1 rounded-lg hover:bg-gray-200/70 transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
