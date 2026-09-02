import React, { useEffect, useState } from 'react';
import { 
  Search, CheckCircle, Clock, Check, X, Edit, MessageCircle, 
  Plus, Trash2, Phone, Eye, Download, Printer, Filter, 
  MapPin, User, Calendar as CalendarIcon, Banknote, AlertCircle, Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BookingsAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookingsAndVehicles = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const [bRes, vRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/vehicles', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (bRes.ok) { const d = await bRes.json(); setBookings(Array.isArray(d) ? d : []); }
      if (vRes.ok) { const d = await vRes.json(); setVehicles(Array.isArray(d) ? d : []); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndVehicles();
  }, []);

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

  const handleWhatsApp = async (booking: any) => {
    try {
      const res = await fetch('/api/whatsapp');
      const settings = await res.json();
      const phone = booking.customerPhone || booking.phone || booking.whatsapp || '';
      if (!phone) {
        alert(isAr ? 'لا يوجد رقم هاتف مسجل لهذا العميل' : 'No phone number for this booking');
        return;
      }
      
      const headerText = settings.confirmationMessage || "Salam Alaykum! Your VIP transportation booking with Umrah VIP Transport is received.";
      const message = `${headerText}\n\n*Booking Reference:* ${booking.bookingId || `ID #${booking.id}`}\n*Lead Guest:* ${booking.customerName || 'Valued Guest'}\n*Route:* ${booking.pickup} ➔ ${booking.destination}\n*Vehicle:* ${booking.vehicleNameSnapshot || 'VIP Chauffeur'}\n*Date & Time:* ${booking.date || 'TBD'} ${booking.time ? `at ${booking.time}` : ''}\n*Passengers / Luggage:* ${booking.passengers || 1} Pax, ${booking.luggage || 0} Bags\n*Estimated Total Fare:* ${booking.price || 0} SAR\n*Status:* ${booking.status || 'Confirmed'}\n\nOur licensed chauffeur will greet you on time. Please let us know if you need any adjustments.`;
      
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } catch (e) {
      alert("Failed to generate WhatsApp dispatch link");
    }
  };

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

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      (b.bookingId || '').toLowerCase().includes(search.toLowerCase()) || 
      (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone || '').includes(search) ||
      (b.pickup || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.destination || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return (b.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
  });

  const counts = {
    all: bookings.length,
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
                <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-right">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[var(--color-saudi-emerald)] border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جاري تحميل الحجوزات...' : 'Loading bookings...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
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
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{b.customerPhone || b.phone || '-'}</span>
                      </div>
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

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-2xs ${
                        b.status?.toLowerCase() === 'confirmed' ? 'bg-[var(--color-saudi-green)] text-white border border-[var(--color-saudi-emerald)]' :
                        b.status?.toLowerCase() === 'completed' ? 'bg-blue-600 text-white border border-blue-700' :
                        b.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white border border-red-700' :
                        'bg-yellow-500 text-white border border-yellow-600'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Voucher / Details */}
                        <button 
                          onClick={() => setSelectedBooking(b)} 
                          title={isAr ? 'عرض التفاصيل والسند' : 'View Details & Voucher'}
                          className="p-2 text-slate-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>

                        {/* WhatsApp Dispatch */}
                        <button 
                          onClick={() => handleWhatsApp(b)} 
                          title={isAr ? 'إرسال تأكيد عبر واتساب' : 'Dispatch via WhatsApp'}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle size={16} />
                        </button>

                        {/* Quick Confirm */}
                        {b.status?.toLowerCase() !== 'confirmed' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Confirmed')} 
                            title={isAr ? 'تأكيد الحجز' : 'Confirm Booking'}
                            className="p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        {/* Quick Cancel */}
                        {b.status?.toLowerCase() !== 'cancelled' && (
                          <button 
                            onClick={() => updateStatus(b.id, 'Cancelled')} 
                            title={isAr ? 'إلغاء الحجز' : 'Cancel Booking'}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        )}

                        {/* Edit Booking */}
                        <button 
                          onClick={() => {
                            setEditForm({ ...b });
                            setIsEditing(true);
                          }} 
                          title={isAr ? 'تعديل الحجز' : 'Edit Booking'}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete Booking */}
                        <button 
                          onClick={() => handleDelete(b.id)} 
                          title={isAr ? 'حذف الحجز' : 'Delete Booking'}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
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

              {/* Guest & Trip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'بيانات الضيف' : 'Guest Information'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'الاسم:' : 'Name:'}</strong> {selectedBooking.customerName || 'N/A'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'الهاتف:' : 'Phone:'}</strong> {selectedBooking.customerPhone || selectedBooking.phone || 'N/A'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'البريد:' : 'Email:'}</strong> {selectedBooking.customerEmail || 'N/A'}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'الرحلة والسيارة' : 'Trip & Vehicle'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'السيارة:' : 'Vehicle:'}</strong> {selectedBooking.vehicleNameSnapshot || 'VIP Vehicle'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'التاريخ والوقت:' : 'Schedule:'}</strong> {selectedBooking.date} at {selectedBooking.time || 'Flexible'}</div>
                  <div><strong className="text-slate-800">{isAr ? 'السعة:' : 'Capacity:'}</strong> {selectedBooking.passengers || 1} Passengers, {selectedBooking.luggage || 0} Bags</div>
                </div>
              </div>

              {/* Route Display */}
              <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-200 text-xs">
                <div className="font-bold text-[var(--color-dark-charcoal)] mb-2">{isAr ? 'خط السير' : 'Routing Details'}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2.5 rounded-lg bg-white border border-gray-200 font-semibold text-slate-800">
                    <span className="text-gray-700 block text-[10px] uppercase font-bold">{isAr ? 'نقطة الانطلاق / الاستقبال' : 'Pickup Location'}</span>
                    {selectedBooking.pickup}
                  </div>
                  <div className="text-gray-600 font-bold">➔</div>
                  <div className="flex-1 p-2.5 rounded-lg bg-white border border-gray-200 font-semibold text-slate-800">
                    <span className="text-gray-700 block text-[10px] uppercase font-bold">{isAr ? 'الوجهة / الفندق' : 'Drop-off Location'}</span>
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
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateStatus(selectedBooking.id, 'Confirmed')}
                  className="px-3.5 py-2 rounded-xl bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-emerald)] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isAr ? 'تأكيد الحجز' : 'Mark Confirmed'}</span>
                </button>
                <button 
                  onClick={() => updateStatus(selectedBooking.id, 'Completed')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  <span>{isAr ? 'اكتملت الرحلة' : 'Mark Completed'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleWhatsApp(selectedBooking)}
                  className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                </button>
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
                    <option value="Confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="Pending">{isAr ? 'قيد الانتظار' : 'Pending'}</option>
                    <option value="Completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                    <option value="Cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                  </select>
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
