import React, { useEffect, useState } from 'react';
import { 
  Search, MessageCircle, Phone, Mail, Download, UserCheck, 
  Award, Calendar, Banknote, ArrowUpRight, CheckCircle, X, Shield, Trash2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CustomersAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fetchCustomers = () => {
    fetch('/api/admin/customers', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(data => { setCustomers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا العميل وسجله؟' : 'Delete this customer record permanently?')) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        showToast(isAr ? 'تم حذف العميل بنجاح' : 'Customer deleted successfully');
        fetchCustomers();
      }
    } catch (e) {
      alert("Failed to delete customer");
    }
  };

  const handleWhatsApp = (customer: any) => {
    const rawPhone = customer.whatsapp || customer.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert(isAr ? "رقم الهاتف غير متوفر" : "Phone number not available");
      return;
    }

    const greeting = isAr
      ? `السلام عليكم ورحمة الله وبركاته، الأستاذ/ة ${customer.name || ''}، تحياتنا لك من إدارة الصفوة لنقل المعتمرين VIP. كيف يمكننا خدمتك اليوم؟`
      : `Assalamu Alaikum / Greetings Mr/Ms ${customer.name || ''}, this is Al-Safwa VIP Umrah Luxury Transport. How may we assist you today?`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  const exportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Total Spent (SAR)', 'Last Booking Date'];
    const rows = customers.map(c => [
      `"${c.name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.totalBookings || 0,
      c.totalSpent || 0,
      `"${c.lastBookingDate ? new Date(c.lastBookingDate).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alsafwa_customers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم تصدير قائمة العملاء بنجاح' : 'Customer list exported successfully');
  };

  const filtered = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 rounded-xl bg-[var(--color-saudi-emerald)] text-white shadow-lg flex items-center justify-between text-sm font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'سجل عملاء وضيوف الرحمن' : 'Pilgrim & Customer Directory'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'قاعدة بيانات المعتمرين والزوار مع سجل الحجوزات والتواصل المباشر' : 'Umrah guests history, lifetime spending, and direct VIP communication'}
          </p>
        </div>

        <button 
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Download size={15} />
          <span>{isAr ? 'تصدير كـ CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Search Bar & Summary Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <UserCheck size={16} className="text-gray-700" />
            <span>{isAr ? 'إجمالي العملاء المسجلين:' : 'Total Pilgrims:'}</span>
            <span className="text-[var(--color-dark-charcoal)] font-extrabold">{customers.length}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 font-bold text-slate-700">
            <Award size={16} className="text-amber-700" />
            <span>{isAr ? 'عملاء VIP دائمين:' : 'Repeat VIPs:'}</span>
            <span className="text-amber-800 font-extrabold">{customers.filter(c => (c.totalBookings || 0) > 1).length}</span>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم، الإيميل، أو رقم الجوال...' : 'Search pilgrim name, email, phone...'} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'اسم الضيف / المعتمر' : 'Guest / Pilgrim Name'}</th>
                <th className="p-4">{isAr ? 'معلومات التواصل' : 'Contact Information'}</th>
                <th className="p-4">{isAr ? 'سجل الحجوزات والإنفاق' : 'Trip Volume & Spent'}</th>
                <th className="p-4">{isAr ? 'آخر نشاط' : 'Last Activity'}</th>
                <th className="p-4 text-right">{isAr ? 'تواصل فوري' : 'Direct Dispatch'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">{isAr ? 'جاري تحميل قاعدة بيانات العملاء...' : 'Loading pilgrims database...'}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">{isAr ? 'لا يوجد عملاء مطابقين للبحث' : 'No customers match your search'}</td></tr>
              ) : (
                filtered.map(c => {
                  const isVIP = (c.totalBookings || 0) >= 2 || (c.totalSpent || 0) >= 1000;
                  return (
                    <tr key={c.id || c.email} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{c.name}</span>
                          {isVIP && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                              <Shield size={10} className="fill-amber-600" />
                              <span>VIP Pilgrim</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{c.city || 'KSA Visitor'}</div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" />
                          <span>{c.email || '-'}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1" dir="ltr">
                          <Phone size={12} className="text-gray-700" />
                          <span>{c.phone || '-'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-extrabold text-slate-900">{c.totalBookings || 1}</span> {isAr ? 'رحلات' : 'trips'}
                        </div>
                        <div className="text-xs font-extrabold text-gray-900 mt-0.5">
                          {c.totalSpent || 0} SAR
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{c.lastBookingDate ? new Date(c.lastBookingDate).toLocaleDateString() : (isAr ? 'حديث' : 'Recent')}</span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleWhatsApp(c)} 
                            title={isAr ? 'مراسلة عبر واتساب' : 'Chat on WhatsApp'} 
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle size={14} className="text-gray-700" />
                            <span>WhatsApp</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(c.id)} 
                            title={isAr ? 'حذف العميل' : 'Delete Customer'} 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
