import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, MapPin, Search, Sparkles, CheckCircle, 
  Star, ArrowRight, X, AlertCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RoutesAdmin() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>({});
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchData = async () => {
    try {
      let data: any[] | null = null;
      const token = localStorage.getItem('adminToken');
      if (token) {
        const res = await fetch('/api/admin/trip_routes', { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) { 
          const d = await res.json(); 
          if (Array.isArray(d)) data = d;
        }
      }

      // Fallback to public endpoints so routes are never empty
      if (!data || data.length === 0) {
        const fb = await fetch('/api/trip_routes', { cache: 'no-store' });
        if (fb.ok) {
          const d = await fb.json();
          if (Array.isArray(d)) data = d;
        }
      }

      setRoutes(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) { 
      console.error(e); 
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = current.id ? 'PUT' : 'POST';
    const url = current.id ? `/api/admin/trip_routes/${current.id}` : '/api/admin/trip_routes';
    try {
      const res = await fetch(url, { 
        method, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        }, 
        body: JSON.stringify(current) 
      });
      if (res.ok) {
        showToast(isAr ? 'تم حفظ المسار وتحديث الموقع بنجاح' : 'Route saved and synced to website successfully');
        setIsEditing(false);
        fetchData();
        window.dispatchEvent(new CustomEvent('faris_routes_updated'));
      }
    } catch (e) { alert("Failed to save route"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المسار نهائياً؟" : "Delete this route forever?")) return;
    try {
      const res = await fetch(`/api/admin/trip_routes/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      if (res.ok) {
        showToast(isAr ? 'تم حذف المسار' : 'Route deleted');
        fetchData();
        window.dispatchEvent(new CustomEvent('faris_routes_updated'));
      }
    } catch (e) { alert("Failed to delete"); }
  };

  const toggleFeatured = async (r: any) => {
    try {
      const res = await fetch(`/api/admin/trip_routes/${r.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ ...r, isFeatured: !r.isFeatured })
      });
      if (res.ok) {
        showToast(isAr ? 'تم تحديث التمييز' : 'Featured status updated');
        fetchData();
        window.dispatchEvent(new CustomEvent('faris_routes_updated'));
      }
    } catch (e) { console.error(e); }
  };

  const applyPreset = (p: { pickup: string, destination: string, nameEn: string, nameAr: string, isFeatured: boolean }) => {
    setCurrent({
      ...current,
      pickup: p.pickup,
      destination: p.destination,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      isFeatured: p.isFeatured,
      status: 'active',
      displayOrder: routes.length + 1
    });
  };

  const filtered = routes.filter(r => 
    (r.nameEn || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.nameAr || '').includes(search) ||
    (r.pickup || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.destination || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

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
            {isAr ? 'مسارات ووجهات النقل المعتمدة' : 'Trip Routes & Destinations'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'إدارة محطات الوصول والانطلاق والمزارات والمسارات المميزة' : 'Manage airport transfers, intercity Umrah corridors, and Ziyarat tours'}
          </p>
        </div>

        <button 
          onClick={() => { 
            setCurrent({ pickup: '', destination: '', nameEn: '', nameAr: '', displayOrder: routes.length + 1, isFeatured: false, status: 'active' }); 
            setIsEditing(true); 
          }} 
          className="px-4 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isAr ? '+ إضافة مسار جديد' : '+ Add Route'}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex justify-between items-center">
        <div className="text-xs font-bold text-slate-500">
          {isAr ? 'إجمالي المسارات:' : 'Total Routes:'} <span className="text-slate-900">{routes.length}</span>
        </div>

        <div className="relative w-72">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالمسار أو المدينة...' : 'Search route, pickup, city...'} 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-dark-charcoal)] text-[11px] uppercase font-bold tracking-wider text-white border-b border-gray-800">
                <th className="p-4">{isAr ? 'اسم المسار (إنجليزي / عربي)' : 'Route Name (EN / AR)'}</th>
                <th className="p-4">{isAr ? 'الانطلاق والوجهة' : 'Pickup ➔ Destination'}</th>
                <th className="p-4">{isAr ? 'الترتيب والتمييز' : 'Order & Feature'}</th>
                <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm font-medium divide-y divide-gray-200 text-[var(--color-dark-charcoal)]">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">{isAr ? 'جاري تحميل المسارات...' : 'Loading routes...'}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">{isAr ? 'لا توجد مسارات مطابقة' : 'No routes found'}</td></tr>
              ) : (
                paginated.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{r.nameEn}</span>
                        {r.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            <Star size={10} className="fill-amber-600 text-amber-600" />
                            <span>{isAr ? 'مميز' : 'Featured'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5" dir="rtl">{r.nameAr}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-600 shrink-0" />
                        <span>{r.pickup}</span>
                        <ArrowRight size={12} className="text-slate-400" />
                        <span>{r.destination}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{isAr ? 'ترتيب' : 'Order'}: <strong className="text-slate-800">{r.displayOrder || 0}</strong></span>
                        <button
                          onClick={() => toggleFeatured(r)}
                          className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${r.isFeatured ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600'}`}
                          title={isAr ? 'تبديل التمييز' : 'Toggle Featured'}
                        >
                          <Star size={14} className={r.isFeatured ? 'fill-amber-500' : ''} />
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'active' ? 'bg-gray-200 text-gray-900' : 'bg-slate-100 text-slate-600'}`}>
                        {r.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => { setCurrent(r); setIsEditing(true); }} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(r.id)} 
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

      {/* CREATE / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {current.id ? (isAr ? 'تعديل المسار' : 'Edit Route') : (isAr ? 'إضافة مسار جديد' : 'Add Route')}
              </h2>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Quick Umrah Presets */}
            {!current.id && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50/60 border border-gray-200">
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-dark-charcoal)] mb-2">
                  <Sparkles size={14} className="text-gray-700" />
                  <span>{isAr ? 'مسارات العمرة الشائعة (نقرة واحدة للإضافة):' : 'Popular Umrah Route Presets:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { pickup: 'Jeddah Airport (JED)', destination: 'Makkah Hotel', nameEn: 'JED Airport ➔ Makkah Hotel', nameAr: 'مطار جدة ➔ فندق مكة المكرمة', isFeatured: true },
                    { pickup: 'Makkah Hotel', destination: 'Madinah Hotel', nameEn: 'Makkah ➔ Madinah Intercity Transfer', nameAr: 'مكة المكرمة ➔ المدينة المنورة', isFeatured: true },
                    { pickup: 'Madinah Airport (MED)', destination: 'Madinah Hotel', nameEn: 'Madinah Airport ➔ Madinah Hotel', nameAr: 'مطار المدينة ➔ فندق المدينة', isFeatured: false },
                    { pickup: 'Makkah Hotel', destination: 'Makkah Ziyarat Sites', nameEn: 'Makkah Historic Ziyarat Tour (Hira, Thowr, Arafat)', nameAr: 'مزارات مكة المكرمة (غار حراء، ثور، عرفات)', isFeatured: true },
                    { pickup: 'Madinah Hotel', destination: 'Madinah Ziyarat Sites', nameEn: 'Madinah Historic Ziyarat (Quba, Uhud, Qiblatayn)', nameAr: 'مزارات المدينة المنورة (قباء، أحد، القبلتين)', isFeatured: true }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-900 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-left"
                    >
                      + {preset.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'نقطة الانطلاق (Pickup)' : 'Pickup'}</label>
                  <input 
                    type="text" 
                    value={current.pickup || ''} 
                    onChange={e => setCurrent({ ...current, pickup: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الوجهة (Destination)' : 'Destination'}</label>
                  <input 
                    type="text" 
                    value={current.destination || ''} 
                    onChange={e => setCurrent({ ...current, destination: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الاسم بالإنجليزية' : 'Name (EN)'}</label>
                  <input 
                    type="text" 
                    value={current.nameEn || ''} 
                    onChange={e => setCurrent({ ...current, nameEn: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الاسم بالعربية' : 'Name (AR)'}</label>
                  <input 
                    type="text" 
                    value={current.nameAr || ''} 
                    onChange={e => setCurrent({ ...current, nameAr: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none text-right" 
                    dir="rtl" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'ترتيب العرض' : 'Display Order'}</label>
                  <input 
                    type="number" 
                    value={current.displayOrder || 0} 
                    onChange={e => setCurrent({ ...current, displayOrder: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الحالة' : 'Status'}</label>
                  <select 
                    value={current.status || 'active'} 
                    onChange={e => setCurrent({ ...current, status: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--color-saudi-green)] outline-none"
                  >
                    <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isAr ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={current.isFeatured || false} 
                  onChange={e => setCurrent({ ...current, isFeatured: e.target.checked })} 
                  className="rounded text-gray-600 focus:ring-[var(--color-saudi-green)] w-4 h-4"
                /> 
                <span>{isAr ? 'تمييز هذا المسار في الواجهة الرئيسية' : 'Feature this route on the booking form'}</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[var(--color-saudi-emerald)] hover:bg-[var(--color-saudi-green)] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  {isAr ? 'حفظ المسار' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
