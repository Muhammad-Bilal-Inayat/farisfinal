import React, { useEffect, useState } from 'react';
import { 
  Search, CheckCircle, Clock, Check, X, Edit, MessageCircle, 
  Plus, Trash2, Phone, Eye, Download, Printer, Filter, 
  MapPin, User, Calendar as CalendarIcon, Banknote, AlertCircle, Sparkles,
  UserCheck, Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingsAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [assigningDriverId, setAssigningDriverId] = useState<string>('');

  const fetchBookingsAndVehicles = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const queryParams = new URLSearchParams({
        status: statusFilter,
        search: search.trim(),
        startDate,
        endDate,
        page: page.toString(),
        limit: limit.toString()
      });

      const [bRes, vRes, dRes] = await Promise.all([
        fetch(`/api/admin/bookings?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/drivers', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (bRes.ok) { 
        const d = await bRes.json();
        if (Array.isArray(d)) {
          setBookings(d);
          setTotalRecords(d.length);
          setTotalPages(1);
        } else if (d && Array.isArray(d.bookings)) {
          setBookings(d.bookings);
          setTotalRecords(d.total || 0);
          setTotalPages(d.totalPages || 1);
        }
      }
      if (vRes.ok) { const d = await vRes.json(); setVehicles(Array.isArray(d) ? d : []); }
      if (dRes.ok) { const d = await dRes.json(); setDrivers(Array.isArray(d) ? d : []); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndVehicles();

    // Auto-refresh every 12 seconds so new website orders appear in real-time
    const interval = setInterval(fetchBookingsAndVehicles, 12000);

    // Also refresh immediately when booking event fires or tab gains focus
    const handleSync = () => fetchBookingsAndVehicles();
    window.addEventListener('faris_bookings_updated', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('faris_bookings_updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [statusFilter, search, startDate, endDate, page, limit]);

  const triggerToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerToast(isAr ? `تم تحديث حالة الحجز إلى: ${status}` : `Booking status updated to ${status}`);
        fetchBookingsAndVehicles();
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status });
        }
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذا الحجز نهائياً؟' : 'Are you sure you want to delete this booking permanently?')) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        triggerToast(isAr ? 'تم حذف الحجز بنجاح' : 'Booking deleted successfully');
        if (selectedBooking?.id === id) setSelectedBooking(null);
        fetchBookingsAndVehicles();
      }
    } catch (e) {
      alert("Failed to delete booking");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/bookings/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        triggerToast(isAr ? 'تم حفظ تعديلات الحجز بنجاح' : 'Booking updated successfully');
        setIsEditing(false);
        fetchBookingsAndVehicles();
        if (selectedBooking?.id === editForm.id) {
          setSelectedBooking({ ...selectedBooking, ...editForm });
        }
      }
    } catch (e) {
      alert("Failed to save changes");
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        triggerToast(isAr ? 'تم إنشاء الحجز بنجاح' : 'Manual booking created successfully');
        setIsCreating(false);
        setEditForm({});
        fetchBookingsAndVehicles();
      }
    } catch (e) {
      alert("Failed to create booking");
    }
  };

  const getCleanPhone = (phoneStr: string) => {
    if (!phoneStr) return '';
    let cleaned = String(phoneStr).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('05') && cleaned.length === 10) {
      cleaned = '966' + cleaned.slice(1);
    }
    return cleaned;
  };

  // Priority: 1. booking.whatsapp -> 2. booking.phone / booking.customerPhone
  const getCustomerPhone = (b: any) => {
    const raw = b.whatsapp || b.phone || b.customerPhone || '';
    return { raw, clean: getCleanPhone(raw) };
  };

  const getDriverPhone = (b: any) => {
    const raw = b.driverPhoneSnapshot || b.driverPhone || '';
    return { raw, clean: getCleanPhone(raw) };
  };

  const handleWhatsAppCustomer = (booking: any) => {
    const { clean } = getCustomerPhone(booking);
    if (!clean) {
      // Only show a manual phone number field if BOTH stored WhatsApp and phone numbers are empty.
      const manual = prompt(
        isAr 
          ? 'رقم الواتساب والهاتف غير مسجلين في هذا الحجز. أدخل رقم هاتف العميل:' 
          : 'No WhatsApp or phone stored with this booking. Enter customer phone number:'
      );
      if (manual) {
        const cleanManual = getCleanPhone(manual);
        if (cleanManual) {
          window.open(`https://wa.me/${cleanManual}`, '_blank');
        }
      }
      return;
    }

    const driverName = booking.driverNameSnapshot || booking.driverName;
    const driverPhone = booking.driverPhoneSnapshot || booking.driverPhone;

    const message = isAr
      ? `السلام عليكم ورحمة الله وبركاته ${booking.customerName || ''}\nتحية طيبة من شركة فارس لنقل المعتمرين (Faris VIP Umrah Transport).\n\n📌 *بيانات الحجز:* #${booking.bookingId || `ID #${booking.id}`}\n📍 *المسار:* ${booking.pickup} ➔ ${booking.destination}\n📅 *الموعد:* ${booking.date || 'حسب التنسيق'} ${booking.time ? `في تمام ${booking.time}` : ''}\n🚗 *المركبة:* ${booking.vehicleNameSnapshot || 'VIP Vehicle'}\n💵 *السعر الإجمالي:* ${booking.price || 0} ر.س\nالحالة: *${booking.status || 'Confirmed'}*${driverName ? `\n\n👤 *السائق المعين:* ${driverName}\n📱 *هاتف السائق:* ${driverPhone || 'سيتواصل معكم'}` : ''}\n\nنسعد بخدمتكم ونتمنى لكم عمرة مقبولة ورحلة مباركة.`
      : `Assalamu Alaykum ${booking.customerName || 'Valued Guest'},\nGreetings from Faris VIP Umrah Transport.\n\n📌 *Booking Reference:* #${booking.bookingId || `ID #${booking.id}`}\n📍 *Route:* ${booking.pickup} ➔ ${booking.destination}\n📅 *Schedule:* ${booking.date || 'TBD'} ${booking.time ? `at ${booking.time}` : ''}\n🚗 *Vehicle:* ${booking.vehicleNameSnapshot || 'VIP Vehicle'}\n💵 *Fare:* ${booking.price || 0} SAR\nStatus: *${booking.status || 'Confirmed'}*${driverName ? `\n\n👤 *Assigned Chauffeur:* ${driverName}\n📱 *Chauffeur Phone:* ${driverPhone || 'Will contact you'}` : ''}\n\nWe look forward to serving you with honor and excellence.`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsAppDriver = (booking: any) => {
    const { clean } = getDriverPhone(booking);
    const driverName = booking.driverNameSnapshot || booking.driverName || 'Captain';
    if (!clean) {
      alert(isAr ? 'لا يوجد رقم هاتف مسجل للسائق المعين' : 'No phone number for assigned driver');
      return;
    }

    const custPhone = booking.whatsapp || booking.phone || booking.customerPhone || 'N/A';
    const message = isAr
      ? `السلام عليكم كابتن ${driverName}، لديك مهمة نقل معتمرين من شركة فارس:\n\n📌 *رقم الحجز:* #${booking.bookingId || booking.id}\n👤 *اسم الضيف:* ${booking.customerName || 'Guest'}\n📱 *هاتف الضيف:* ${custPhone}\n📍 *الانطلاق:* ${booking.pickup}\n🏁 *الوصول:* ${booking.destination}\n📅 *التاريخ:* ${booking.date}\n⏰ *الوقت:* ${booking.time || 'في الموعد المتفق عليه'}\n👥 *الركاب:* ${booking.passengers || 1} ركاب - حقائب: ${booking.luggage || 0}\n💵 *السعر:* ${booking.price} ر.س\n\nيرجى التواصل مع الضيف والتواجد في الموقع قبل الموعد بنصف ساعة.`
      : `Salam Captain ${driverName}, new VIP dispatch mission from Faris Umrah Transport:\n\n📌 *Booking Ref:* #${booking.bookingId || booking.id}\n👤 *Guest:* ${booking.customerName || 'Guest'}\n📱 *Guest Contact:* ${custPhone}\n📍 *Pickup:* ${booking.pickup}\n🏁 *Dropoff:* ${booking.destination}\n📅 *Date:* ${booking.date}\n⏰ *Time:* ${booking.time || 'As scheduled'}\n👥 *Pax:* ${booking.passengers || 1} | Luggage: ${booking.luggage || 0}\n💵 *Fare:* ${booking.price} SAR\n\nPlease contact the guest and arrive 30 mins early.`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAssignDriver = async (bookingId: number, driverIdStr: string) => {
    if (!driverIdStr) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const targetDriver = drivers.find(d => String(d.id) === String(driverIdStr));
    if (!targetDriver) return;

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/assign-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId: targetDriver.id,
          driverName: targetDriver.name,
          driverPhone: targetDriver.phone,
          driverPlate: targetDriver.vehicleInfo || '',
          status: 'Chauffeur Assigned'
        })
      });

      if (res.ok) {
        triggerToast(isAr ? `تم تعيين السائق ${targetDriver.name} بنجاح` : `Driver ${targetDriver.name} assigned successfully`);
        await fetchBookingsAndVehicles();
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking((prev: any) => ({
            ...prev,
            driverId: targetDriver.id,
            driverNameSnapshot: targetDriver.name,
            driverPhoneSnapshot: targetDriver.phone,
            driverName: targetDriver.name,
            driverPhone: targetDriver.phone,
            driverPlate: targetDriver.vehicleInfo || '',
            status: 'Chauffeur Assigned'
          }));
        }
      } else {
        alert("Failed to assign driver");
      }
    } catch (e) {
      alert("Error assigning driver");
    }
  };

  const activeDrivers = drivers;

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['ID', 'Reference', 'Guest Name', 'Phone', 'Email', 'Pickup', 'Destination', 'Date', 'Time', 'Vehicle', 'Fare SAR', 'Passengers', 'Luggage', 'Status', 'Special Requests'];
    const rows = bookings.map(b => [
      b.id,
      `"${b.bookingId || ''}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(b.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(b.pickup || '').replace(/"/g, '""')}"`,
      `"${(b.destination || '').replace(/"/g, '""')}"`,
      b.date || '',
      b.time || '',
      `"${(b.vehicleNameSnapshot || '').replace(/"/g, '""')}"`,
      b.price || 0,
      b.passengers || 1,
      b.luggage || 0,
      b.status || 'Pending',
      `"${(b.specialRequests || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = bookings;

  const counts = {
    all: totalRecords,
    pending: bookings.filter(b => (b.status || 'Pending').toLowerCase() === 'pending').length,
    confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    completed: bookings.filter(b => b.status?.toLowerCase() === 'completed').length,
    cancelled: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-[var(--color-saudi-emerald)] text-white shadow-lg flex items-center justify-between text-sm font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'إدارة وجدولة الحجوزات' : 'Booking Dispatch & Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'متابعة، تأكيد، تعديل، وإرسال إشعارات الواتساب لضيوف الرحمن' : 'Review, confirm, edit, and dispatch transfers with real-time WhatsApp updates'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Export CSV Button */}
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          {/* Add Manual Booking Button */}
          <button 
            onClick={() => {
              setEditForm({
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                pickup: 'Jeddah Airport (JED)',
                destination: 'Makkah Hotel',
                date: new Date().toISOString().split('T')[0],
                time: '14:00',
                vehicleId: vehicles[0]?.id || '',
                vehicleNameSnapshot: vehicles[0]?.name || 'VIP Sedan',
                price: 250,
                passengers: 2,
                luggage: 2,
                status: 'Confirmed',
                specialRequests: ''
              });
              setIsCreating(true);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{isAr ? '+ حجز يدوي جديد' : '+ New Booking'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Box */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All', count: counts.all, color: 'bg-slate-100 text-slate-800' },
            { id: 'pending', label: isAr ? 'قيد الانتظار' : 'Pending', count: counts.pending, color: 'bg-yellow-500 text-white' },
            { id: 'confirmed', label: isAr ? 'مؤكد' : 'Confirmed', count: counts.confirmed, color: 'bg-gray-200 text-gray-900' },
            { id: 'completed', label: isAr ? 'مكتمل' : 'Completed', count: counts.completed, color: 'bg-blue-100 text-blue-800' },
            { id: 'cancelled', label: isAr ? 'ملغي' : 'Cancelled', count: counts.cancelled, color: 'bg-red-100 text-red-800' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[var(--color-saudi-emerald)] text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-800'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم، الرقم، المسار...' : 'Search booking, guest, route...'} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] focus:border-transparent outline-none transition-all" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Date Range & Server Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{isAr ? 'من تاريخ:' : 'From:'}</span>
            <input 
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>{isAr ? 'إلى:' : 'To:'}</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          {(startDate || endDate || search || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearch('');
                setStatusFilter('all');
                setPage(1);
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          {isAr ? `إجمالي الحجوزات: ${totalRecords}` : `Total Records: ${totalRecords}`}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'بيانات الحجز' : 'Booking Info'}</th>
                <th className="p-4">{isAr ? 'الضيف ومعلومات الاتصال' : 'Guest & Contact'}</th>
                <th className="p-4">{isAr ? 'المسار والجدول' : 'Route & Schedule'}</th>
                <th className="p-4">{isAr ? 'السيارة والسعر' : 'Vehicle & Fare'}</th>
                <th className="p-4">{isAr ? 'السائق المعين' : 'Assigned Driver'}</th>
                <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-right">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري تحميل الحجوزات...' : 'Loading bookings...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={28} className="text-slate-300" />
                      <span className="font-semibold">{isAr ? 'لم يتم العثور على أي حجوزات مطابقة' : 'No bookings found matching criteria'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    {/* Booking ID & Time */}
                    <td className="p-4">
                      <div className="font-extrabold text-[var(--color-saudi-emerald)] flex items-center gap-1.5">
                        <span>{b.bookingId || `ID #${b.id}`}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Direct'}
                      </div>
                    </td>

                    {/* Guest Details */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.customerName || 'Guest'}</div>
                      {(() => {
                        const { raw, clean } = getCustomerPhone(b);
                        if (!raw) return <div className="text-xs text-slate-400 mt-0.5">-</div>;
                        return (
                          <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            {clean ? (
                              <a
                                href={`https://wa.me/${clean}`}
                                target="_blank"
                                rel="noreferrer"
                                title={isAr ? 'مراسلة العميل عبر واتساب' : 'Open WhatsApp Chat'}
                                className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
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
                      {b.customerEmail && <div className="text-[11px] text-slate-400">{b.customerEmail}</div>}
                    </td>

                    {/* Route & Schedule */}
                    <td className="p-4">
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin size={13} className="text-gray-600 shrink-0" />
                        <span>{b.pickup} ➔ {b.destination}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <CalendarIcon size={12} className="text-slate-400" />
                        <span>{b.date || 'Flexible'} {b.time && `• ${b.time}`}</span>
                      </div>
                    </td>

                    {/* Vehicle & Price */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 text-xs">{b.vehicleNameSnapshot || 'VIP Transfer'}</div>
                      <div className="font-extrabold text-sm text-[var(--color-saudi-emerald)] mt-0.5">
                        {b.price} SAR
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.passengers || 1} Pax • {b.luggage || 0} Bags
                      </div>
                    </td>

                    {/* Assigned Driver */}
                    <td className="p-4">
                      {b.driverNameSnapshot || b.driverName ? (
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                            <UserCheck size={13} className="text-emerald-700 shrink-0" />
                            <span>{b.driverNameSnapshot || b.driverName}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            {b.driverPhoneSnapshot || b.driverPhone || '-'}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWhatsAppDriver(b)}
                            title={isAr ? 'مراسلة السائق عبر واتساب' : 'WhatsApp Driver'}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                          >
                            <MessageCircle size={11} className="text-emerald-700" />
                            <span>{isAr ? 'واتساب السائق' : 'WhatsApp Driver'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">
                            {isAr ? 'لم يُعين' : 'Unassigned'}
                          </span>
                          {activeDrivers.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                              className="block w-full max-w-[145px] text-[10px] border border-slate-300 rounded p-1 bg-white font-medium text-slate-700 cursor-pointer shadow-2xs hover:border-emerald-600"
                            >
                              <option value="">{isAr ? '+ تعيين سائق' : '+ Assign Driver'}</option>
                              {activeDrivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Badge & Quick Action Dropdown */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block shadow-2xs whitespace-nowrap ${
                          b.status?.toLowerCase() === 'confirmed' ? 'bg-[var(--color-saudi-green)] text-white border border-[var(--color-saudi-emerald)]' :
                          b.status?.toLowerCase().includes('chauffeur') || b.status?.toLowerCase().includes('driver') ? 'bg-indigo-600 text-white border border-indigo-700' :
                          b.status?.toLowerCase() === 'completed' ? 'bg-blue-600 text-white border border-blue-700' :
                          b.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white border border-red-700' :
                          b.status?.toLowerCase() === 'in progress' ? 'bg-amber-600 text-white border border-amber-700' :
                          'bg-yellow-500 text-white border border-yellow-600'
                        }`}>
                          {b.status || 'Pending'}
                        </span>
                        <div>
                          <select
                            value={b.status || 'Pending'}
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            title={isAr ? 'تحديث سريع للحالة' : 'Quick Status Update'}
                            className="text-[11px] font-bold border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 cursor-pointer shadow-2xs hover:border-emerald-600 outline-none"
                          >
                            <option value="Pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
                            <option value="Confirmed">{isAr ? 'مؤكد (Confirmed)' : 'Confirmed'}</option>
                            <option value="In Progress">{isAr ? 'جاري التنفيذ (In Progress)' : 'In Progress'}</option>
                            <option value="Completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
                            <option value="Cancelled">{isAr ? 'ملغي (Cancelled)' : 'Cancelled'}</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* WhatsApp Customer Button (Directly opens WhatsApp using stored number, no popup) */}
                        <button 
                          onClick={() => handleWhatsAppCustomer(b)} 
                          title={isAr ? 'مراسلة العميل عبر واتساب بالرقم المخزن' : 'WhatsApp Customer (Uses Stored Phone)'}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                        >
                          <MessageCircle size={13} />
                          <span className="whitespace-nowrap">{isAr ? 'واتساب العميل' : 'WhatsApp Customer'}</span>
                        </button>

                        {/* View Voucher / Details */}
                        <button 
                          onClick={() => {
                            setSelectedBooking(b);
                            setAssigningDriverId(b.driverId ? String(b.driverId) : '');
                          }} 
                          title={isAr ? 'عرض التفاصيل وتعيين السائق' : 'View Details & Assign Driver'}
                          className="p-1.5 text-slate-700 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Quick Confirm */}
                        {b.status?.toLowerCase() !== 'confirmed' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Confirmed')} 
                            title={isAr ? 'تأكيد الحجز' : 'Confirm Booking'}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                          >
                            <Check size={15} />
                          </button>
                        )}

                        {/* Quick Cancel */}
                        {b.status?.toLowerCase() !== 'cancelled' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Cancelled')} 
                            title={isAr ? 'إلغاء الحجز' : 'Cancel Booking'}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-amber-200"
                          >
                            <X size={15} />
                          </button>
                        )}

                        {/* Edit Booking */}
                        <button 
                          onClick={() => {
                            setEditForm({ 
                              ...b, 
                              customerPhone: b.customerPhone || b.whatsapp || b.phone || '' 
                            });
                            setIsEditing(true);
                          }} 
                          title={isAr ? 'تعديل الحجز' : 'Edit Booking'}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-blue-200"
                        >
                          <Edit size={15} />
                        </button>

                        {/* Delete Booking */}
                        <button 
                          onClick={() => handleDelete(b.id)} 
                          title={isAr ? 'حذف الحجز' : 'Delete Booking'}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600">
            {isAr ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAr ? 'السابق' : 'Previous'}
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAr ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS / VOUCHER MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {isAr ? 'سند تأكيد حجز VIP' : 'Official VIP Booking Voucher'}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedBooking.bookingId || `ID #${selectedBooking.id}`}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Status Header Pill */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span>{isAr ? 'الحالة الحالية:' : 'Current Status:'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    selectedBooking.status?.toLowerCase() === 'confirmed' ? 'bg-[var(--color-saudi-green)] text-white' :
                    selectedBooking.status?.toLowerCase() === 'completed' ? 'bg-blue-600 text-white' :
                    selectedBooking.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {selectedBooking.status || 'Pending'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{isAr ? 'السعر المتفق عليه' : 'Agreed Fare'}</div>
                  <div className="text-xl font-extrabold text-[var(--color-saudi-emerald)]">{selectedBooking.price} SAR</div>
                </div>
              </div>

              {/* Customer & Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Customer Information */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">{isAr ? 'بيانات العميل' : 'Customer Information'}</span>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppCustomer(selectedBooking)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageCircle size={12} />
                      <span>{isAr ? 'واتساب العميل' : 'WhatsApp Customer'}</span>
                    </button>
                  </div>
                  <div><strong className="text-slate-800">{isAr ? 'الاسم:' : 'Name:'}</strong> {selectedBooking.customerName || 'N/A'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'الهاتف:' : 'Phone:'}</strong> {selectedBooking.customerPhone || selectedBooking.phone || 'N/A'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'الواتساب:' : 'WhatsApp:'}</strong> {selectedBooking.whatsapp || selectedBooking.customerPhone || selectedBooking.phone || 'N/A'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'البريد:' : 'Email:'}</strong> {selectedBooking.customerEmail || 'N/A'}</div>
                </div>

                {/* 2. Trip Information */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 uppercase tracking-wider">{isAr ? 'بيانات الرحلة' : 'Trip Information'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'المركبة:' : 'Vehicle:'}</strong> {selectedBooking.vehicleNameSnapshot || 'VIP Vehicle'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</strong> {selectedBooking.date} at {selectedBooking.time || 'Flexible'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'السعر المتفق عليه:' : 'Price:'}</strong> <span className="font-bold text-emerald-700">{selectedBooking.price} SAR</span></div>
                  <div><strong className="text-slate-800">{isAr ? 'السعة:' : 'Capacity:'}</strong> {selectedBooking.passengers || 1} {isAr ? 'ركاب' : 'Passengers'}, {selectedBooking.luggage || 0} {isAr ? 'حقائب' : 'Luggage'}</div>
                </div>
              </div>

              {/* Route Display */}
              <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200 text-xs">
                <div className="font-bold text-slate-800 mb-2">{isAr ? 'خط سير الرحلة' : 'Trip Route'}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2.5 rounded-lg bg-white border border-gray-200 font-semibold text-slate-800">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">{isAr ? 'نقطة الانطلاق' : 'Pickup Location'}</span>
                    {selectedBooking.pickup}
                  </div>
                  <div className="text-gray-500 font-bold">➔</div>
                  <div className="flex-1 p-2.5 rounded-lg bg-white border border-gray-200 font-semibold text-slate-800">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">{isAr ? 'نقطة الوصول' : 'Destination'}</span>
                    {selectedBooking.destination}
                  </div>
                </div>
              </div>

              {/* Special Requests / Notes */}
              {selectedBooking.specialRequests && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                  <div className="font-bold text-amber-900 mb-1">{isAr ? 'ملاحظات ورقم الرحلة الجوية' : 'Flight Number & Special Requests'}</div>
                  <p className="text-amber-800 whitespace-pre-wrap">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* 3. Driver Information & Assignment Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User size={15} className="text-emerald-700" />
                    <span>{isAr ? 'بيانات السائق' : 'Driver Information'}</span>
                  </div>
                  {(selectedBooking.driverNameSnapshot || selectedBooking.driverName) && (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppDriver(selectedBooking)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageCircle size={12} />
                      <span>{isAr ? 'واتساب السائق' : 'WhatsApp Driver'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                  <div><strong>{isAr ? 'اسم السائق:' : 'Driver Name:'}</strong> {selectedBooking.driverNameSnapshot || selectedBooking.driverName || (isAr ? 'لم يُحدد بعد' : 'Not assigned yet')}</div>
                  <div><strong>{isAr ? 'رقم الهاتف:' : 'Phone / WhatsApp:'}</strong> {selectedBooking.driverPhoneSnapshot || selectedBooking.driverPhone || 'N/A'}</div>
                  <div><strong>{isAr ? 'المركبة / اللوحة:' : 'Vehicle / Plate:'}</strong> {selectedBooking.driverPlate || 'N/A'}</div>
                </div>

                {/* Assign Driver Dropdown */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700">{isAr ? 'تعيين السائق:' : 'Assign Driver:'}</span>
                  <select
                    value={assigningDriverId}
                    onChange={(e) => setAssigningDriverId(e.target.value)}
                    className="flex-1 min-w-[200px] border border-slate-300 rounded-lg p-2 text-xs font-medium bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">{isAr ? '-- اختر سائقاً نشطاً --' : '-- Select Active Driver --'}</option>
                    {activeDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone}) {d.vehicleInfo ? `- ${d.vehicleInfo}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!assigningDriverId) {
                        alert(isAr ? 'يرجى اختيار سائق من القائمة أولاً' : 'Please select a driver from the dropdown first');
                        return;
                      }
                      handleAssignDriver(selectedBooking.id, assigningDriverId);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    {isAr ? 'حفظ وتعيين السائق' : 'Save / Assign Driver'}
                  </button>
                </div>
              </div>

              {/* 4. Booking Status Actions (No prompt asking for phone/WhatsApp) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isAr ? 'تغيير حالة الحجز (Booking Status)' : 'Booking Status Actions'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {selectedBooking.status || 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedBooking.id, 'Confirmed')}
                    className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedBooking.status?.toLowerCase() === 'confirmed'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                    }`}
                  >
                    {isAr ? 'تأكيد (Confirmed)' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedBooking.id, 'In Progress')}
                    className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedBooking.status?.toLowerCase() === 'in progress'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                    }`}
                  >
                    {isAr ? 'قيد التنفيذ (In Progress)' : 'In Progress'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedBooking.id, 'Completed')}
                    className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedBooking.status?.toLowerCase() === 'completed'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                    }`}
                  >
                    {isAr ? 'مكتمل (Completed)' : 'Completed'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedBooking.id, 'Cancelled')}
                    className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      selectedBooking.status?.toLowerCase() === 'cancelled'
                        ? 'bg-red-600 text-white border-red-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                    }`}
                  >
                    {isAr ? 'إلغاء (Cancelled)' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleWhatsAppCustomer(selectedBooking)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle size={14} />
                  <span>{isAr ? 'واتساب العميل' : 'WhatsApp Customer'}</span>
                </button>
                {(selectedBooking.driverNameSnapshot || selectedBooking.driverName) && (
                  <button 
                    onClick={() => handleWhatsAppDriver(selectedBooking)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle size={14} />
                    <span>{isAr ? 'واتساب السائق' : 'WhatsApp Driver'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BOOKING MODAL */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              {isCreating 
                ? (isAr ? 'إنشاء حجز يدوي جديد' : 'Create New Manual Booking') 
                : (isAr ? 'تعديل بيانات الحجز' : 'Edit Booking Details')}
            </h2>

            <form onSubmit={isCreating ? handleCreateBooking : handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'اسم العميل' : 'Guest Name'}</label>
                  <input 
                    type="text" 
                    value={editForm.customerName || ''} 
                    onChange={e => setEditForm({ ...editForm, customerName: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}</label>
                  <input 
                    type="text" 
                    value={editForm.customerPhone || ''} 
                    onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })} 
                    placeholder="+966 5X XXX XXXX"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'نقطة الانطلاق' : 'Pickup Location'}</label>
                  <input 
                    type="text" 
                    value={editForm.pickup || ''} 
                    onChange={e => setEditForm({ ...editForm, pickup: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الوجهة' : 'Destination'}</label>
                  <input 
                    type="text" 
                    value={editForm.destination || ''} 
                    onChange={e => setEditForm({ ...editForm, destination: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'التاريخ' : 'Date'}</label>
                  <input 
                    type="date" 
                    value={editForm.date || ''} 
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الوقت' : 'Time'}</label>
                  <input 
                    type="time" 
                    value={editForm.time || ''} 
                    onChange={e => setEditForm({ ...editForm, time: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'السعر (ريال)' : 'Price (SAR)'}</label>
                  <input 
                    type="number" 
                    value={editForm.price || 0} 
                    onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'المركبة' : 'Vehicle'}</label>
                  <select 
                    value={editForm.vehicleId || ''} 
                    onChange={e => {
                      const v = vehicles.find(item => item.id === Number(e.target.value));
                      setEditForm({ 
                        ...editForm, 
                        vehicleId: e.target.value,
                        vehicleNameSnapshot: v ? v.name : editForm.vehicleNameSnapshot 
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  >
                    <option value="">{isAr ? '-- اختر سيارة --' : '-- Select Vehicle --'}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الركاب' : 'Passengers'}</label>
                  <input 
                    type="number" 
                    value={editForm.passengers || 1} 
                    onChange={e => setEditForm({ ...editForm, passengers: parseInt(e.target.value) || 1 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    min={1} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الحالة' : 'Status'}</label>
                  <select 
                    value={editForm.status || 'Confirmed'} 
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  >
                    <option value="Confirmed">{isAr ? 'مؤكد (Step 2)' : 'Confirmed (Step 2)'}</option>
                    <option value="Chauffeur Assigned">{isAr ? 'تم تعيين السائق (Step 3: Chauffeur Assigned)' : 'Chauffeur Assigned (Step 3)'}</option>
                    <option value="Completed">{isAr ? 'مكتمل (Step 4: Trip Completed)' : 'Completed (Step 4)'}</option>
                    <option value="Pending">{isAr ? 'قيد الانتظار (Step 1)' : 'Pending (Step 1)'}</option>
                    <option value="Cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>
              </div>

              {/* Chauffeur / Driver Assignment */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User size={14} className="text-emerald-700" />
                    <span>{isAr ? 'تخصيص بيانات السائق (Driver Assignment)' : 'Driver Allocation'}</span>
                  </div>
                  {activeDrivers.length > 0 && (
                    <select
                      value={editForm.driverId ? String(editForm.driverId) : ''}
                      onChange={(e) => {
                        const dId = e.target.value;
                        if (!dId) {
                          setEditForm({
                            ...editForm,
                            driverId: null,
                            driverNameSnapshot: '',
                            driverPhoneSnapshot: '',
                            driverName: '',
                            driverPhone: '',
                            driverPlate: ''
                          });
                          return;
                        }
                        const selected = activeDrivers.find(d => String(d.id) === dId);
                        if (selected) {
                          setEditForm({
                            ...editForm,
                            driverId: selected.id,
                            driverNameSnapshot: selected.name,
                            driverPhoneSnapshot: selected.phone,
                            driverName: selected.name,
                            driverPhone: selected.phone,
                            driverPlate: selected.vehicleInfo || '',
                            status: editForm.status === 'Pending' ? 'Chauffeur Assigned' : editForm.status
                          });
                        }
                      }}
                      className="text-[11px] border border-slate-300 rounded-md p-1 bg-white font-medium text-slate-700"
                    >
                      <option value="">{isAr ? '-- اختر من قائمة السائقين --' : '-- Choose from Active Drivers --'}</option>
                      {activeDrivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{isAr ? 'اسم السائق' : 'Driver Name'}</label>
                    <input 
                      type="text" 
                      value={editForm.driverName || ''} 
                      onChange={e => setEditForm({ ...editForm, driverName: e.target.value, driverNameSnapshot: e.target.value })} 
                      placeholder="e.g. Captain Tariq"
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{isAr ? 'رقم هاتف السائق' : 'Driver Phone'}</label>
                    <input 
                      type="text" 
                      value={editForm.driverPhone || ''} 
                      onChange={e => setEditForm({ ...editForm, driverPhone: e.target.value, driverPhoneSnapshot: e.target.value })} 
                      placeholder="+966 5X XXX XXXX"
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{isAr ? 'لوحة السيارة / الموديل' : 'Vehicle Plate / Car'}</label>
                    <input 
                      type="text" 
                      value={editForm.driverPlate || ''} 
                      onChange={e => setEditForm({ ...editForm, driverPlate: e.target.value })} 
                      placeholder="e.g. أ ب ج 1234 (GMC XL)"
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'ملاحظات خاصة / رقم الرحلة الجوية' : 'Special Requests & Flight Info'}</label>
                <textarea 
                  value={editForm.specialRequests || ''} 
                  onChange={e => setEditForm({ ...editForm, specialRequests: e.target.value })} 
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none h-20"
                  placeholder={isAr ? 'مثال: رحلة الخطوط السعودية رقم SV123، مقعد أطفال...' : 'e.g. Flight SV123 arriving 5 PM, child car seat required...'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setIsCreating(false); }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  {isAr ? 'حفظ البيانات' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
