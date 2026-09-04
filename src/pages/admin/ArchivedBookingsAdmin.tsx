import React, { useState, useEffect } from 'react';
import { 
  Archive, Calendar, Search, Phone, MessageCircle, FileText, CheckCircle2, 
  Trash2, RefreshCw, ShieldCheck, Clock, ArrowRight, Download, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ArchivedBookingsAdmin() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchArchivedBookings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      const res = await fetch(`/api/admin/archived-bookings?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch archived bookings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedBookings();
  }, [page]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRunArchiveUtility = async () => {
    if (!confirm(
      isAr 
        ? 'هل أنت متأكد من تشغيل أداة الأرشفة؟ سيتم نقل جميع الحجوزات الأقدم من 90 يوماً تلقائياً إلى جدول الأرشيف للحفاظ على سرعة النظام.' 
        : 'Are you sure you want to run the 90-day archive utility? Bookings older than 90 days will be moved to the archive collection.'
    )) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setArchiving(true);
    try {
      const res = await fetch('/api/admin/bookings/archive-older-than-90-days', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(data.message || (isAr ? 'تمت أرشفة الحجوزات القديمة بنجاح' : 'Old bookings successfully archived'));
        fetchArchivedBookings();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to archive bookings');
      }
    } catch (e) {
      alert("Network error executing archive utility");
    } finally {
      setArchiving(false);
    }
  };

  const getCustomerPhone = (b: any) => {
    const raw = b.customerPhone || b.whatsapp || b.phone || '';
    const clean = raw.replace(/[^0-9]/g, '');
    return { raw, clean };
  };

  const filteredBookings = bookings.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.pickup || '').toLowerCase().includes(q) ||
      (b.destination || '').toLowerCase().includes(q) ||
      (b.vehicleType || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[var(--color-dark-charcoal)] to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
            <Archive size={13} />
            <span>{isAr ? 'أرشيف الحجوزات التاريخية (أكثر من 90 يوماً)' : 'Historical Archive (90+ Days)'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isAr ? 'إدارة أرشيف الحجوزات' : 'Archived Bookings Management'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            {isAr 
              ? 'الجدول المخصص لحفظ وإدارة الحجوزات المؤرشفة. يحافظ على جدول الحجوزات الرئيسي خفيفاً وسريعاً بينما يتيح لك الوصول الكامل لأي سجل تاريخي.' 
              : 'Dedicated archive for bookings older than 90 days. Keeps the main bookings table lightning-fast and clutter-free while retaining full historical access.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunArchiveUtility}
            disabled={archiving}
            className="px-5 py-3 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Archive size={16} className={archiving ? 'animate-bounce' : ''} />
            <span>{isAr ? 'تشغيل أداة أرشفة الحجوزات (> 90 يوم)' : 'Run 90-Day Archive Utility'}</span>
          </button>
          <button
            onClick={fetchArchivedBookings}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15 cursor-pointer"
            title={isAr ? 'تحديث القائمة' : 'Refresh Archive'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث برقم الحجز، العميل، أو المسار...' : 'Search booking id, client, or route...'}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 text-slate-800 w-72 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="text-xs font-bold text-slate-600">
          {isAr ? `إجمالي الحجوزات المؤرشفة: ${totalRecords}` : `Total Archived Records: ${totalRecords}`}
        </div>
      </div>

      {/* Archived Bookings Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'معرف الحجز' : 'Booking ID'}</th>
                <th className="p-4">{isAr ? 'العميل' : 'Customer'}</th>
                <th className="p-4">{isAr ? 'المسار' : 'Route'}</th>
                <th className="p-4">{isAr ? 'السيارة' : 'Vehicle'}</th>
                <th className="p-4">{isAr ? 'تاريخ الرحلة' : 'Trip Date'}</th>
                <th className="p-4">{isAr ? 'المبلغ' : 'Price'}</th>
                <th className="p-4">{isAr ? 'تاريخ الأرشفة' : 'Archived At'}</th>
                <th className="p-4 text-right">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري تحميل الأرشيف...' : 'Loading archived bookings...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Archive size={36} className="text-slate-300" />
                      <span className="font-semibold">{isAr ? 'لا توجد حجوزات مؤرشفة مطابقة' : 'No archived bookings found'}</span>
                      <span className="text-xs text-slate-400">
                        {isAr ? 'الحجوزات التي تقادم عليها أكثر من 90 يوماً ستظهر هنا تلقائياً.' : 'Bookings older than 90 days will automatically appear here once archived.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-extrabold text-slate-900 font-mono">
                      {b.bookingId}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.customerName || 'Guest'}</div>
                      {(() => {
                        const { raw, clean } = getCustomerPhone(b);
                        if (!raw) return <div className="text-xs text-slate-400">-</div>;
                        return (
                          <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            {clean ? (
                              <a
                                href={`https://wa.me/${clean}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <span>{raw}</span>
                                <MessageCircle size={11} className="text-emerald-600 shrink-0" />
                              </a>
                            ) : (
                              <span>{raw}</span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-900">{b.pickup}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <ArrowRight size={10} className="text-slate-400" />
                        <span>{b.destination}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                        {b.vehicleNameSnapshot || 'VIP Vehicle'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-700">
                      <div>{b.date}</div>
                      <div className="text-[11px] text-slate-400">{b.time}</div>
                    </td>
                    <td className="p-4 font-bold text-[var(--color-saudi-emerald)]">
                      {b.price} SAR
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {b.archivedAt ? new Date(b.archivedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-600">
              {isAr ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAr ? 'السابق' : 'Previous'}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAr ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Archive size={18} className="text-[var(--color-saudi-emerald)]" />
                  <span>{isAr ? 'تفاصيل الحجز المؤرشف' : 'Archived Booking Details'}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {selectedBooking.bookingId}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Customer Name</span>
                  <span className="font-bold text-slate-800">{selectedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Phone / WhatsApp</span>
                  <span className="font-bold text-slate-800">{selectedBooking.phone || selectedBooking.whatsapp || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Pickup Location</span>
                  <span className="font-bold text-slate-800">{selectedBooking.pickup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Destination</span>
                  <span className="font-bold text-slate-800">{selectedBooking.destination}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">Vehicle</span>
                  <span className="font-bold text-slate-800">{selectedBooking.vehicleNameSnapshot || 'VIP Vehicle'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Trip Date</span>
                  <span className="font-bold text-slate-800">{selectedBooking.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Total Price</span>
                  <span className="font-bold text-[var(--color-saudi-emerald)]">{selectedBooking.price} SAR</span>
                </div>
              </div>

              {selectedBooking.specialRequest && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-1">Customer Notes</span>
                  <p className="text-slate-700 font-medium italic">{selectedBooking.specialRequest}</p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 text-right pt-2 border-t border-slate-100">
                Archived at: {new Date(selectedBooking.archivedAt).toLocaleString()}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
