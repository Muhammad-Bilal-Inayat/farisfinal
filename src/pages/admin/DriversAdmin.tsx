import React, { useEffect, useState } from 'react';
import { 
  UserCheck, Plus, Search, Edit2, Trash2, Phone, Car, 
  CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface DriverItem {
  id: number;
  name: string;
  phone: string;
  vehicleInfo?: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export default function DriversAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleInfo: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDrivers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/drivers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      vehicleInfo: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: DriverItem) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      vehicleInfo: driver.vehicleInfo || '',
      status: driver.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(isAr ? 'يرجى إدخال اسم السائق ورقم الجوال / الواتساب' : 'Please enter driver name and phone/WhatsApp');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingDriver 
        ? `/api/admin/drivers/${editingDriver.id}` 
        : '/api/admin/drivers';
      const method = editingDriver ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(
          editingDriver
            ? (isAr ? 'تم تحديث بيانات السائق بنجاح' : 'Driver updated successfully')
            : (isAr ? 'تمت إضافة السائق بنجاح' : 'Driver added successfully')
        );
        setIsModalOpen(false);
        fetchDrivers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save driver');
      }
    } catch (e) {
      alert(isAr ? 'حدث خطأ في الاتصال بالخادم' : 'Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (driver: DriverItem) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    const nextStatus = driver.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/drivers/${driver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(
          isAr 
            ? `تم ${nextStatus === 'active' ? 'تفعيل' : 'تعطيل'} السائق ${driver.name}`
            : `Driver ${driver.name} is now ${nextStatus}`
        );
        fetchDrivers();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (driver: DriverItem) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في حذف السائق (${driver.name}) نهائياً؟ الحجوزات السابقة ستحتفظ بنسخة من بيانات السائق.`
      : `Are you sure you want to delete driver ${driver.name}? Historical bookings will preserve their assigned snapshot.`;
    
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/drivers/${driver.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(isAr ? 'تم حذف السائق بنجاح' : 'Driver deleted successfully');
        fetchDrivers();
      }
    } catch (e) {
      alert('Failed to delete driver');
    }
  };

  const handleWhatsAppDriver = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert(isAr ? 'رقم الهاتف غير صالح' : 'Invalid phone number');
      return;
    }
    const msg = isAr 
      ? `السلام عليكم كابتن ${name}، تحية طيبة من إدارة شركة فارس لنقل المعتمرين.`
      : `Salam Captain ${name}, greetings from Faris VIP Umrah Transport dispatch.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      (d.vehicleInfo || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  const activeCount = drivers.filter(d => d.status === 'active').length;
  const inactiveCount = drivers.filter(d => d.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-[var(--color-saudi-emerald)] text-white shadow-lg flex items-center justify-between text-sm font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[var(--color-saudi-green)] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <UserCheck size={14} />
            <span>{isAr ? 'لوحة تحكم السائقين المعتمدين' : 'Admin Driver Dispatch'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAr ? 'إدارة قائمة السائقين' : 'Chauffeurs & Driver Fleet'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr 
              ? 'إضافة وتعديل بيانات السائقين لتعيينهم مباشرة على رحلات ضيوف الرحمن بنقرة واحدة' 
              : 'Manage active drivers to effortlessly assign them to guest bookings with automatic WhatsApp dispatch'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={fetchDrivers}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} />
          </button>

          <button 
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>{isAr ? 'إضافة سائق جديد' : 'Add New Driver'}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">{isAr ? 'إجمالي السائقين' : 'Total Drivers'}</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{drivers.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700">{isAr ? 'السائقين النشطين (جاهز للتعيين)' : 'Active Drivers (Ready)'}</div>
            <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">{isAr ? 'غير متاح / معطل' : 'Inactive Drivers'}</div>
            <div className="text-xl font-extrabold text-slate-600 mt-0.5">{inactiveCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، الجوال، أو نوع السيارة...' : 'Search by name, phone, or vehicle...'}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({drivers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {isAr ? 'النشطين' : 'Active'} ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'inactive' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'المعطلين' : 'Inactive'} ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Driver List Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-8 h-8 border-3 border-[var(--color-saudi-green)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">{isAr ? 'جاري تحميل قائمة السائقين...' : 'Loading drivers...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <UserCheck size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">{isAr ? 'لا يوجد سائقين مطابقين' : 'No drivers found'}</h3>
          <p className="text-xs text-slate-400 mt-1">{isAr ? 'ابدأ بإضافة أول سائق في النظام' : 'Add your first driver to assign them to bookings'}</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-[var(--color-saudi-green)] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            {isAr ? 'إضافة سائق جديد' : 'Add New Driver'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 sm:p-4">{isAr ? 'اسم السائق' : 'Driver Name'}</th>
                  <th className="p-3.5 sm:p-4">{isAr ? 'رقم الجوال / واتساب' : 'Mobile / WhatsApp'}</th>
                  <th className="p-3.5 sm:p-4">{isAr ? 'المركبة / اللوحة' : 'Vehicle Info'}</th>
                  <th className="p-3.5 sm:p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5 sm:p-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {driver.name.charAt(0) || 'D'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{driver.name}</div>
                          <div className="text-[10px] text-slate-400">ID #{driver.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span>{driver.phone}</span>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppDriver(driver.phone, driver.name)}
                          className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={isAr ? 'مراسلة عبر واتساب' : 'Message on WhatsApp'}
                        >
                          <MessageCircle size={14} className="text-emerald-600" />
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 sm:p-4 text-slate-600">
                      {driver.vehicleInfo ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          <Car size={12} className="text-slate-500" />
                          <span>{driver.vehicleInfo}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">{isAr ? 'غير محدد' : 'Not specified'}</span>
                      )}
                    </td>

                    <td className="p-3.5 sm:p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(driver)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          driver.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={isAr ? 'انقر لتغيير الحالة' : 'Click to toggle status'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        <span>{driver.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}</span>
                      </button>
                    </td>

                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppDriver(driver.phone, driver.name)}
                          className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                          title={isAr ? 'مراسلة واتساب' : 'WhatsApp Driver'}
                        >
                          <MessageCircle size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(driver)}
                          className="p-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          title={isAr ? 'تعديل السائق' : 'Edit Driver'}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(driver)}
                          className="p-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                          title={isAr ? 'حذف السائق' : 'Delete Driver'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingDriver 
                    ? (isAr ? 'تعديل بيانات السائق' : 'Edit Driver') 
                    : (isAr ? 'إضافة سائق جديد' : 'Add New Driver')}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم السائق' : 'Driver Name'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: أحمد علي' : 'e.g. Ahmed Ali'}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'رقم الجوال / الواتساب' : 'Mobile / WhatsApp Number'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  placeholder={isAr ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'يُفضل إدخال الرقم مع مفتاح الدولة (مثل +966)' : 'Include country code e.g. +966 for direct WhatsApp link'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'اسم المركبة أو رقم اللوحة (اختياري)' : 'Vehicle Name or Vehicle Number (Optional)'}
                </label>
                <input 
                  type="text"
                  placeholder={isAr ? 'مثال: جمس يوكون 2025 - أ ب ج 1234' : 'e.g. GMC Yukon XL 2025 - ABC 1234'}
                  value={formData.vehicleInfo}
                  onChange={e => setFormData({ ...formData, vehicleInfo: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAr ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none bg-white cursor-pointer"
                >
                  <option value="active">{isAr ? 'نشط (متاح لتعيين الرحلات)' : 'Active (Available for assignments)'}</option>
                  <option value="inactive">{isAr ? 'معطل / غير متاح' : 'Inactive (Off-duty / unavailable)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--color-saudi-green)] hover:bg-[var(--color-saudi-emerald)] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting 
                    ? (isAr ? 'جاري الحفظ...' : 'Saving...') 
                    : (editingDriver ? (isAr ? 'حفظ التعديلات' : 'Update Driver') : (isAr ? 'إضافة السائق' : 'Add Driver'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
