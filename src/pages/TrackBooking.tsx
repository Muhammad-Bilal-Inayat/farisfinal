import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, CheckCircle2, Clock, Car, Check, MapPin, 
  Calendar, User, ShieldCheck, AlertCircle, ArrowRight, 
  MessageSquare, Copy, Sparkles, RefreshCw, HelpCircle, PhoneCall
} from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import Breadcrumbs from '../components/Breadcrumbs';

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
  createdAt: string;
  specialRequest?: string;
}

export default function TrackBooking() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { openWhatsApp } = useWhatsApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryId = searchParams.get('id') || searchParams.get('bookingId') || '';
  const [searchId, setSearchId] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (queryId) {
      setSearchId(queryId);
      performLookup(queryId);
    }
  }, [queryId]);

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
        // Update URL param without refreshing
        setSearchParams({ id: data.booking.bookingId });
      } else {
        setError(data.error || (isAr ? 'لم يتم العثور على حجز بهذا الرقم المرجعي. يرجى التحقق وإعادة المحاولة.' : 'No booking found with this reference ID. Please check or contact WhatsApp support.'));
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

  const getStepIndex = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('complete') || s.includes('finished')) return 4;
    if (s.includes('chauffeur') || s.includes('driver') || s.includes('assign') || s.includes('route') || s.includes('active') || s.includes('dispatch')) return 3;
    if (s.includes('confirm') || s.includes('paid')) return 2;
    if (s.includes('cancel')) return 0;
    return 1;
  };

  const currentStep = booking ? getStepIndex(booking.status) : 1;
  const isCancelled = booking ? booking.status.toLowerCase().includes('cancel') : false;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-950 via-[#05513F] to-emerald-900 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <ShieldCheck size={14} />
            <span>{isAr ? 'نظام التحقق اللحظي من الحجز' : 'Real-Time Ride Tracker'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            {isAr ? 'تتبع حالة حجز رحلتك' : 'Track Your Umrah Transfer'}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            {isAr ? 'تحقق لحظياً من حالة السائق المخصص، وموعد الاستقبال في المطار أو الفندق، والتفاصيل الكاملة لرحلتك.' : 'Verify live chauffeur assignment, airport gate meeting details, and complete journey itinerary.'}
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200">
              <div className="relative flex-1 w-full">
                <Search size={20} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  placeholder={isAr ? 'أدخل رقم الحجز (مثال: FUV-2026-88901)' : 'Enter Booking ID (e.g. FUV-2026-88901)'}
                  className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 text-gray-900 font-mono font-bold text-sm sm:text-base rounded-xl focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !searchId.trim()}
                className="w-full sm:w-auto bg-[#05513F] hover:bg-emerald-800 disabled:bg-gray-300 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isAr ? 'جاري البحث...' : 'Checking...'}</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>{isAr ? 'استعلام' : 'Track Now'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Try demo link */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-200">
              <span>{isAr ? 'تجربة سريعة:' : 'Quick test:'}</span>
              <button 
                type="button"
                onClick={() => {
                  setSearchId('FUV-2026-88901');
                  performLookup('FUV-2026-88901');
                }}
                className="font-mono font-bold text-amber-300 hover:text-white underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>FUV-2026-88901</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-sm sm:text-base">{error}</p>
              <p className="text-xs text-rose-700">
                {isAr ? 'إذا كنت بحاجة إلى مساعدة، يمكنك التواصل مباشرة مع قسم التنسيق والمتابعة على الواتساب مع تزويدنا برقم الهاتف المستخدم أثناء الحجز.' : 'If you need immediate assistance, please chat directly with our 24/7 dispatch team on WhatsApp.'}
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp('general', `Assalamu Alaikum! I need help finding my booking: ${searchId}`)}
                className="mt-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageSquare size={14} />
                <span>{isAr ? 'مراسلة الدعم عبر واتساب' : 'Contact WhatsApp Support'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Found Booking Result */}
        {booking && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {isAr ? 'رقم الحجز المرجعي' : 'Booking Reference'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-2xl font-mono font-black text-gray-900">{booking.bookingId}</h2>
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(booking.bookingId)}
                      className="text-gray-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      title={isAr ? 'نسخ' : 'Copy'}
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 self-start sm:self-auto shadow-2xs ${
                  isCancelled 
                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                    : currentStep >= 3 
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : currentStep === 2
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isCancelled ? 'bg-rose-500' : currentStep >= 3 ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'
                  }`} />
                  <span>{booking.status}</span>
                </div>
              </div>

              {/* Stepper Progress */}
              {!isCancelled && (
                <div className="py-4">
                  <div className="grid grid-cols-4 gap-2 relative">
                    <div className="absolute top-4 left-8 right-8 h-1 bg-gray-200 -z-0" />
                    <div 
                      className="absolute top-4 left-8 h-1 bg-[#05513F] transition-all duration-700 -z-0"
                      style={{
                        width: currentStep === 1 ? '15%' : currentStep === 2 ? '45%' : currentStep === 3 ? '75%' : '92%'
                      }}
                    />

                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center relative z-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep >= 1 ? 'bg-[#05513F] text-white shadow-md' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Check size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-800 mt-2">
                        {isAr ? 'تم استلام الطلب' : 'Request Received'}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {isAr ? 'في النظام' : 'Logged'}
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center relative z-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep >= 2 ? 'bg-[#05513F] text-white shadow-md ring-4 ring-emerald-100' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep >= 2 ? <Check size={16} /> : '2'}
                      </div>
                      <span className="text-xs font-bold text-gray-800 mt-2">
                        {isAr ? 'تم تأكيد الحجز' : 'Confirmed'}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {isAr ? 'المركبة محجوزة' : 'Slot Guaranteed'}
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center relative z-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep >= 3 ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep >= 3 ? <Car size={15} /> : '3'}
                      </div>
                      <span className="text-xs font-bold text-gray-800 mt-2">
                        {isAr ? 'تعيين السائق' : 'Chauffeur Ready'}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {isAr ? 'جاهز للاستقبال' : 'En Route / At Gate'}
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center text-center relative z-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentStep >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep >= 4 ? <CheckCircle2 size={16} /> : '4'}
                      </div>
                      <span className="text-xs font-bold text-gray-800 mt-2">
                        {isAr ? 'اكتملت الرحلة' : 'Completed'}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {isAr ? 'عمرة مقبولة' : 'Alhamdulillah'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Route & Schedule Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin size={18} className="text-[#05513F]" />
                  <span>{isAr ? 'تفاصيل المسار والموعد' : 'Route & Itinerary'}</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 font-bold block">{isAr ? 'نقطة الانطلاق:' : 'Pickup Location:'}</span>
                    <span className="font-bold text-gray-900 text-base">{booking.pickup}</span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-bold block">{isAr ? 'الوجهة والنزول:' : 'Destination:'}</span>
                    <span className="font-bold text-gray-900 text-base">{booking.destination}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 font-bold block">{isAr ? 'تاريخ الرحلة:' : 'Date:'}</span>
                      <span className="font-mono font-bold text-gray-900">{booking.date}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-bold block">{isAr ? 'وقت الاستقبال:' : 'Pickup Time:'}</span>
                      <span className="font-mono font-bold text-gray-900">{booking.time || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Fare Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Car size={18} className="text-[#05513F]" />
                  <span>{isAr ? 'المركبة وتفاصيل الحجز' : 'Vehicle & Guest Details'}</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isAr ? 'فئة السيارة:' : 'Vehicle Class:'}</span>
                    <span className="font-black text-[#05513F]">{booking.vehicleName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isAr ? 'عدد الركاب والحقائب:' : 'Guests / Luggage:'}</span>
                    <span className="font-bold text-gray-900">{booking.passengers} Pax • {booking.luggage} Bags</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isAr ? 'الضيف الأساسي:' : 'Lead Guest:'}</span>
                    <span className="font-bold text-gray-900">{booking.customerName}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-gray-900 font-bold">{isAr ? 'السعر التقديري:' : 'Total Estimated Fare:'}</span>
                    <span className="text-xl font-black text-[#05513F]">
                      {booking.priceMax && booking.priceMax > booking.price 
                        ? `${booking.price} - ${booking.priceMax} ${booking.currency}`
                        : `${booking.price} ${booking.currency}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Request Callout */}
            {booking.specialRequest && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900">
                <span className="font-bold block mb-1">{isAr ? 'ملاحظات وطلبات خاصة:' : 'Special Instructions:'}</span>
                <p>{booking.specialRequest}</p>
              </div>
            )}

            {/* Live WhatsApp Action Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-[#05513F] text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <h4 className="text-lg font-black">{isAr ? 'تواصل مع منسق الرحلات مباشرة' : 'Need Chauffeur Details or Changes?'}</h4>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-lg">
                  {isAr ? 'فريق العمل متاح على مدار الساعة لتزويدك برقم هاتف السائق، أو تعديل وقت الرحلة، أو تقديم أي مساعدة.' : 'Our 24/7 Dispatch Control is ready on WhatsApp with direct chauffeur number, gate meeting point, and flight updates.'}
                </p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const msg = `Assalamu Alaikum! I am checking the status of my booking #${booking.bookingId} (${booking.pickup} to ${booking.destination}). Please share chauffeur info and flight updates.`;
                  openWhatsApp('booking', msg);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer active:scale-98 transition-all"
              >
                <MessageSquare size={18} />
                <span>{isAr ? 'محادثة المنسق عبر واتساب' : 'Chat on WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidance Section */}
        {!booking && !loading && (
          <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-[#05513F]" />
              <span>{isAr ? 'أسئلة شائعة حول متابعة الحجز' : 'Frequently Asked Questions about Tracking'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'أين أجد رقم الحجز المرجعي؟' : 'Where do I find my Booking ID?'}</h4>
                <p>{isAr ? 'يتم إرسال رقم الحجز بصيغة FUV-2026-XXXXX فور إتمام الحجز في شاشة التأكيد وعبر رسالة الواتساب.' : 'Your Booking Reference (e.g. FUV-2026-88901) is displayed upon submission and sent via WhatsApp confirmation.'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'متى يتم تزويدي برقم وبيانات السائق؟' : 'When will I receive chauffeur contact?'}</h4>
                <p>{isAr ? 'يتم تعيين السائق وتزويدكم برقم جواله ونوع السيارة قبل موعد الرحلة بـ 3 إلى 6 ساعات مع التنسيق المباشر.' : 'Chauffeur details and vehicle plate numbers are assigned and shared 3–6 hours prior to your scheduled pickup time.'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'ماذا لو تأخرت رحلة الطيران؟' : 'What if my flight is delayed?'}</h4>
                <p>{isAr ? 'نقوم بمتابعة رحلتك برقم الرحلة مجاناً، ويشمل الحجز 60 دقيقة انتظار مجاني بعد هبوط الطائرة.' : 'We automatically monitor flight numbers. All airport pickups include 60 minutes of complimentary waiting time after landing.'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-1">{isAr ? 'هل يمكنني تعديل الموعد أو الوجهة؟' : 'Can I modify my booking?'}</h4>
                <p>{isAr ? 'نعم بكل سرور، يمكنك التواصل مع فريق خدمة العملاء على الواتساب على مدار 24 ساعة لتعديل أي تفاصيل.' : 'Yes, modifications are hassle-free. Message our 24/7 team on WhatsApp with your Booking ID to request changes.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
